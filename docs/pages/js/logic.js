// =========================================================
// 🧠 WP MARTODOSKO — KUMPLETONG LOGIC.JS
// ✅ SESSION CHECK + REPO LISTING + LAHAT NG KAILANGAN
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
// 🔐 SESSION MANAGEMENT — KUMPLETO NA DITO!
// =========================================================

// ✅ Suriin kung may aktibong sesyon
function iMayActiveSession() {
  const active = localStorage.getItem(SESSION_KEY) === 'true';
  const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
  return active && Date.now() < expiry;
}

// ✅ Lumikha ng bagong sesyon
function iLumikhaNgSession() {
  localStorage.setItem(SESSION_KEY, 'true');
  localStorage.setItem(SESSION_EXPIRY, Date.now() + SESSION_DURATION);
}

// ✅ Tapusin / I-clear ang sesyon
function iTapusinAngSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_EXPIRY);
  localStorage.removeItem(SESSION_USER);
  if (sessionTimer) clearInterval(sessionTimer);
}

// ✅ Kunin ang natitirang oras — [oras, minuto]
function iKuninNatitirangOras() {
  const expiry = parseInt(localStorage.getItem(SESSION_EXPIRY) || '0');
  const natitira = expiry - Date.now();
  if (natitira <= 0) return [0, 0];
  const oras = Math.floor(natitira / (1000 * 60 * 60));
  const minuto = Math.floor((natitira % (1000 * 60 * 60)) / (1000 * 60));
  return [oras, minuto];
}

// ✅ Ipakita ang countdown — tawagin sa login.html
function iSimulanSessionCountdown(elId = 'session-timer') {
  if (sessionTimer) clearInterval(sessionTimer);
  
  const update = () => {
    const el = document.getElementById(elId);
    if (!el) return;
    
    const [oras, minuto] = iKuninNatitirangOras();
    if (oras <= 0 && minuto <= 0) {
      el.textContent = '❌ Nag-expire na';
      iTapusinAngSession();
      if (typeof loadPage === 'function') loadPage('login');
      return;
    }
    el.textContent = `${oras}h ${minuto}m natitira`;
  };

  update();
  sessionTimer = setInterval(update, 30000); // Bawat 30 segundo
}

// ✅ Palawigin ang sesyon +2 oras
function iPalawiginSession() {
  localStorage.setItem(SESSION_EXPIRY, Date.now() + SESSION_DURATION);
  alert('✅ Pinalawig pa ng 2 oras ang sesyon!');
}

// =========================================================
// 📋 MENU — KASAMA ANG LAHAT NG PINDUTAN
// =========================================================
const DEFAULT_MENU = [
  { id: 'dashboard', label: '📊 Dashboard', page: 'dashboard', visible: true },
  { id: 'articles', label: '📝 Mga Artikulo', page: 'articles', visible: true },
  { id: 'settings', label: '⚙️ Mga Setting', page: 'settings', visible: true },
  { id: 'css-merger', label: '🎨 Ayusin CSS', page: 'css-merger', visible: true },
  { id: 'setup-token', label: '🔑 Token Setup', page: 'setup-token', visible: true },
  { id: 'organizer', label: '🛠️ Tagapag-ayos', page: 'organizer', visible: true },
  { id: 'editor', label: '✏️ File Editor', page: 'editor', visible: true },
  { id: 'newpage', label: '➕ Bagong Pahina', page: 'newpage', visible: true },
  { id: 'login', label: '🔐 Akawnt', page: 'login', visible: true }
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
// 📡 KATAYUAN NG KONEKSYON — Online / Offline
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
// 📋 MENU — KUNIN / I-SAVE / ILABAS — MAY HILAHIN DIREKTA SA SIDEBAR!
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

// 🖐️ DRAG-AND-DROP — DIREKTA SA SIDEBAR!
function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', this.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  if (this !== draggedElement) this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
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
  document.querySelectorAll('.menu-item').forEach(el => {
    el.classList.remove('dragging', 'drag-over');
  });
  draggedElement = null;
}

