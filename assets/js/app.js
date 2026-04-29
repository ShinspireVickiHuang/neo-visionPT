/* ============================================================
   銷控系統 — 前端腳本（Tailwind 版）
   架構：
     menus[]   側邊選單資料（含 lucide 圖示名）
     modules{} 模組路由（key → render()）
   新增模組：
     1) 在 menus 對應分類加入 { key, label } 子選單
     2) 在 modules 註冊 key + title + render()
     3) 若需自訂版型，於 index.html 新增 <template id="module-XXX">
   ============================================================ */

// ---------- 1. 選單資料 ----------
const menus = [
  { label: "系統管理",     icon: "settings",     children: [] },
  { label: "每日來電管理", icon: "file-text",    children: [] },
  { label: "預約管理",     icon: "calendar",     children: [] },
  { label: "賞屋管理",     icon: "home",         children: [] },
  { label: "客戶資料管理", icon: "users",        children: [] },
  {
    label: "建案管理",
    icon: "building-2",
    children: [
      { key: "building-list",  label: "建案管理" },
      { key: "building-form",  label: "表單管理" },
      { key: "building-unit",  label: "戶別管理" },
      { key: "building-park",  label: "車位管理" },
      { key: "building-price", label: "底價管理" }
    ]
  },
  { label: "代銷公司管理", icon: "briefcase",    children: [] },
  { label: "標籤管理",     icon: "tag",          children: [] },
  { label: "銷控管理",     icon: "layout-grid",  children: [] },
  {
    label: "報表管理",
    icon: "bar-chart-2",
    open: true,
    children: [
      { key: "report-pl",     label: "損益表" },
      { key: "report-daily",  label: "日報表" },
      { key: "report-weekly", label: "週報表" },
      { key: "report-media",  label: "媒體銷售分析" }
    ]
  }
];

// ---------- 2. 模組註冊 ----------
const modules = {
  "report-weekly": {
    title: "報表管理 / 週報表",
    render: () => {
      const node = cloneTemplate("module-report-weekly");
      const tbody = node.querySelector("#weeklyReportRows");
      weeklyReportData.forEach((row, i) => tbody.appendChild(buildWeeklyRow(row, i)));
      return node;
    }
  },
  "building-list": {
    title: "建案管理 / 建案管理",
    render: () => {
      const node = cloneTemplate("module-building-list");
      const tbody = node.querySelector("#buildingRows");
      buildingsData.forEach((row, i) => tbody.appendChild(buildBuildingRow(row, i)));
      // 事件委派：點擊 tbody 內任一動作按鈕都能觸發
      tbody.addEventListener("click", e => {
        const btn = e.target.closest("[data-act]");
        if (!btn) return;
        const tr = btn.closest("tr");
        const id = Number(tr?.dataset.id);
        const row = buildingsData.find(r => r.id === id);
        if (!row) return;
        if (btn.dataset.act === "edit") openBuildingEditModal(row);
      });
      return node;
    }
  }
  // 範例 — 要新增「日報表」模組時：
  // "report-daily": {
  //   title: "報表管理 / 日報表",
  //   render: () => { ... 回傳一個 element ... }
  // }
};

// ---------- 3. 範例資料 ----------
const weeklyReportData = [
  {
    period: "week1",
    dateStart: "2026-03-19", dateEnd: "2026-03-19",
    budgetTotal: 123, budgetActual: 123, ratio: "123",
    weekly: "123", nextWeek: "123123",
    createdAt: "2026-03-19 03:35:31",
    updatedAt: "2026-03-24 07:55:16"
  },
  {
    period: "2026-02-13",
    dateStart: "2026-02-13", dateEnd: "2026-02-13",
    budgetTotal: 1, budgetActual: 1, ratio: "1",
    weekly: "測試", nextWeek: "測試",
    createdAt: "2026-02-13 02:51:19",
    updatedAt: "2026-02-13 02:51:19"
  },
  {
    period: "0212測試",
    dateStart: "2026-02-12", dateEnd: "2026-02-12",
    budgetTotal: 1, budgetActual: 1, ratio: "1",
    weekly: "測試", nextWeek: "測試",
    createdAt: "2026-02-12 06:26:02",
    updatedAt: "2026-02-12 06:26:02"
  },
  {
    period: "測試",
    dateStart: "2026-02-11", dateEnd: "2026-02-11",
    budgetTotal: 1, budgetActual: 1, ratio: "1",
    weekly: "測試", nextWeek: "測試",
    createdAt: "2026-02-12 06:19:02",
    updatedAt: "2026-02-12 06:19:02"
  }
];

