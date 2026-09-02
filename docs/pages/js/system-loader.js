let currentPage = 'dashboard';
let currentFile = '';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('../sidebar.html');
    if (res.ok) {
      document.getElementById('sidebar-container').innerHTML = await res.text();
      setTimeout(() => { if (typeof updateUserStatus === 'function') updateUserStatus(); }, 80);
    }
  } catch (e) { console.error('Sidebar error:', e); }
  setTimeout(() => loadPage('dashboard'), 200);
});

async function loadPage(pageId) {
  document.querySelectorAll('.menu-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
  currentPage = pageId;
  const area = document.getElementById('page-content');
  area.innerHTML = `<div style="padding:40px;text-align:center;"><p>⏳ Binabasa: ${pageId}...</p></div>`;
  try {
    const res = await fetch(`content/${pageId}.html`);
    if (!res.ok) throw new Error(`Hindi mabasa: ${pageId}`);
    area.innerHTML = await res.text();
    runScriptsIn(area);
    document.title = pageId.charAt(0).toUpperCase() + pageId.slice(1) + ' — WP Martodosko';
  } catch (err) {
    area.innerHTML = `<div class="card" style="border-left:4px solid #d63638;"><h3>❌ Hindi Mabuksan</h3><p>${err.message}</p></div>`;
  }
}

function runScriptsIn(c) {
  c.querySelectorAll('script').forEach(o => {
    const n=document.createElement('script'); n.textContent=o.textContent; document.head.appendChild(n).remove();
  });
}