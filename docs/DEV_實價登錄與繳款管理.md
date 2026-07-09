# 開發文件：實價登錄管理＋繳款管理

> 版本：v1.0（2026-07-09）
> 讀者：後端／前端工程師、AI 開發代理
> 搭配閱讀：`SPEC_實價登錄與繳款管理.md`（業務規格）
> 原型程式碼（行為即規格，實作前先跑一次原型對照）：
> - `declaration-status-list.html` — 實價登錄狀況表
> - `sales-control.html` — 銷控表（僅實價登錄提醒部分）
> - `payment-schedule-management.html` — 繳款期別管理
> - `house-management.html` — 繳款紀錄管理（含戶別款項、合約及附件）

---

## 1. 資料模型（建議 Schema）

原型以 in-memory 物件實作，以下為對應的正式資料表建議。命名可依團隊慣例調整，**欄位與關聯不可省略**。

### 1.1 實價登錄

```
DeclarationRecord（實價登錄紀錄，1:1 對應成交戶）
├─ id
├─ deal_id            FK → 銷控成交戶（唯一）
├─ actual_date        date, nullable      -- 實際登錄日期（行政填）
├─ serial             varchar, nullable   -- 實價登錄序號（行政填）
├─ canceled_at        date, nullable      -- 解約日期（有值＝已解約）
├─ canceled_note      text, nullable      -- 解約備註
├─ created_by / updated_by / timestamps

NotifyLog（通知紀錄，1:N）
├─ id
├─ deal_id            FK
├─ type               enum('auto','manual')
├─ sent_at            datetime
├─ targets            json                -- [{role:'sales', user_id}, {role:'pm', user_id}]
├─ message            text
```

**衍生欄位（不落庫，查詢時計算）**：
- `notify_date` ＝ 簽約日 +25 天
- `due_date` ＝ 簽約日 +30 天
- `status` ＝ 見 §3.1 狀態機

### 1.2 繳款管理

```
PaymentTemplate（期別範本）
├─ id
├─ name               varchar, unique
├─ timestamps

TemplateStage（範本期別，1:N，有序）
├─ id
├─ template_id        FK
├─ seq                int                 -- 範本內順序
├─ stage_name         varchar
├─ pct                decimal(5,2)        -- 繳款比例 %
├─ due_rule           varchar             -- 應繳時點規則（見 §3.3）

ProjectTemplate（建案套用，一案一範本）
├─ project_id         FK → 建案（唯一）
├─ template_id        FK
├─ applied_at

HousePayment（戶別繳款主檔，1:1 對應已售出戶）
├─ id
├─ house_id           FK → 銷控戶別（唯一）
├─ contract_code      varchar, nullable   -- 合約代碼（本模組可維護）
├─ memo               text, nullable
├─ stage_order        json, nullable      -- 自訂期別順序 ["訂金","簽約款",...]

PaymentStage（戶別期別實例）
├─ id
├─ house_payment_id   FK
├─ stage_name         varchar             -- 同戶內唯一
├─ origin             enum('template','parking_auto','manual')
├─ extra_type         enum('車位加購','客變追加','其他'), nullable  -- origin≠template 時必填
├─ due_date           date, nullable
├─ due_amount         bigint              -- 元
├─ amount_overridden  bool default false  -- origin=template 且金額被人工調整過
├─ reason             text, nullable      -- 手動新增之事由（manual 必填）
├─ source_ref         varchar, nullable   -- parking_auto 時記銷控車位異動 id

PaymentReceipt（繳款登錄，期別 1:1 或 1:N 皆可，原型為累計制 1:1）
├─ id
├─ payment_stage_id   FK
├─ paid_date          date
├─ paid_amount        bigint              -- 累計實繳
├─ method             enum('匯款','支票','現金','刷卡')
├─ memo               text
├─ created_by / timestamps

PaymentProof（繳款證明附件，1:N，累加不覆蓋）
├─ id
├─ payment_stage_id   FK
├─ file_path / file_name / uploaded_by / uploaded_at

ContractAttachment（合約及附件）
├─ id
├─ house_payment_id   FK
├─ file_name / file_type（合約|附件）/ file_path / uploaded_by / uploaded_at
```

