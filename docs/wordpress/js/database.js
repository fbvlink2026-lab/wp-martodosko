let dbCache = null;

function loadDatabase(callback) {
  if (dbCache) return callback(dbCache);
  fetch('data/database.json')
    .then(res => res.json())
    .then(data => { dbCache = data; callback(data); })
    .catch(err => {
      console.error('Database Error:', err);
      document.body.innerHTML = '<div style="padding:30px;text-align:center;"><h2>❌ Hindi mabasa ang Database</h2><p>Walang mababasang data mula sa database.json</p></div>';
    });
}

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderMenu(items) {
  const nav = document.getElementById('main-nav');
  nav.innerHTML = items.map(i => `<a href="${i.url}">${i.label}</a>`).join('');
}

function renderPosts(posts, container) {
  const target = container || document.getElementById('content-area');
  target.innerHTML = '';
  posts.forEach(p => {
    target.innerHTML += `
      <div class="post-card">
        <h2><a href="single.html?slug=${p.slug}">${p.title}</a></h2>
        <div class="meta">📅 ${p.date} | ✍️ ${p.author} | 📂 ${p.category}</div>
        <p>${p.excerpt}</p>
        <p><a href="single.html?slug=${p.slug}">Magbasa pa →</a></p>
      </div>
    `;
  });
}