const buildingsData = [
  {
    id: 11,
    code: "123asd",
    name: "画世代",
    // 地段
    city: "",            // 截圖顯示「請選擇縣市」
    district: "",        // 截圖顯示「請選擇鄉鎮」
    address: "台北市信義區信義路125號",
    blockCount: 2,
    agencies: "北區,南區,外島,新理想,元捷整合行銷,聯碩,Unicorn,莉薇",
    contact: "李xx陳xx",
    status: "已開案",
    openDate: "2024-03-08",
    commissionRate: "",   // 新欄位，預設空
    customerForm: "",     // 客資表單：請選擇
    callForm: "8888-2(22)",
    shareReservation: false,
    shareCalendar: false,
    shareSalesControl: false,
    proxySign: false,
    splitSales: "關閉",
    privacy: ""           // null
  },
  {
    id: 12,
    code: "TheTop",
    name: "TheTop",
    city: "",
    district: "",
    address: "新北市新莊區",
    blockCount: 3,
    agencies: "北區,南區,東區,新高創,元捷整合行銷,聯碩,莉薇",
    contact: "王小明",
    status: "已開案",
    openDate: "2024-03-08",
    commissionRate: "",
    customerForm: "",
    callForm: "8888-2(22)",
    shareReservation: false,
    shareCalendar: false,
    shareSalesControl: false,
    proxySign: false,
    splitSales: "關閉",
    privacy: ""
  }
];

// ---------- 4. 渲染：側邊選單 ----------
function renderSidebar() {
  const sidebar = document.getElementById("sidebar");
  const nav = document.createElement("nav");
  nav.className = "py-4";
  const ul = document.createElement("ul");
  ul.className = "space-y-1";

  menus.forEach((m, idx) => {
    const li = document.createElement("li");
    li.dataset.menuIdx = idx;
    if (m.open) li.dataset.open = "1";

    // 父項目列
    const head = document.createElement("div");
    head.className = "px-4 py-3 flex items-center justify-between sidebar-item cursor-pointer";
    head.innerHTML = `
      <div class="flex items-center gap-3 menu-head-text">
        <i data-lucide="${m.icon || "circle"}" class="w-5 h-5 text-gray-400"></i>
        <span class="text-sm font-medium">${m.label}</span>
      </div>
      <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400 transition-transform"></i>
    `;
    li.appendChild(head);

    // 子選單
    if (m.children && m.children.length) {
      const sub = document.createElement("ul");
      sub.className = "bg-gray-50 py-1";
      sub.style.display = m.open ? "block" : "none";

      m.children.forEach(c => {
        const sli = document.createElement("li");
        sli.className = "pl-12 pr-4 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer";
        sli.textContent = c.label;
        sli.dataset.key = c.key;
        sli.addEventListener("click", () => navigate(c.key, c.label, m.label));
        sub.appendChild(sli);
      });
      li.appendChild(sub);

      head.addEventListener("click", () => {
        const isOpen = sub.style.display !== "none";
        sub.style.display = isOpen ? "none" : "block";
        const arrow = head.querySelector('[data-lucide="chevron-down"]');
        if (arrow) arrow.style.transform = isOpen ? "rotate(0deg)" : "rotate(180deg)";
      });
    }

    ul.appendChild(li);
  });

  nav.appendChild(ul);
  sidebar.innerHTML = "";
  sidebar.appendChild(nav);
}

// ---------- 5. 路由 ----------
function navigate(key, label, parentLabel) {
  // 子項目選中樣式
  document.querySelectorAll('#sidebar [data-key]').forEach(el => {
    el.classList.remove("active-menu", "font-bold");
    el.classList.add("text-gray-600");
  });
  const target = document.querySelector(`#sidebar [data-key="${key}"]`);
  if (target) {
    target.classList.add("active-menu", "font-bold");
    target.classList.remove("text-gray-600");
  }

  // 父項目強調（藍色）
  document.querySelectorAll('#sidebar .menu-head-text').forEach(el => {
    el.classList.remove("menu-parent-active");
    el.querySelectorAll("i").forEach(i => i.classList.remove("text-blue-600"));
  });
  if (target) {
    const parentLi = target.closest("li[data-menu-idx]");
    if (parentLi) {
      const head = parentLi.querySelector(".menu-head-text");
      if (head) {
        head.classList.add("menu-parent-active");
        head.querySelectorAll("i").forEach(i => i.classList.add("text-blue-600"));
      }
    }
  }

  // 渲染主內容
  const main = document.getElementById("main");
  main.innerHTML = "";

  const mod = modules[key];
  if (mod) {
    main.appendChild(mod.render());
  } else {
    const node = cloneTemplate("module-placeholder");
    node.querySelector('[data-bind="breadcrumb"]').textContent = `${parentLabel} / ${label}`;
    node.querySelector('[data-bind="title"]').textContent = label;
    main.appendChild(node);
  }

  // 重新初始化 Lucide 圖示（新加進來的 DOM 也需要）
  if (window.lucide) lucide.createIcons();
}

