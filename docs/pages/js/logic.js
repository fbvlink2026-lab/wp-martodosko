// =========================================================
// 🧠 WP MARTODOSKO — KUMPLETONG INAYOS NA LOGIC.JS
// ✅ LAHAT NG FUNCTIONS NASA LOOB — WALANG HIHINTAYIN
// ✅ loadPage + runScriptsIn — NANDITO NA RIN!
// ✅ Cache-busting — laging bago ang pahina
// =========================================================

// ✅ NAKA-TABI — GINAGAMIT NG ENCRYPTION
const STORAGE_MASTER_KEY = 'master-lock-key-only-local-not-sent-123!';

// 🔐 SESSION CONSTANTS
const SESSION_KEY = 'wp_session_active';
const SESSION_EXPIRY = 'wp_session_expiry';
const SESSION_USER = 'wp_gh_user';
const SESSION_DURATION = 2 * 60 * 60 * 1000; // ⏰ 2 oras

// 📋 KASALUKUYANG ESTADO
let currentPage = 'dashboard';
let draggedElement = null;
let ENVIRONMENT = { isApp: false, isBrowser: true };
let IS_ONLINE = navigator.onLine;
let sessionTimer = null;

// =========================================================
// 🔐 SESSION MANAGEMENT
// =========================================================
function iMayActiveSession() {
  const active = localStorage.getItem(SESSION_KEY) === 'true';
  const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
  return active && Date.now() < expiry;
}

function iLumikhaNgSession() {
  localStorage.setItem(SESSION_KEY, 'true');
  localStorage.setItem(SESSION_EXPIRY, Date.now() + SESSION_DURATION);
  renderSidebarMenu();
}

function iTapusinAngSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY);
  localStorage.removeItem(SESSION_USER);
  if (sessionTimer) clearInterval(sessionTimer);
  renderSidebarMenu();
}

function iKuninNatitirangOras() {
  const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
  const natitira = expiry - Date.now();
  if (natitira <= 0) return [0, 0];
  const oras = Math.floor(natitira / (1000 * 60 * 60));
  const minuto = Math.floor((natitira % (1000 * 60 * 60)) / (1000 * 60));
  return [oras, minuto];
}

function iSimulanSessionCountdown(elId = 'session-timer') {
  if (sessionTimer) clearInterval(sessionTimer);
  const update = () => {
    const el = document.getElementById(elId);
    if (!el) return;
    const [oras, minuto] = iKuninNatitirangOras();
    if (oras <= 0 && minuto <= 0) {
      el.textContent = '❌ Nag-expire na';
      iTapusinAngSession();
      window.loadPage?.('login');
      return;
    }
    el.textContent = `${oras}h ${minuto}m natitira`;
  };
  update();
  sessionTimer = setInterval(update, 30000);
}

function iPalawiginSession() {
  localStorage.setItem(SESSION_EXPIRY, Date.now() + SESSION_DURATION);
  alert('✅ Pinalawig pa ng 2 oras ang sesyon!');
}