// 📤 MGA PUBLIKONG UTOS — PARA SA TAGAPAG-AYOS
window.getSidebarLayout = getMenuLayout;
window.saveSidebarLayout = saveMenuLayout;
window.resetSidebarLayout = () => {
  localStorage.removeItem('wp_sidebar_layout');
  renderSidebarMenu();
};
window.toggleMenuItemVisibility = (id, visible) => {
  const layout = getMenuLayout();
  const item = layout.find(x => x.id === id);
  if (item) { item.visible = visible; saveMenuLayout(layout); renderSidebarMenu(); }
};
window.addNewMenuItem = (id, label, page, pos = null) => {
  const layout = getMenuLayout();
  if (layout.find(x => x.id === id)) return false;
  const newItem = { id, label, page, visible: true };
  pos !== null ? layout.splice(pos, 0, newItem) : layout.push(newItem);
  saveMenuLayout(layout);
  renderSidebarMenu();
  return true;
};
window.deleteMenuItem = id => {
  let layout = getMenuLayout().filter(x => x.id !== id);
  saveMenuLayout(layout);
  renderSidebarMenu();
};

// =========================================================
// 📦 GITHUB REPOSITORY LISTING — PARA SA CREATE.HTML ✅
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
  } catch (mali) {
    return { ok: false, error: mali.message };
  }
};

window.iPumiliNgRepo = function(repoFullName) {
  NAPILING_REPO = repoFullName;
  return NAPILING_REPO;
};

window.iKuninNapilingRepo = function() {
  return NAPILING_REPO || localStorage.getItem('wp_gh_repo');
};

// =========================================================
// 💾 OFFLINE QUEUE — PAG-SAVE SA LOKAL KAPAG WALANG INTERNET
// =========================================================
function getOfflineQueue() {
  const q = localStorage.getItem('wp_offline_queue');
  return q ? JSON.parse(q) : [];
}

function saveToLocalQueue(fileName, content, filePath) {
  const q = getOfflineQueue();
  q.push({
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    fileName, content, filePath,
    savedAt: new Date().toISOString(),
    attempts: 0
  });
  localStorage.setItem('wp_offline_queue', JSON.stringify(q));
  updateSyncBadge();
}

function clearFromQueue(id) {
  let q = getOfflineQueue().filter(x => x.id !== id);
  localStorage.setItem('wp_offline_queue', JSON.stringify(q));
  updateSyncBadge();
}

function updateSyncBadge() {
  const count = getOfflineQueue().length;
  const badge = document.getElementById('sync-pending');
  if (badge) {
    badge.style.display = count > 0 ? 'inline' : 'none';
    badge.textContent = count;
  }
}

// =========================================================
// 🔄 SMART SAVE — LOKAL → GITHUB KAPAG ONLINE
// =========================================================
window.smartSaveFile = async function(fileName, content, filePath) {
  saveToLocalQueue(fileName, content, filePath);
  if (IS_ONLINE) return await saveToGitHubDirect(fileName, content, filePath);
  alert('📡 OFFLINE — Naka-save muna sa Lokal.\n🔄 Ise-send sa GitHub kapag nakabalik na ang internet.');
  return { status: 'QUEUED', message: 'Nakaantay sa koneksyon' };
};

async function synchronizeNow() {
  const statusEl = document.getElementById('sync-status');
  const syncBtn = document.getElementById('sync-btn');
  if (!IS_ONLINE) { if(statusEl) statusEl.textContent = '❌ Walang internet'; return; }

  const queue = getOfflineQueue();
  if (!queue.length) {
    if(statusEl) statusEl.textContent = '✅ Wala nang isesend';
    setTimeout(() => { if(statusEl) statusEl.textContent = 'Handa'; }, 2500);
    return;
  }

  if(syncBtn) syncBtn.disabled = true;
  if(statusEl) statusEl.textContent = `⏳ Nagsisynchronize: ${queue.length}...`;

  let ok = 0, fail = 0;
  for (const item of queue) {
    const result = await saveToGitHubDirect(item.fileName, item.content, item.filePath);
    if (result.ok) { clearFromQueue(item.id); ok++; }
    else { item.attempts++; if (item.attempts >= 3) clearFromQueue(item.id); fail++; }
  }

  if(syncBtn) syncBtn.disabled = false;
  if(statusEl) statusEl.textContent = `✅ Tapos: ${ok} naisave${fail ? `, ${fail} nabigo` : ''}`;
  setTimeout(() => { if(statusEl) statusEl.textContent = 'Handa'; }, 4000);
}