### 1.3 與銷控（既有系統）的整合點

| 資料 | 方向 | 說明 |
|------|------|------|
| 成交戶清單（含所有權人＝購買人姓名、簽約日期） | 銷控 → 本模組 | 繳款紀錄與實價登錄的資料來源；**只讀** |
| 原合約總價、房屋金額、每坪單價、車位號碼、車位金額 | 銷控 → 繳款 | 唯讀帶入；為對帳錨點 |
| 車位加購事件 | 銷控 → 繳款 | 事件觸發自動建 PaymentStage（見 §3.4） |
| 建案的業務與專案負責人 | 銷控/建案管理 → 實價登錄 | 通知對象解析 |

---

## 2. API 端點建議

```
# 實價登錄
GET    /api/declarations?project=&cust=&sales=&status=&sign_from=&sign_to=&todo_only=
GET    /api/declarations/stats?（同上查詢參數）          -- 依建案分組統計
PUT    /api/declarations/{deal_id}/register              -- {actual_date, serial}
POST   /api/declarations/{deal_id}/notify                -- {targets:[], message}
PUT    /api/declarations/{deal_id}/cancel                -- {canceled_at, note}
DELETE /api/declarations/{deal_id}/cancel                -- 取消解約註記
GET    /api/declarations/export

# 期別範本
GET    /api/payment-templates?name=&project=             -- project 參數＝建案反查
POST   /api/payment-templates                            -- {name, stages:[{stage_name,pct,due_rule}]}
PUT    /api/payment-templates/{id}
POST   /api/payment-templates/{id}/copy
GET    /api/payment-templates/{id}/projects?kw=          -- 已套用建案（可搜尋）
POST   /api/payment-templates/{id}/apply                 -- {project_ids:[]}；回應含 overwritten 清單

# 戶別繳款
GET    /api/house-payments?project=&unit=&memo=
GET    /api/house-payments/{house_id}/stages             -- 含展開後期別＋狀態＋摘要
PUT    /api/house-payments/{house_id}/stages             -- 統一儲存：{stage_order:[], amounts:{stage:amt}}（後端執行 §3.5 驗證）
POST   /api/house-payments/{house_id}/stages             -- 手動新增期款
DELETE /api/house-payments/{house_id}/stages/{stage_id}  -- 僅 origin='manual'
POST   /api/payment-stages/{id}/receipts                 -- 登錄繳款（multipart 含證明檔）
PUT    /api/house-payments/{house_id}/contract           -- {contract_code, memo}
POST   /api/house-payments/{house_id}/attachments
```

---

## 3. 核心邏輯（必須與原型行為一致）

### 3.1 實價登錄狀態機

```
if (canceled_at)                          → 已解約        # 最高優先
else if (actual_date && actual_date <= due_date) → 已登錄（準時）
else if (actual_date)                     → 已登錄（逾期）
else if (today > due_date)                → 未登錄・已逾期
else                                      → 未登錄・期限內
```
- `due_date = sign_date + 30天`、`notify_date = sign_date + 25天`
- 狀態一律計算取得，**禁止存欄位**（避免與日期資料不一致）

### 3.2 自動通知排程

- 每日排程：撈 `notify_date <= today` 且 `actual_date IS NULL` 且未解約且未發過 auto 通知的成交戶
- 對象：該戶業務＋該建案專案負責人；寫入 NotifyLog(type='auto')
- 發送管道由基礎建設決定（系統訊息／Email），原型僅示意

### 3.3 期別展開演算法（繳款）

```
輸入：原合約總價 total（銷控）、範本 stages、金額覆寫 overrides、追加期款 extras
輸出：該戶完整期別清單

allocated = 0
for (i, s) in stages:
    # 最後一期吸收尾差：default_amt = total - Σ(前面各期 default_amt)，保證預設拆分合計 == total
    default_amt = (i == 最後一期) ? total - allocated : round(total * s.pct / 100)
    allocated += default_amt              # 尾差累計一律以「預設值」計，金額覆寫不影響其他期的預設拆分
    due_amt = overrides[s.stage_name] ?? default_amt
    due_date = resolveDueRule(s.due_rule, sign_date)
followed by extras（依 stage_order 排序；未入序者附於最後）
```

