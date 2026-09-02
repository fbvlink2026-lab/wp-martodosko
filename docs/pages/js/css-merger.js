// =========================================================
// 🎨 CSS MERGER — WP MARTODOSKO
// Binabasa lahat ng pahina → Kinukuha ang <style> →
// Ikumpara sa style.css → Idadagdag lang kung wala →
// Burahin ang <style> → Palitan ng <link> → I-download
// =========================================================

let BUONG_CSS = '';
let NAKITANG_RULES = new Set();
let BAGONG_DAGDAG = [];
let NAIWAS_DOBLE = 0;
let BINAGO_NA_PAHINA = [];
let KASALUKUYANG_STYLE_CSS = '';

const LAHAT_PAHINA = [
  'dashboard.html',
  'articles.html',
  'settings.html',
  'organizer.html',
  'editor.html',
  'newpage.html',
  'login.html',
  'new-page-template.html'
];

function talaan(mensahe, uri = 'info') {
  const lugar = document.getElementById('log-area');
  const oras = new Date().toLocaleTimeString();
  const kulay = uri==='ok'?'#00a32a': uri==='error'?'#d63638':'#007cba';
  lugar.innerHTML += `<span style="color:${kulay}">[${oras}]</span> ${mensahe}\n`;
  lugar.scrollTop = lugar.scrollHeight;
}

function iNormalize(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\s+/g, ' ')
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*;\s*/g, ';')
            .trim();
}

async function kuninKasalukuyangStyleCSS() {
  try {
    const tugon = await fetch('css/style.css');
    if (tugon.ok) {
      KASALUKUYANG_STYLE_CSS = await tugon.text();
      talaan(`✅ Nabasa ang kasalukuyang style.css — ${KASALUKUYANG_STYLE_CSS.length} letra`);
      
      // Irekord ang lahat ng rule na nandoon na
      const ugPattern = /[^{}]+{[^}]+}/g;
      let tugma;
      while ((tugma = ugPattern.exec(KASALUKUYANG_STYLE_CSS)) !== null) {
        NAKITANG_RULES.add(iNormalize(tugma[0]));
      }
      talaan(`📋 Nandoon na: ${NAKITANG_RULES.size} na rule`);
      return true;
    }
  } catch {}
  talaan(`⚠️ Walang nakitang style.css — magsisimula sa bago`, 'ok');
  return false;
}

async function basahinAtAyusinPahina(pangalan) {
  talaan(`📄 Binabasa: ${pangalan}`);
  try {
    const tugon = await fetch(`content/${pangalan}`);
    if (!tugon.ok) {
      talaan(`   ❌ Hindi mabasa`, 'error');
      return;
    }
    let html = await tugon.text();
    let mayStyle = false;

    // Kunin ang <style>...</style>
    const styleTugma = html.match(/<style>([\s\S]*?)<\/style>/gi);
    if (styleTugma) {
      mayStyle = true;
      for (const s of styleTugma) {
        const laman = s.replace(/<\/?style>/gi, '').trim();
        if (!laman) continue;

        // Hatiin sa bawat rule
        const ugPattern = /[^{}]+{[^}]+}/g;
        let tugma;
        while ((tugma = ugPattern.exec(laman)) !== null) {
          const rule = tugma[0];
          const linaw = iNormalize(rule);

          if (NAKITANG_RULES.has(linaw)) {
            talaan(`   ⏭️  Lilibayan — nandoon na: ${rule.substring(0,40)}...`);
            NAIWAS_DOBLE++;
          } else {
            NAKITANG_RULES.add(linaw);
            BAGONG_DAGDAG.push(rule);
            BUONG_CSS += rule + '\n\n';
            talaan(`   ➕ Idinaragdag: ${rule.substring(0,40)}...`, 'ok');
          }
        }
      }

      // Burahin ang <style> sa HTML
      html = html.replace(/<style>[\s\S]*?<\/style>/gi, '');

      // Ilagay ang <link> kung wala pa
      if (!html.includes('rel="stylesheet"')) {
        html = html.replace(/<head>/i, '<head>\n  <link rel="stylesheet" href="css/style.css">');
        talaan(`   🔗 Idinaragdag ang <link rel="stylesheet">`, 'ok');
      }

      BINAGO_NA_PAHINA.push({ pangalan, bagongLaman: html });
    }

    if (!mayStyle) {
      talaan(`   ↳ Walang <style> — walang binago`);
    }
  } catch (e) {
    talaan(`   ❌ Mali: ${e.message}`, 'error');
  }
}

async function simulanPagsama() {
  talaan('🚀 SINIMULAN NA ANG PAGSAMA-SAMA...', 'ok');
  BUONG_CSS = '';
  NAKITANG_RULES.clear();
  BAGONG_DAGDAG = [];
  NAIWAS_DOBLE = 0;
  BINAGO_NA_PAHINA = [];
  document.getElementById('result-area').style.display = 'none';

  // Hakbang 1: Kunin ang kasalukuyang style.css
  await kuninKasalukuyangStyleCSS();

  // Hakbang 2: Basahin ang bawat pahina
  for (const pahina of LAHAT_PAHINA) {
    await basahinAtAyusinPahina(pahina);
  }

  // Hakbang 3: Buuin ang bagong style.css
  const ULO = `/* =============================================
   🎨 PINAGSAMA-SAMANG CSS — WP MARTODOSKO
   Binuo: ${new Date().toLocaleString()}
   Nandoon na: ${NAKITANG_RULES.size - BAGONG_DAGDAG.length} rule
   Bagong Idinaragdag: ${BAGONG_DAGDAG.length}
   Lilibayang Doble: ${NAIWAS_DOBLE}
============================================= */\n\n`;

  const BAGONG_STYLE = ULO + KASALUKUYANG_STYLE_CSS + '\n\n/* --- BAGONG IDINARAGDAG --- */\n\n' + BUONG_CSS;
  document.getElementById('style-output').value = BAGONG_STYLE;

  talaan('', 'ok');
  talaan('✅ TAPOS NA LAHAT!', 'ok');
  talaan(`📋 Kabuuan: ${NAKITANG_RULES.size} na rule sa style.css`);
  talaan(`➕ Bagong Dinagdag: ${BAGONG_DAGDAG.length}`);
  talaan(`⏭️  Lilibayang Doble: ${NAIWAS_DOBLE}`);
  talaan(`📄 Pahinang Binago: ${BINAGO_NA_PAHINA.length}`);

  // Ipakita ang resulta
  document.getElementById('result-area').style.display = 'block';

  // Ipakita ang mga binagong pahina
  if (BINAGO_NA_PAHINA.length > 0) {
    talaan('', 'ok');
    talaan('📄 MGA PAHINANG BINAGO — KOPYAHIN AT PALITAN SA GITHUB:', 'ok');
    BINAGO_NA_PAHINA.forEach(p => {
      talaan(`--- 📄 ${p.pangalan} ---`);
      console.log(`===== ${p.pangalan} =====`);
      console.log(p.bagongLaman);
    });
    alert(`⚠️ Mahalaga! Tingnan ang Console (F12) para sa BAGONG LAMAN ng bawat pahina — kopyahin at palitan sa GitHub!`);
  }
}

function iDownloadStyle() {
  const laman = document.getElementById('style-output').value;
  const blob = new Blob([laman], { type: 'text/css;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'style.css';
  a.click();
  URL.revokeObjectURL(url);
  talaan('📥 Na-download: style.css — I-upload sa docs/pages/css/style.css', 'ok');
}
