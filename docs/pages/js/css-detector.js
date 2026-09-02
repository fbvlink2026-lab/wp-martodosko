// =========================================================
// 🎯 AUTO CSS DETECTOR & MERGER — WP MARTODOSKO
// Binabasa ang bawat pahina → Kinukuha ang CSS → Ipinapasa sa style.css
// ✅ Kung wala → Idaragdag
// ✅ Kung nandoon na → Lilibayan
// ✅ Hindi doble-doble
// =========================================================

const CSS_STORAGE_KEY = 'wp_merged_css';
const CSS_VERSION_KEY = 'wp_css_version';
const CURRENT_CSS_SPEC = 'v1.0';

// ✅ SIMPLENG PANGALAN NG RULE → PAGKILALA
function normalizeCSS(cssText) {
  return cssText
    .replace(/\/\*[\s\S]*?\*\//g, '') // Tanggalin ang komento
    .replace(/\s+/g, ' ')            // Paliitin ang espasyo
    .trim();
}

// ✅ KUNIN ANG LAHAT NG CSS MULA SA KASALUKUYANG PAHINA
function extractPageCSS() {
  const styles = document.querySelectorAll('style');
  const rules = [];

  styles.forEach(styleEl => {
    const text = styleEl.textContent.trim();
    if (!text) return;

    // Hatiin sa mga bloke
    const blockPattern = /([^{}]+)\s*\{([^}]*)\}/g;
    let match;
    while ((match = blockPattern.exec(text)) !== null) {
      const selector = match[1].trim();
      const body = match[2].trim();
      if (selector && body) {
        rules.push({
          id: btoa(selector).slice(0, 24), // ✅ Natatanging pagkakakilanlan
          selector: selector,
          body: body,
          full: `${selector} { ${body} }`
        });
      }
    }
  });

  return rules;
}

// ✅ KUNIN ANG MERGED CSS MULA SA STORAGE
function getMergedCSS() {
  const stored = localStorage.getItem(CSS_STORAGE_KEY);
  const version = localStorage.getItem(CSS_VERSION_KEY);
  if (stored && version === CURRENT_CSS_SPEC) {
    const rules = [];
    const lines = stored.split('\n').filter(l => l.trim() && !l.startsWith('/*'));
    lines.forEach(line => {
      const m = line.match(/\/\* RULE: (\S+) \*/);
      if (m) {
        const id = m[1];
        const next = lines[lines.indexOf(line) + 1];
        if (next) rules.push({ id, full: next });
      }
    });
    return { text: stored, rules };
  }
  return { text: '', rules: [] };
}

// ✅ TIGNAN KUNG NASA MERGED NA BA
function isRuleAlreadyMerged(rule, mergedRules) {
  return mergedRules.some(mr =>
    normalizeCSS(mr.full) === normalizeCSS(rule.full)
  );
}

// ✅ IDAGDAG ANG BAGONG RULE SA MERGED CSS
function addToMergedCSS(newRule) {
  const merged = getMergedCSS();
  if (isRuleAlreadyMerged(newRule, merged.rules)) {
    return { added: false, reason: 'Nasa CSS na' };
  }

  const entry = `/* RULE: ${newRule.id} */\n${newRule.full}\n`;
  const updatedText = merged.text + '\n' + entry;

  localStorage.setItem(CSS_STORAGE_KEY, updatedText);
  localStorage.setItem(CSS_VERSION_KEY, CURRENT_CSS_SPEC);

  return { added: true, ruleId: newRule.id };
}

// ✅ BUUIN AT I-APLAY ANG BUONG MERGED CSS SA PAHINA
function applyMergedCSS() {
  const merged = getMergedCSS();
  let styleEl = document.getElementById('wp-auto-css');

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'wp-auto-css';
    document.head.appendChild(styleEl);
  }

  styleEl.textContent = merged.text;
  return merged;
}

// ✅ PANGUNAHING TRABAHO — KAPAG NABUKAS ANG PAHINA
function detectAndMergePageCSS() {
  const pageRules = extractPageCSS();
  let addedCount = 0;

  pageRules.forEach(rule => {
    const result = addToMergedCSS(rule);
    if (result.added) addedCount++;
  });

  // ✅ Tanggalin ang orihinal na <style> sa pahina — nasa merged na!
  document.querySelectorAll('style').forEach(el => {
    if (!el.id || !el.id.startsWith('wp-')) {
      el.remove(); // ✅ Tinanggal para hindi doble
    }
  });

  // ✅ I-aplay ang buong merged CSS
  applyMergedCSS();

  if (addedCount > 0) {
    console.log(`🎨 CSS Detector: Nadagdag ang ${addedCount} bagong istilo — naka-sa merged style.css`);
  } else {
    console.log(`🎨 CSS Detector: Walang bagong istilo — kumpleto na ang merged CSS`);
  }

  return { totalRules: pageRules.length, addedCount };
}

// ✅ I-EXPORT SA GITHUB — KUKUHA MO ANG BUONG MERGED CSS
function downloadMergedCSS() {
  const merged = getMergedCSS();
  const header = `/* =============================================
   🎨 WP MARTODOSKO — AUTO-MERGED STYLE.CSS
   Binuo KUSANG mula sa lahat ng pahina
   Petsa: ${new Date().toLocaleString()}
   Bersyon: ${CURRENT_CSS_SPEC}
============================================= */\n\n`;

  const blob = new Blob([header + merged.text], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'style.css';
  a.click();
  URL.revokeObjectURL(url);
}

// ✅ I-CLEAR ANG LAHAT NG MERGED CSS (KUNG GUSTONG ULIIN MULA SA SIMULA)
function resetMergedCSS() {
  if (!confirm('🔄 Siguradong ibalik sa simula ang lahat ng CSS?')) return;
  localStorage.removeItem(CSS_STORAGE_KEY);
  localStorage.removeItem(CSS_VERSION_KEY);
  const el = document.getElementById('wp-auto-css');
  if (el) el.remove();
  console.log('✅ CSS Detector: Naibalik sa simula');
}

// ✅ PAGKABUKAS — KUSANG TUMATAKBO!
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(detectAndMergePageCSS, 100); // Hintayin mabuo ang pahina
});

// ✅ GAWING MAAGAW — PWEDENG TAWAGIN MULA SA IBANG SCRIPT
window.CSS_DETECTOR = {
  extract: extractPageCSS,
  getMerged: getMergedCSS,
  apply: applyMergedCSS,
  run: detectAndMergePageCSS,
  download: downloadMergedCSS,
  reset: resetMergedCSS
};