// =========================================================
// 📄 PAHINA PAGKARGA — NASA LOOB NA! HINDI NA HIHINTAYIN!
// =========================================================
window.loadPage = async function loadPage(pageId) {
  document.querySelectorAll('.menu-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageId);
  });
  currentPage = pageId;

  const area = document.getElementById('page-content');
  if (!area) return;

  area.innerHTML = `<div style="padding:40px;text-align:center;"><p>⏳ Binabasa: ${pageId}...</p></div>`;

  try {
    // ✅ LAGING BAGO — WALANG CACHE!
    const res = await fetch(`content/${pageId}.html?v=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    if (!res.ok) throw new Error(`Hindi mabasa: ${pageId}`);
    area.innerHTML = await res.text();
    runScriptsIn(area);
    document.title = pageId.charAt(0).toUpperCase() + pageId.slice(1) + ' — WP Martodosko';
  } catch (err) {
    area.innerHTML = `<div style="padding:25px;text-align:center;border-left:4px solid #d63638;background:#fbeaea;margin:15px;border-radius:4px;">
      <h3 style="color:#d63638;margin:0 0 8px 0;">❌ Hindi Mabuksan</h3>
      <p style="margin:0;">${err.message}</p>
    </div>`;
  }
};

function runScriptsIn(container) {
  container.querySelectorAll('script').forEach(luma => {
    const bago = document.createElement('script');
    bago.textContent = luma.textContent;
    Array.from(luma.attributes).forEach(a => bago.setAttribute(a.name, a.value));
    luma.parentNode.replaceChild(bago, luma);
  });
}

// =========================================================
// 📋 MENU — NAKATAGO HANGGANG MAG-LOGIN
// =========================================================
const DEFAULT_MENU = [
  { id: 'dashboard', label: '📊 Dashboard', page: 'dashboard', visible: true, requireLogin: true },
  { id: 'articles', label: '📝 Mga Artikulo', page: 'articles', visible: true, requireLogin: true },
  { id: 'settings', label: '⚙️ Mga Setting', page: 'settings', visible: true, requireLogin: true },
  { id: 'css-merger', label: '🎨 Ayusin CSS', page: 'css-merger', visible: true, requireLogin: true },
  { id: 'setup-token', label: '🔑 Token Setup', page: 'setup-token', visible: true, requireLogin: false },
  { id: 'organizer', label: '🛠️ Tagapag-ayos', page: 'organizer', visible: true, requireLogin: true },
  { id: 'editor', label: '✏️ File Editor', page: 'editor', visible: true, requireLogin: true },
  { id: 'newpage', label: '➕ Bagong Pahina', page: 'newpage', visible: true, requireLogin: true },
  { id: 'login', label: '🔐 Akawnt', page: 'login', visible: true, requireLogin: false }
];

// =========================================================
// 📱 DETECTOR NG KAPALIGARAN
// =========================================================
function detectEnvironment() {
  const ua = navigator.userAgent;
  ENVIRONMENT.isApp = /wv|WebView|Android|iPhone|iPad|Capacitor|Cordova/.test(ua) || window.Android !== undefined;
  ENVIRONMENT.isBrowser = !ENVIRONMENT.isApp;
  const el = document.getElementById('env-type');
  if (el) el.textContent = ENVIRONMENT.isApp ? '📱 App' : '🌐 Browser';
}

// =========================================================
// 📡 KATAYUAN NG KONEKSYON
// =========================================================
function updateConnectionStatus() {
  IS_ONLINE = navigator.onLine;
  const badge = document.getElementById('connection-badge');
  if (!badge) return;
  if (IS_ONLINE) {
    badge.textContent = 'ONLINE';
    badge.classList.add('online');
    hideOfflineNotice();
  } else {
    badge.textContent = 'OFFLINE';
    badge.classList.remove('online');
    showOfflineNotice();
  }
}

function showOfflineNotice() {
  if (document.getElementById('global-offline-notice')) return;
  const bar = document.createElement('div');
  bar.id = 'global-offline-notice';
  bar.style.cssText = 'position:fixed;top:0;left:180px;right:0;padding:8px 15px;background:#d63638;color:white;z-index:9999;font-size:14px;';
  bar.innerHTML = '⚠️ WALANG INTERNET — Naka-save muna sa Lokal. Awtomatikong isesend kapag nakabalik ang koneksyon.';
  document.body.prepend(bar);
  const wrapper = document.getElementById('content-wrapper');
  if (wrapper) wrapper.style.marginTop = '38px';
}

function hideOfflineNotice() {
  const bar = document.getElementById('global-offline-notice');
  if (bar) {
    bar.remove();
    const wrapper = document.getElementById('content-wrapper');
    if (wrapper) wrapper.style.marginTop = '0';
  }
  setTimeout(() => synchronizeNow(), 1500);
}

window.addEventListener('online', () => { IS_ONLINE = true; updateConnectionStatus(); });
window.addEventListener('offline', () => { IS_ONLINE = false; updateConnectionStatus(); });

// =========================================================
// 📋 MENU RENDER — NAKATAGO KUNG HINDI NAKA-LOGIN
// =========================================================
function getMenuLayout() {
  const s = localStorage.getItem('wp_sidebar_layout');
  return s ? JSON.parse(s) : [...DEFAULT_MENU];
}

function saveMenuLayout(layout) {
  localStorage.setItem('wp_sidebar_layout', JSON.stringify(layout));
}

function renderSidebarMenu() {
  const m = document.getElementById('dynamic-menu');
  if (!m) return;
  const layout = getMenuLayout();
  m.innerHTML = '';

  layout.forEach(item => {
    if (item.requireLogin && !iMayActiveSession()) return;
    if (!item.visible) return;

    const btn = document.createElement('button');
    btn.className = `menu-item ${currentPage === item.page ? 'active' : ''}`;
    btn.dataset.page = item.page;
    btn.dataset.id = item.id;
    btn.draggable = true;

    btn.innerHTML = `
      <span onclick="loadPage('${item.page}')">${item.label}</span>
      <span class="drag-handle" style="color:#aaa;cursor:move;user-select:none;">⋮⋮</span>
    `;

    btn.addEventListener('dragstart', handleDragStart);
    btn.addEventListener('dragover', handleDragOver);
    btn.addEventListener('dragleave', handleDragLeave);
    btn.addEventListener('drop', handleDrop);
    btn.addEventListener('dragend', handleDragEnd);

    m.appendChild(btn);
  });
}

// 🖐️ DRAG-AND-DROP
function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', this.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) { e.preventDefault(); if (this !== draggedElement) this.classList.add('drag-over'); }
function handleDragLeave() { this.classList.remove('drag-over'); }
function handleDrop(e) {
  e.preventDefault(); this.classList.remove('drag-over');
  if (!draggedElement || this === draggedElement) return;
  const layout = getMenuLayout();
  const fromId = draggedElement.dataset.id;
  const toId = this.dataset.id;
  const fromIdx = layout.findIndex(x => x.id === fromId);
  const toIdx = layout.findIndex(x => x.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;
  const [moved] = layout.splice(fromIdx, 1);
  layout.splice(toIdx, 0, moved);
  saveMenuLayout(layout);
  renderSidebarMenu();
}
function handleDragEnd() {
  document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('dragging', 'drag-over'));
  draggedElement = null;
}

// 📤 MGA PUBLIKONG UTOS
window.getSidebarLayout = getMenuLayout;
window.saveSidebarLayout = saveMenuLayout;
window.resetSidebarLayout = () => { localStorage.removeItem('wp_sidebar_layout'); renderSidebarMenu(); };
window.toggleMenuItemVisibility = (id, visible) => {
  const layout = getMenuLayout();
  const item = layout.find(x => x.id === id);
  if (item) { item.visible = visible; saveMenuLayout(layout); renderSidebarMenu(); }
};
window.addNewMenuItem = (id, label, page, pos = null) => {
  const layout = getMenuLayout();
  if (layout.find(x => x.id === id)) return false;
  const newItem = { id, label, page, visible: true, requireLogin: true };
  pos !== null ? layout.splice(pos, 0, newItem) : layout.push(newItem);
  saveMenuLayout(layout); renderSidebarMenu(); return true;
};
window.deleteMenuItem = id => {
  let layout = getMenuLayout().filter(x => x.id !== id);
  saveMenuLayout(layout); renderSidebarMenu();
};

// =========================================================
// ✅ USER STATUS — TUGMA SA sidebar.html
// =========================================================
function updateUserStatusDisplay() {
  const user = localStorage.getItem('wp_gh_user');
  const display = document.getElementById('user-display');
  const btn = document.getElementById('logout-btn');
  if (user && display) {
    display.textContent = '👤 ' + user;
    display.classList.add('online');
    if (btn) btn.style.display = 'inline-block';
  } else if (display) {
    display.textContent = '🔐 Hindi Naka-setup';
    display.classList.remove('online');
    if (btn) btn.style.display = 'none';
  }
}
window.updateUserStatusDisplay = updateUserStatusDisplay;

// =========================================================
// 📦 GITHUB REPO
// =========================================================
const GH_API_BASE = 'https://api.github.com';
let NAPILING_REPO = null;

window.iHanapinMgaRepo = async function(username, token) {
  if (!username || !token) return { ok: false, error: 'Kailangan ang Username at Token' };
  try {
    const sagot = await fetch(`${GH_API_BASE}/users/${username}/repos?per_page=100&sort=pushed`, {
      headers: { 'Authorization': `token ${token}` }
    });
    if (!sagot.ok) throw new Error(`Code: ${sagot.status}`);
    return { ok: true, repos: await sagot.json() };
  } catch (mali) { return { ok: false, error: mali.message }; }
};
window.iPumiliNgRepo = repo => NAPILING_REPO = repo;
window.iKuninNapilingRepo = () => NAPILING_REPO || localStorage.getItem('wp_gh_repo');

// =========================================================
// 💾 OFFLINE QUEUE
// =========================================================
function getOfflineQueue() { const q = localStorage.getItem('wp_offline_queue'); return q ? JSON.parse(q) : []; }
function saveToLocalQueue(fileName, content, filePath) {
  const q = getOfflineQueue();
  q.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 8), fileName, content, filePath, savedAt: new Date().toISOString(), attempts: 0 });
  localStorage.setItem('wp_offline_queue', JSON.stringify(q));
  updateSyncBadge();
}
function clearFromQueue(id) { let q = getOfflineQueue().filter(x => x.id !== id); localStorage.setItem('wp_offline_queue', JSON.stringify(q)); updateSyncBadge(); }
function updateSyncBadge() {
  const count = getOfflineQueue().length;
  const badge = document.getElementById('sync-pending');
  if (badge) { badge.style.display = count > 0 ? 'inline' : 'none'; badge.textContent = count; }
}

// =========================================================
// 🔄 SYNC
// =========================================================
window.synchronizeNow = async function synchronizeNow() {
  const statusEl = document.getElementById('sync-status');
  const syncBtn = document.getElementById('sync-btn');
  if (!IS_ONLINE) { if(statusEl) statusEl.textContent = '❌ Walang internet'; return; }
  const queue = getOfflineQueue();
  if (!queue.length) { if(statusEl) statusEl.textContent = '✅ Wala nang isesend'; setTimeout(() => { if(statusEl) statusEl.textContent = 'Handa'; }, 2500); return; }
  if(syncBtn) syncBtn.disabled = true;
  if(statusEl) statusEl.textContent = `⏳ Nagsisynchronize: ${queue.length}...`;
  let ok = 0, fail = 0;
  for (const item of queue) {
    const res = await saveToGitHubDirect(item.fileName, item.content, item.filePath);
    if (res.ok) { clearFromQueue(item.id); ok++; }
    else { item.attempts++; if (item.attempts >= 3) clearFromQueue(item.id); fail++; }
  }
  if(syncBtn) syncBtn.disabled = false;
  if(statusEl) statusEl.textContent = `✅ Tapos: ${ok} naisave${fail ? `, ${fail} nabigo` : ''}`;
  setTimeout(() => { if(statusEl) statusEl.textContent = 'Handa'; }, 4000);
};

// =========================================================
// 📤 GITHUB DIRECT SAVE
// =========================================================
async function saveToGitHubDirect(fileName, content, filePath) {
  const token = await getDecryptedToken();
  if (!token) return { ok: false, error: 'NO_TOKEN' };
  const { user, repo } = getRepoInfo();
  if (!user || !repo) return { ok: false, error: 'NO_REPO' };
  try {
    const getRes = await fetch(`${GH_API_BASE}/repos/${user}/${repo}/contents/${filePath}`, { headers: { 'Authorization': `token ${token}` } });
    const sha = getRes.ok ? (await getRes.json()).sha : null;
    const b64 = btoa(unescape(encodeURIComponent(content)));
    const body = { message: `📝 Sync: ${fileName} — ${new Date().toLocaleString()}`, content: b64 };
    if (sha) body.sha = sha;
    const putRes = await fetch(`${GH_API_BASE}/repos/${user}/${repo}/contents/${filePath}`, {
      method: 'PUT', headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return { ok: putRes.ok, status: putRes.status };
  } catch { return { ok: false }; }
}

// =========================================================
// 🔐 ENCRYPTION & CREDENTIALS
// =========================================================
function deriveKey(p) { const s = 'wp-martodosko-2026-secret-salt'; return btoa(p + '|' + navigator.userAgent + '|' + s); }
function encryptData(d, p) { const k = deriveKey(p); let r = ''; for(let i=0;i<d.length;i++) r += String.fromCharCode(d.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return btoa(r); }
function decryptData(e, p) { try { const d = atob(e), k = deriveKey(p); let r=''; for(let i=0;i<d.length;i++) r += String.fromCharCode(d.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return r; } catch { return null; } }

window.setupCredentials = function(password, token, username, repo) {
  localStorage.setItem('wp_enc_token', encryptData(token, password));
  localStorage.setItem('wp_enc_pass', encryptData(password, STORAGE_MASTER_KEY));
  localStorage.setItem('wp_gh_user', username);
  localStorage.setItem('wp_gh_repo', repo);
  iLumikhaNgSession();
  updateUserStatusDisplay();
  return true;
};
async function getDecryptedToken() {
  const et = localStorage.getItem('wp_enc_token'), ep = localStorage.getItem('wp_enc_pass');
  if (!et || !ep) return null;
  const pass = decryptData(ep, STORAGE_MASTER_KEY);
  return pass ? decryptData(et, pass) : null;
}
function getRepoInfo() { return { user: localStorage.getItem('wp_gh_user'), repo: localStorage.getItem('wp_gh_repo') }; }

window.clearAllCredentials = function() {
  if (!confirm('🗑️ Sigurado bang burahin ang lahat?')) return;
  iTapusinAngSession();
  localStorage.removeItem('wp_enc_token');
  localStorage.removeItem('wp_enc_pass');
  localStorage.removeItem('wp_gh_user');
  localStorage.removeItem('wp_gh_repo');
  localStorage.removeItem('wp_offline_queue');
  updateUserStatusDisplay();
  updateSyncBadge();
  window.loadPage?.('login');
  alert('✅ BINURA NA');
};

// =========================================================
// ✅ EXPOSE FUNCTIONS
// =========================================================
window.iMayActiveSession = iMayActiveSession;
window.iLumikhaNgSession = iLumikhaNgSession;
window.iTapusinAngSession = iTapusinAngSession;
window.iKuninNatitirangOras = iKuninNatitirangOras;
window.iSimulanSessionCountdown = iSimulanSessionCountdown;
window.iPalawiginSession = iPalawiginSession;
window.getDecryptedToken = getDecryptedToken;
window.getRepoInfo = getRepoInfo;

// =========================================================
// ✅ PAGKABUKAS — KUSANG TUMATAKBO
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  detectEnvironment();
  updateConnectionStatus();
  updateUserStatusDisplay();
  updateSyncBadge();
  setTimeout(renderSidebarMenu, 50);
});

console.log('✅ WP Martodosko — logic.js KUMPLETO NA — LAHAT NG FUNCTIONS NASA LOOB!');