**注意**：尾差吸收只發生在展開計算的預設值；一旦有 override，系統**不自動重算**其他期別，
平衡責任交給使用者調整＋儲存時的對帳驗證（§3.5 第 1 條）。

`resolveDueRule`：
- `下訂當日` → 簽約日
- `簽約後 N 天`（regex `^簽約後 (\d+) 天$`）→ 簽約日 + N
- 其他（開工日、工程節點…）→ 不產日期，前端顯示規則文字；日期由工程進度確定後補

### 3.4 車位加購自動同步

- 監聽銷控「車位加購」事件（新增車位且勾加購）
- 自動建立 PaymentStage：`origin='parking_auto'`、`extra_type='車位加購'`、`due_amount=車位價格`、`due_date=加購日+7天`、`stage_name='車位加購款（車位號碼）'`、`source_ref=車位異動id`
- **本模組不可刪除** parking_auto 期款；退訂操作發生在銷控端，本模組**監聽銷控「車位退訂」事件**，以 `source_ref` 找到對應期款自動沖銷——產生負向調整期款或標記作廢（擇一，團隊定案後兩處一致），不物理刪除，保留軌跡
- 手動補登的車位加購（origin='manual'、extra_type='車位加購'）不參與事件沖銷，由行政自行維護

### 3.5 儲存驗證（後端必須重驗，不能只靠前端）

統一儲存（順序＋金額）時：
1. **對帳平衡**：Σ(origin='template' 期別 due_amount) === 原合約總價，不等 → 422，回差額
2. **不低於已繳**：每期 due_amount ≥ 該期累計實繳，違者 → 422，回期別名與金額
3. 手動新增期款：extra_type 必填、stage_name 同戶唯一、due_amount > 0、reason 必填
4. 登錄繳款：paid_date 必填、paid_amount > 0、method 必填
5. 實價登錄：actual_date ≥ sign_date、serial 必填；解約：canceled_at ≥ sign_date
6. 刪除期款：僅 origin='manual'；有繳款紀錄時要求 `force=true` 參數（前端做強確認）

### 3.6 繳款狀態機

```
if (paid_amount >= due_amount && due_amount > 0) → 已繳
else if (paid_amount > 0)                        → 部分繳
else if (due_date && today > due_date)           → 逾期未繳
else                                             → 未到期
```

---

## 4. 前端行為要點（原型已實作，可直接對照）

| 行為 | 原型位置 | 要點 |
|------|----------|------|
| 期別拖拉排序 | house-management.html `#__payTbody__` | HTML5 DnD；草稿制，儲存才寫入；未儲存關閉跳確認 |
| 對帳平衡列 | 同上 `#__balanceBar__` | input 事件即時重算；綠✓／紅✗＋差額 |
| 金額編輯 | 同上 `.__amtInput__` | inline input；「已調整」標示於比例欄 |
| 繳款證明 | 同上 `#__rcProof__` | multiple；累加顯示既有檔案 |
| 範本收合 | payment-schedule-management.html | 預設收合；expandedTpls Set 保留搜尋後狀態 |
| 套用搜尋式選案 | 同上 openApplyModal | 無關鍵字不列建案；覆蓋需 confirm |
| 解約註記 | declaration-status-list.html openCancelModal | 原資料留存；列淡化；退出逾期與通知 |
| 統計依建案 | 同上 renderStats | 查詢後才顯示；含已解約欄與總計列 |

## 5. 權限建議

| 動作 | 建議角色 |
|------|----------|
| 實價登錄登錄／修改／解約註記 | 行政 |
| 手動通知 | 行政、主管 |
| 期別範本維護、套用建案 | 主管／專案 |
| 戶別期款金額調整、新增/刪除期款 | 行政（金額調整可考慮加主管覆核） |
| 登錄繳款＋上傳證明 | 行政 |
| 匯出 | 依現行報表權限 |

## 6. 已知未決事項

1. 車位加購繳款時點目前定為「加購日 +7 天一次繳清」；若出現分期需求需擴充
2. 通知發送管道（系統訊息／Email／兩者）未定案
3. 金額調整是否需主管覆核流程，待營運確認
4. 匯出格式（Excel 欄位）沿用各頁列表欄位，細節實作時確認