// ---------- 6. 列：週報表 ----------
function buildWeeklyRow(row, i) {
  const tr = document.createElement("tr");
  tr.className = i % 2 === 1 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50";

  const [createdDate, createdTime] = (row.createdAt || " ").split(" ");
  const [updatedDate, updatedTime] = (row.updatedAt || " ").split(" ");

  tr.innerHTML = `
    <td class="p-3">${row.period}</td>
    <td class="p-3">${row.dateStart}</td>
    <td class="p-3">${row.dateEnd}</td>
    <td class="p-3 text-center">${row.budgetTotal}</td>
    <td class="p-3 text-center">${row.budgetActual}</td>
    <td class="p-3">${row.ratio}</td>
    <td class="p-3 text-gray-500">${row.weekly}</td>
    <td class="p-3 text-gray-500">${row.nextWeek}</td>
    <td class="p-3 text-xs leading-tight">${createdDate}<br>${createdTime || ""}</td>
    <td class="p-3 text-xs leading-tight">${updatedDate}<br>${updatedTime || ""}</td>
    <td class="p-3">
      <div class="flex flex-col gap-1 items-center">
        <div class="flex gap-1">
          <button class="border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-100">
            <i data-lucide="edit-3" class="w-3 h-3"></i> 編輯
          </button>
          <button class="border border-red-300 text-red-500 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-red-50">
            <i data-lucide="trash-2" class="w-3 h-3"></i> 刪除
          </button>
        </div>
        <button class="border border-gray-300 text-gray-400 px-2 py-1 rounded text-xs w-full hover:bg-gray-100">
          <i data-lucide="search" class="w-3 h-3 inline"></i> 未結報表
        </button>
      </div>
    </td>
  `;
  return tr;
}

// ---------- 6b. 列：建案管理 ----------
function buildBuildingRow(row, i) {
  const tr = document.createElement("tr");
  tr.className = i % 2 === 1 ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-gray-50";
  tr.dataset.id = row.id;
  tr.innerHTML = `
    <td class="p-3 align-top">${row.id}</td>
    <td class="p-3 align-top">${row.code}</td>
    <td class="p-3 align-top">${row.name}</td>
    <td class="p-3 align-top">${row.address}</td>
    <td class="p-3 align-top">${row.blockCount}</td>
    <td class="p-3 align-top max-w-[180px] whitespace-normal leading-relaxed">${row.agencies}</td>
    <td class="p-3 align-top">${row.contact}</td>
    <td class="p-3 align-top">${row.status}</td>
    <td class="p-3 align-top">
      <div class="flex flex-wrap gap-1 items-start min-w-[260px]">
        <button data-act="edit" onclick="openBuildingEditModal(${row.id})" class="border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-100">
          <i data-lucide="edit-3" class="w-3 h-3"></i> 編輯
        </button>
        <button class="border border-red-300 text-red-500 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-red-50">
          <i data-lucide="trash-2" class="w-3 h-3"></i> 刪除
        </button>
        <button class="border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-100">
          <i data-lucide="home" class="w-3 h-3"></i> 查看房屋資料
        </button>
        <button class="border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-100">
          <i data-lucide="car" class="w-3 h-3"></i> 查看車位
        </button>
        <button class="border border-gray-300 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-gray-100">
          <i data-lucide="tag" class="w-3 h-3"></i> 建案標籤
        </button>
      </div>
    </td>
  `;
  tr.querySelector('[data-act="edit"]').addEventListener("click", () => openBuildingEditModal(row));
  return tr;
}

