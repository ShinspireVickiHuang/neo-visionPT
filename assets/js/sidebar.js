/* 共用左側選單載入器
   - 載入 partials/sidebar.html 注入到 #sidebar
   - 根據當前檔名自動展開父選單、標 active
   - 點父選單可展開/收合
*/
(function () {
  const root = document.getElementById('sidebar');
  if (!root) return;

  // 檔名 → 葉節點 data-page-key 對應
  // 新增頁面時：在這裡多加一筆對應，沒有就用檔名直接對應
  const PAGE_MAP = {
    'building-list':       'building-list',
    'building-edit':       'building-list',     // 編輯仍歸建案管理底下
    'sales-control':       'sales-control',
    'commission-list':     'commission-list',
    'commission-print':    'commission-list',
    'house-viewing-list':   'house-viewing-list',
    'weekly-report-list':   'weekly-report-list',
    'media-cost-list':      'media-cost-list',
    'media-cost-monthly':   'media-cost-list',
    'estimate-cost-list':   'estimate-cost-list',
    'estimate-cost-edit':   'estimate-cost-list',
  };

  fetch('assets/partials/sidebar.html?v=' + Date.now())
    .then(r => r.text())
    .then(html => {
      root.innerHTML = html;

      // 父選單展開/收合
      root.querySelectorAll('[data-parent]').forEach(li => {
        const head = li.querySelector('[data-parent-head]');
        const body = li.querySelector('[data-children]');
        const arrow = head.querySelector('[data-lucide="chevron-down"]');
        head.addEventListener('click', () => {
          const open = body.style.display !== 'none';
          body.style.display = open ? 'none' : 'block';
          if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
        });
      });

      // 自動標記當前頁
      const fileBase = (location.pathname.split('/').pop() || '').replace('.html','');
      const key = PAGE_MAP[fileBase] || fileBase;
      const target = root.querySelector(`[data-page-key="${key}"]`);
      if (target) {
        target.classList.add('active-menu', 'font-bold');
        target.classList.remove('text-gray-600');

        // 葉節點若在「父選單」內 → 展開父並把父變藍
        const parentLi = target.closest('[data-parent]');
        if (parentLi) {
          const body = parentLi.querySelector('[data-children]');
          if (body) body.style.display = 'block';
          const head = parentLi.querySelector('.menu-head');
          if (head) {
            head.classList.add('text-blue-600');
            const span = head.querySelector('span');
            if (span) span.classList.add('font-bold');
            const icon = head.querySelector('i');
            if (icon) icon.classList.remove('text-gray-400');
          }
        }
      }

      // 重畫 lucide 圖示
      if (window.lucide) lucide.createIcons();
    })
    .catch(err => console.error('sidebar 載入失敗', err));
})();
