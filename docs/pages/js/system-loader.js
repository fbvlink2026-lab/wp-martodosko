let systemDB = null, currentView = null;

document.addEventListener('DOMContentLoaded', () => {
  loadDatabase().then(db => {
    systemDB = db;
    generateStyles(db.style_config);
    buildSidebar(db.menu_items);
    loadContent(db.config.default_view);
  });
});

function loadDatabase() {
  return fetch('data/system-db.json')
    .then(r => r.json())
    .catch(() => ({ style_config:{}, menu_items:[], config:{} }));
}

function generateStyles(s) {
  const css = `
    *{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
    body{display:flex;min-height:100vh;background:${s.layout?.body_bg||'#f0f0f1'};color:${s.text?.body_color||'#3c434a'}}
    .sidebar{width:${systemDB?.config?.sidebar_width||160}px;background:${s.sidebar?.background||'#1d2327'};color:${s.sidebar?.text_color||'#a7aaad'};padding:12px 0;min-height:100vh;flex-shrink:0}
    .sidebar-logo{text-align:center;padding:0 10px 12px;font-size:17px;border-bottom:1px solid #3c434a;margin-bottom:8px;color:#fff}
    .menu-list{list-style:none}
    .menu-list li a{display:block;color:${s.sidebar?.text_color||'#a7aaad'};padding:10px 12px 10px 16px;text-decoration:none;border-left:4px solid transparent;transition:.12s;cursor:pointer}
    .menu-list li a:hover,.menu-list li a.active{background:${s.sidebar?.hover_bg||'#2c3338'};border-left-color:${s.sidebar?.active_border||'#72aee6'};color:#fff}
    .main-container{flex:1;padding:25px 35px}
    .content-container{background:${s.container?.background||'#fff'};border:1px solid ${s.container?.border_color||'#c3c4c7'};border-radius:${s.container?.radius||'4px'};padding:${s.container?.padding||'25px'};min-height:450px}
    .content-container h1{font-size:23px;font-weight:400;margin:0 0 20px;padding-bottom:10px;border-bottom:1px solid #eee;color:${s.text?.heading_color||'#1d2327'}}
    button{background:${s.buttons?.primary_bg||'#007cba'};color:${s.buttons?.primary_text||'#fff'};border:none;padding:8px 16px;border-radius:${s.buttons?.radius||'4px'};cursor:pointer;transition:.2s}
    button:hover{background:${s.buttons?.hover_bg||'#00a0d2'}}
    .card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}
    .card{background:#e5f5fa;padding:20px;border-radius:6px;text-align:center}
    .card-num{font-size:28px;font-weight:bold;color:${s.layout?.accent||'#007cba'}}
    .wp-table{width:100%;border-collapse:collapse;margin-top:15px}
    .wp-table th,.wp-table td{padding:10px;text-align:left;border-bottom:1px solid #eee}
    .form-table th{padding:8px 0;text-align:left;vertical-align:top;white-space:nowrap}
    .form-table td{padding:8px 10px}
    .dropzone{border:2px dashed #c3c4c7;border-radius:4px;padding:40px;text-align:center;color:#666}
    .editor-pane{background:#fff3cd;border:1px solid #ffc107;border-radius:4px;padding:25px;margin-top:15px;display:none;position:relative}
    .editor-pane.show{display:block;animation:fadeIn .25s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:none}}
    .close-editor{position:absolute;top:12px;right:15px;background:transparent;border:none;font-size:20px;cursor:pointer;color:#856404}
    textarea{width:100%;min-height:150px;padding:10px;border:1px solid #ffc107;border-radius:4px;margin-bottom:15px;font-family:monospace}
    .edit-btn{margin-top:18px}
    .edit-sm-btn{padding:4px 10px;font-size:13px}
    .loading{color:#666;text-align:center;padding:50px}
  `;
  document.getElementById('dynamic-styles').textContent = css;
}

function buildSidebar(items) {
  const menu = document.getElementById('sidebar-menu'); menu.innerHTML = '';
  items.filter(i => i.enabled !== false).forEach(i => {
    const li = document.createElement('li');
    li.innerHTML = `<a data-id="${i.id}" onclick="loadContent('${i.id}')"><span>${i.icon}</span> ${i.label}</a>`;
    menu.appendChild(li);
  });
}

function loadContent(id) {
  closeEditor(); currentView = id;
  const item = systemDB.menu_items.find(i => i.id === id);
  if (!item) return;
  document.getElementById('admin-content').innerHTML = '<p class="loading">⏳ Kinukuha ang laman...</p>';
  fetch(item.content_file)
    .then(r => r.text())
    .then(html => {
      document.getElementById('admin-content').innerHTML = html;
      updateActive(id);
      history.replaceState({}, '', `admin.html?view=${id}`);
    });
}

function updateActive(id) {
  document.querySelectorAll('.menu-list a').forEach(a => a.classList.toggle('active', a.dataset.id === id));
}
function openEditor(title) {
  document.getElementById('editor-title').textContent = '✏️ Pag-eedit: ' + title;
  document.getElementById('editor-area').value = '';
  document.getElementById('editor-pane').classList.add('show');
}
function closeEditor() {
  document.getElementById('editor-pane').classList.remove('show');
}
function saveEdit() {
  alert('✅ Naisave na! (Pansamantala — sa susunod ay direktang isusulat sa GitHub)');
  closeEditor();
}
window.addEventListener('popstate', () => {
  const view = new URLSearchParams(location.search).get('view') || systemDB?.config?.default_view || 'dashboard';
  if (view) loadContent(view);
});
