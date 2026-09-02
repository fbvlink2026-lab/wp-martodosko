let currentPage = 'dashboard';
let currentFile = '';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // ✅ PAREHONG FOLDER — WALANG ../ KAILANGAN!
    const res = await fetch('sidebar.html');
    if (res.ok) {
      document.getElementById('sidebar-placeholder').innerHTML = await res.text();
      setTimeout(() => {
        if (typeof updateUserStatusDisplay === 'function') updateUserStatusDisplay();
      }, 120);
    }
  } catch (e) { console.error('Sidebar error:', e); }

  setTimeout(() => loadPage('dashboard'), 200);
});

// ✅ TUMATANGAP NG SENYAL MULA SA SIDEBAR
document.body.addEventListener('sidebarToggled', e => {
  const wrapper = document.getElementById('content-wrapper');
  if (wrapper) {
    wrapper.classList.toggle('sidebar-closed', e.detail.closed);
  }
});

async function loadPage(pageId) {
  document.querySelectorAll('.menu-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
  currentPage = pageId;

  const area = document.getElementById('page-content');
  area.innerHTML = `<div style="padding:40px;text-align:center;"><p>⏳ Binabasa: ${pageId}...</p></div>`;

  try {
    // ✅ TAMA — docs/pages/content/
    const res = await fetch(`content/${pageId}.html`);
    if (!res.ok) throw new Error(`Hindi mabasa: ${pageId}`);
    area.innerHTML = await res.text();
    runScriptsIn(area);
    document.title = pageId.charAt(0).toUpperCase() + pageId.slice(1) + ' — WP Martodosko';
  } catch (err) {
    area.innerHTML = `<div class="card" style="border-left:4px solid #d63638;"><h3>❌ Hindi Mabuksan</h3><p>${err.message}</p></div>`;
  }
}

function runScriptsIn(container) {
  container.querySelectorAll('script').forEach(luma => {
    const bago = document.createElement('script');
    bago.textContent = luma.textContent;
    Array.from(luma.attributes).forEach(a => bago.setAttribute(a.name, a.value));
    document.head.appendChild(bago).remove();
  });
}
