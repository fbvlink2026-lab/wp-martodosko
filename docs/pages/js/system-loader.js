// =========================================================
// 🧠 WP MARTODOSKO — SYSTEM-LOADER.JS
// ✅ TAMA ANG PAGKAKASUNOD + CACHE-BUSTING + WALANG HIHINTAYIN
// =========================================================

let currentPage = 'dashboard';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('📦 system-loader: Nagsisimula...');

  // ✅ KAILANGANG NASA TAMANG LUGAR — kasing folder ng admin.html
  const SIDEBAR_URL = 'sidebar.html';  // ✅ TAMA — kaparehong folder /pages/

  try {
    // ✅ LAGING BAGO — WALANG CACHE
    const res = await fetch(`${SIDEBAR_URL}?v=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!res.ok) throw new Error(`Hindi makuha ang sidebar: ${res.status}`);

    const html = await res.text();
    document.getElementById('sidebar-placeholder').innerHTML = html;
    console.log('✅ Sidebar naipasok');

    // ✅ SIGURADUHIN HANDANG-HANDA NA ANG LAHAT BAGO TUMULOY
    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ TAWAGIN ANG USER STATUS — NASA logic.js NA ITO
    if (typeof updateUserStatusDisplay === 'function') {
      updateUserStatusDisplay();
      console.log('✅ updateUserStatusDisplay tumakbo');
    } else {
      console.warn('⚠️ updateUserStatusDisplay hindi pa handa');
    }

    // ✅ SIMULAN ANG DASHBOARD — NASA logic.js NA ANG loadPage!
    setTimeout(() => {
      if (typeof loadPage === 'function') {
        console.log('📄 Tinatakbo ang loadPage(dashboard)...');
        loadPage('dashboard');
      } else {
        console.error('❌ loadPage HINDI MAHANAP!');
        document.getElementById('page-content').innerHTML = `
          <div style="padding:30px;color:#d63638;background:#fbeaea;border-left:4px solid #d63638;margin:20px;">
            <h3>❌ loadPage function HINDI MAHANAP</h3>
            <p>Hindi matagpuan ang kinakailangang function. Siguraduhing tama ang pagkakasunod ng mga script.</p>
          </div>`;
      }
    }, 200);

  } catch (err) {
    console.error('❌ Sidebar error:', err);
    document.getElementById('sidebar-placeholder').innerHTML = `
      <div style="padding:20px;color:#d63638;background:#fbeaea;">
        ❌ Hindi makuha ang sidebar.html<br>
        <small>${err.message}</small>
      </div>`;
  }
});

// ✅ TUMATANGAP NG SENYAL MULA SA SIDEBAR — itinatago/ipinapakita ang laman
document.body.addEventListener('sidebarToggled', e => {
  const wrapper = document.getElementById('content-wrapper');
  if (wrapper) {
    wrapper.classList.toggle('sidebar-closed', e.detail.closed);
  }
});