// =========================================================
// 📤 GITHUB DIRECT — TUNAY NA PAG-SAVE SA GITHUB
// =========================================================
async function saveToGitHubDirect(fileName, content, filePath) {
  const token = await getDecryptedToken();
  if (!token) return { ok: false, error: 'NO_TOKEN' };

  const { user, repo } = getRepoInfo();
  if (!user || !repo) return { ok: false, error: 'NO_REPO' };

  try {
    const getRes = await fetch(`${GH_API_BASE}/repos/${user}/${repo}/contents/${filePath}`, {
      headers: { 'Authorization': `token ${token}` }
    });
    const sha = getRes.ok ? (await getRes.json()).sha : null;
    const b64 = btoa(unescape(encodeURIComponent(content)));
    const body = {
      message: `📝 Sync: ${fileName} — ${new Date().toLocaleString()}`,
      content: b64
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(`${GH_API_BASE}/repos/${user}/${repo}/contents/${filePath}`, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return { ok: putRes.ok, status: putRes.status };
  } catch { return { ok: false }; }
}

// =========================================================
// 🔐 ENCRYPTION — TOKEN SECURITY
// =========================================================
function deriveKey(password) {
  const salt = 'wp-martodosko-2026-secret-salt';
  return btoa(password + '|' + navigator.userAgent + '|' + salt);
}

function encryptData(data, password) {
  const key = deriveKey(password);
  let result = '';
  for (let i = 0; i < data.length; i++) {
    result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function decryptData(encrypted, password) {
  try {
    const data = atob(encrypted);
    const key = deriveKey(password);
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch { return null; }
}

window.setupCredentials = function(password, token, username, repo) {
  localStorage.setItem('wp_enc_token', encryptData(token, password));
  localStorage.setItem('wp_enc_pass', encryptData(password, STORAGE_MASTER_KEY));
  localStorage.setItem('wp_gh_user', username);
  localStorage.setItem('wp_gh_repo', repo);
  iLumikhaNgSession(); // ✅ Lumikha agad ng sesyon
  updateUserStatus();
  return true;
};

async function getDecryptedToken() {
  const encToken = localStorage.getItem('wp_enc_token');
  const encPass = localStorage.getItem('wp_enc_pass');
  if (!encToken || !encPass) return null;
  const password = decryptData(encPass, STORAGE_MASTER_KEY);
  return password ? decryptData(encToken, password) : null;
}

function getRepoInfo() {
  return {
    user: localStorage.getItem('wp_gh_user'),
    repo: localStorage.getItem('wp_gh_repo')
  };
}

window.clearAllCredentials = function() {
  if (!confirm('🗑️ Sigurado bang burahin ang lahat?')) return;
  iTapusinAngSession();
  localStorage.removeItem('wp_enc_token');
  localStorage.removeItem('wp_enc_pass');
  localStorage.removeItem('wp_gh_user');
  localStorage.removeItem('wp_gh_repo');
  localStorage.removeItem('wp_offline_queue');
  updateUserStatus();
  updateSyncBadge();
  if (typeof loadPage === 'function') loadPage('login');
  alert('✅ BINURA NA');
};

function updateUserStatus() {
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

window.toggleSidebar = function() {
  const sb = document.getElementById('sidebar');
  if(sb) sb.classList.toggle('collapsed');
  const content = document.getElementById('content-wrapper');
  if (content) content.classList.toggle('sidebar-hidden');
};

// ✅ I-expose ang Session functions para sa login.html
window.iMayActiveSession = iMayActiveSession;
window.iLumikhaNgSession = iLumikhaNgSession;
window.iTapusinAngSession = iTapusinAngSession;
window.iKuninNatitirangOras = iKuninNatitirangOras;
window.iSimulanSessionCountdown = iSimulanSessionCountdown;
window.iPalawiginSession = iPalawiginSession;
window.getDecryptedToken = getDecryptedToken;
window.getRepoInfo = getRepoInfo;

// =========================================================
// ✅ PAGKABUKAS — LAHAT KUSANG TUMATAKBO
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  detectEnvironment();
  updateConnectionStatus();
  updateUserStatus();
  updateSyncBadge();
  setTimeout(renderSidebarMenu, 50);
});

// =========================================================
// ✅ BAGONG AYOS MULA SA TAGAPAG-AYOS — TUMANGGAP NG PAGBABAGO
// =========================================================
window.addEventListener('bagongAyosNgMenu', () => {
  renderSidebarMenu();
});

console.log('✅ WP Martodosko — logic.js KUMPLETO NA — Session + Repo Listing + Lahat');