// ---------- 6c. 彈窗：建案編輯（自包版，不依賴 template） ----------
window.openBuildingEditModal = function(rowOrId) {
  const row = (typeof rowOrId === "object")
    ? rowOrId
    : buildingsData.find(r => r.id === Number(rowOrId));
  if (!row) return;

  // 移除舊彈窗
  const old = document.getElementById("__buildingEditModal__");
  if (old) old.remove();

  const v = (s) => (s == null ? "" : String(s).replace(/"/g, "&quot;"));

  const modal = document.createElement("div");
  modal.id = "__buildingEditModal__";
  modal.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.45);display:flex;align-items:flex-start;justify-content:center;padding:24px;overflow-y:auto;font-family:-apple-system,'PingFang TC','Microsoft JhengHei',sans-serif;";

  const fieldRow = (label, control, required = false) => `
    <div style="display:grid;grid-template-columns:160px 1fr;gap:16px;align-items:start;padding:6px 0;">
      <label style="font-size:14px;color:#374151;padding-top:8px;">${label}${required ? ' <span style="color:#ef4444;">*</span>' : ''}</label>
      <div style="font-size:14px;">${control}</div>
    </div>`;

  const inputStyle = "width:100%;border:1px solid #d1d5db;border-radius:4px;padding:8px 12px;font-size:14px;background:#f9fafb;box-sizing:border-box;";

  const toggleHtml = (field, on) => `
    <button type="button" data-toggle data-field="${field}"
      style="position:relative;width:44px;height:24px;border-radius:9999px;border:0;cursor:pointer;background:${on ? '#3b82f6' : '#d1d5db'};">
      <span style="position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s;transform:translateX(${on ? '20px' : '0'});display:block;"></span>
    </button>`;

  modal.innerHTML = `
    <div style="background:#fff;border-radius:8px;width:100%;max-width:760px;box-shadow:0 20px 50px rgba(0,0,0,0.25);display:flex;flex-direction:column;max-height:calc(100vh - 48px);">
      <div style="padding:16px 24px;border-bottom:1px solid #e5e7eb;font-weight:bold;font-size:16px;">編輯</div>

      <div style="padding:20px 24px;overflow-y:auto;flex:1;">
        ${fieldRow("建案名稱", `<input type="text" data-field="name" value="${v(row.name)}" style="${inputStyle}">`, true)}
        ${fieldRow(`案件編號 <span style="color:#ef4444;font-size:12px;">限制100字</span>`, `<input type="text" maxlength="100" data-field="code" value="${v(row.code)}" style="${inputStyle}">`, true)}
        ${fieldRow(`跑單登入圖片<div style="color:#ef4444;font-size:12px;margin-top:2px;">640px*970px</div><a href="#" style="color:#3b82f6;font-size:12px;text-decoration:underline;">下載</a>`,
          `<div style="display:flex;align-items:center;gap:8px;"><div style="width:48px;height:48px;background:#dbeafe;border:1px solid #d1d5db;border-radius:4px;flex-shrink:0;"></div><input type="file" style="font-size:12px;"></div>`)}
        ${fieldRow(`跑單首頁圖片 <span style="color:#ef4444;font-size:12px;">1600px*400px</span><br><a href="#" style="color:#3b82f6;font-size:12px;text-decoration:underline;">下載</a>`,
          `<div style="display:flex;align-items:center;gap:8px;"><div style="width:64px;height:32px;background:#dbeafe;border:1px solid #d1d5db;border-radius:4px;flex-shrink:0;"></div><input type="file" style="font-size:12px;"></div>`)}
        ${fieldRow("地段", `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
              <div>
                <div style="font-size:12px;margin-bottom:4px;">縣市 <span style="color:#ef4444;">*</span></div>
                <select data-field="city" style="${inputStyle}">
                  <option value="">請選擇縣市</option>
                  <option ${row.city==='台北市'?'selected':''}>台北市</option>
                  <option ${row.city==='新北市'?'selected':''}>新北市</option>
                  <option ${row.city==='桃園市'?'selected':''}>桃園市</option>
                  <option ${row.city==='台中市'?'selected':''}>台中市</option>
                  <option ${row.city==='台南市'?'selected':''}>台南市</option>
                  <option ${row.city==='高雄市'?'selected':''}>高雄市</option>
                </select>
              </div>
              <div>
                <div style="font-size:12px;margin-bottom:4px;">鄉鎮 <span style="color:#ef4444;">*</span></div>
                <select data-field="district" style="${inputStyle}">
                  <option value="">請選擇鄉鎮</option>
                </select>
              </div>
            </div>
            <input type="text" data-field="address" value="${v(row.address)}" placeholder="詳細地址" style="${inputStyle}">
          </div>`)}
        ${fieldRow("棟數", `<span style="color:#374151;">${v(row.blockCount)}</span>`)}
        ${fieldRow("代銷公司", `<span style="color:#374151;line-height:1.6;">${v(row.agencies)}</span>`)}
        ${fieldRow("相關人員", `<input type="text" data-field="contact" value="${v(row.contact)}" style="${inputStyle}">`)}
        ${fieldRow("狀態", `
          <select data-field="status" style="${inputStyle}">
            <option ${row.status==='已開案'?'selected':''}>已開案</option>
            <option ${row.status==='未開案'?'selected':''}>未開案</option>
            <option ${row.status==='結案'?'selected':''}>結案</option>
          </select>`, true)}
        ${fieldRow("開案日期", `<input type="date" data-field="openDate" value="${v(row.openDate || '2024-03-08')}" style="${inputStyle}">`, true)}
        ${fieldRow("可請佣金(%)", `<div style="display:flex;align-items:center;gap:6px;"><input type="number" min="0" max="100" step="0.01" data-field="commissionRate" value="${v(row.commissionRate)}" placeholder="0.00" style="${inputStyle};max-width:200px;"><span style="color:#6b7280;font-size:12px;">%</span></div>`)}
        ${fieldRow("客資表單", `<select data-field="customerForm" style="${inputStyle}"><option value="">請選擇</option></select>`)}
        ${fieldRow("來電表單", `<select data-field="callForm" style="${inputStyle}"><option ${row.callForm==='8888-2(22)'?'selected':''}>8888-2(22)</option></select>`)}
        ${fieldRow("跑單預約資料共享", toggleHtml("shareReservation", row.shareReservation))}
        ${fieldRow("跑單行事曆共享", toggleHtml("shareCalendar", row.shareCalendar))}
        ${fieldRow("跑單銷控表", toggleHtml("shareSalesControl", row.shareSalesControl))}
        ${fieldRow("是否代簽", toggleHtml("proxySign", row.proxySign))}
        ${fieldRow("開啟業務拆分", `
          <select data-field="splitSales" style="${inputStyle}">
            <option ${row.splitSales==='關閉'?'selected':''}>關閉</option>
            <option ${row.splitSales==='開啟'?'selected':''}>開啟</option>
          </select>`, true)}
        ${fieldRow("隱私權條款(個資聲明)", `<textarea data-field="privacy" rows="3" placeholder="null" style="${inputStyle};resize:vertical;">${v(row.privacy)}</textarea>`)}
      </div>

      <div style="padding:16px 24px;border-top:1px solid #e5e7eb;background:#f9fafb;display:flex;justify-content:center;gap:12px;">
        <button id="__btnConfirm__" style="background:#a09080;color:#fff;border:0;padding:8px 32px;border-radius:4px;cursor:pointer;font-size:14px;">確定</button>
        <button id="__btnCancel__" style="background:#ef4444;color:#fff;border:0;padding:8px 32px;border-radius:4px;cursor:pointer;font-size:14px;">取消</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 點擊背景關閉
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });

  // 取消
  modal.querySelector("#__btnCancel__").addEventListener("click", () => modal.remove());

  // 切換 toggle
  modal.querySelectorAll("[data-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const on = btn.style.background === "rgb(59, 130, 246)" || btn.dataset.on === "1";
      const next = !on;
      btn.dataset.on = next ? "1" : "0";
      btn.style.background = next ? "#3b82f6" : "#d1d5db";
      btn.querySelector("span").style.transform = `translateX(${next ? "20px" : "0"})`;
    });
    if (btn.style.background.includes("59, 130, 246") || btn.style.background.includes("#3b82f6")) {
      btn.dataset.on = "1";
    }
  });

  // 確定：收集資料
  modal.querySelector("#__btnConfirm__").addEventListener("click", () => {
    const result = { id: row.id };
    modal.querySelectorAll("[data-field]").forEach(el => {
      if (el.tagName === "SPAN") return;
      result[el.dataset.field] = el.value;
    });
    modal.querySelectorAll("[data-toggle]").forEach(btn => {
      result[btn.dataset.field] = btn.dataset.on === "1";
    });
    console.log("建案編輯送出資料：", result);
    modal.remove();
  });
};

// ---------- 7. 工具 ----------
function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  return tpl.content.firstElementChild.cloneNode(true);
}

// ---------- 8. 啟動 ----------
document.addEventListener("DOMContentLoaded", () => {
  renderSidebar();
  navigate("report-weekly", "週報表", "報表管理");

  document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("hidden");
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    alert("登出（請接後端 API）");
  });

  if (window.lucide) lucide.createIcons();
});
