// ✅ SA PAGKARGA NG SIDEBAR:
const res = await fetch(`sidebar.html?v=${Date.now()}`, { 
  cache: 'no-store',
  headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
});

// ✅ SA PAGKARGA NG PAHINA:
const res = await fetch(`content/${pageId}.html?v=${Date.now()}`, {
  cache: 'no-store',
  headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
});
