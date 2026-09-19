'use strict';

/* ── Scroll progress bar ── */
const header = document.getElementById('siteHeader');
let raf;
window.addEventListener('scroll', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p   = max > 0 ? Math.min(1, scrollY / max) : 0;
    header?.style.setProperty('--scroll-p', p);
  });
}, { passive: true });

/* ── Mobile nav ── */
const ham   = document.getElementById('hamBtn');
const mobNav = document.getElementById('mobileNav');
function setMenu(open) {
  ham.setAttribute('aria-expanded', open);
  mobNav.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
}
ham?.addEventListener('click', () => setMenu(ham.getAttribute('aria-expanded') !== 'true'));
mobNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

/* ── Smooth scroll for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMenu(false);
  });
});

/* ── Reveal on scroll ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => en.isIntersecting && en.target.classList.add('visible'));
}, { threshold: .12 });
document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

/* ══════════════════════════════════════════
   HERO UI SHELL — interactive demo
══════════════════════════════════════════ */
const scripts = {
  hello: { name: 'Untitled 1',     file: 'Untitled_1.luau', code: 'print("Hello, world!");' },
  esp:   { name: 'esp',            file: 'esp.luau',         code: 'local Players = game:GetService("Players")\nlocal lp = Players.LocalPlayer\n-- ESP script here' },
  inf:   { name: 'inf_jump',       file: 'inf_jump.luau',    code: '-- Infinite jump\nlocal UIS = game:GetService("UserInputService")\nUIS.JumpRequest:Connect(function()\n  game.Players.LocalPlayer.Character.Humanoid:ChangeState(11)\nend)' },
};

let activeScript  = 'hello';
let editorVisible = false;

const pageStart  = document.getElementById('page-start');
const pageEditor = document.getElementById('page-editor');
const tabStart   = document.querySelector('[data-tab="start"]');
const tabEditor  = document.querySelector('[data-tab="editor"]');
const editorCode = document.getElementById('editorCode');
const editorGutter = document.getElementById('editorGutter');
const editorFilename = document.getElementById('editorFilename');
const statusText = document.getElementById('statusText');
const consoleOut = document.getElementById('consoleOutput');
const typingDots = document.getElementById('typingDots');

function showStart() {
  editorVisible = false;
  pageStart.classList.remove('ui-page--hidden');
  pageEditor.classList.add('ui-page--hidden');
  tabStart.classList.add('ui-tab--active');
  tabEditor.classList.remove('ui-tab--active');
  statusText.textContent = 'Start';
}

function showEditor(scriptKey) {
  const s = scripts[scriptKey] || scripts.hello;
  activeScript = scriptKey;
  editorVisible = true;
  editorCode.value = s.code;
  editorFilename.textContent = s.name;
  updateGutter();

  pageStart.classList.add('ui-page--hidden');
  pageEditor.classList.remove('ui-page--hidden');
  tabStart.classList.remove('ui-tab--active');
  tabEditor.classList.add('ui-tab--active');
  tabEditor.querySelector('.ui-tab__x') && (tabEditor.childNodes[0].textContent = '📄 ' + s.name + ' ');
  statusText.textContent = s.name;
}

function updateGutter() {
  const lines = editorCode.value.split('\n').length;
  editorGutter.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

/* Tab clicks */
tabStart?.addEventListener('mousedown', () => showStart());
tabEditor?.addEventListener('mousedown', e => {
  if (e.target.classList.contains('ui-tab__x')) { showStart(); return; }
  showEditor(activeScript);
});

/* Script tree clicks */
document.querySelectorAll('[data-script]').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.ui-tree__item').forEach(i => i.classList.remove('ui-tree__item--active'));
    el.classList.add('ui-tree__item--active');
    showEditor(el.dataset.script);
  });
});

/* Start page script links */
document.querySelectorAll('[data-open-script]').forEach(el => {
  el.addEventListener('click', () => showEditor(el.dataset.openScript));
});

/* New script button */
document.getElementById('demoNewScript')?.addEventListener('click', () => {
  scripts['new1'] = { name: 'Untitled 2', file: 'Untitled_2.luau', code: '' };
  showEditor('new1');
});

/* Editor text change → update gutter */
editorCode?.addEventListener('input', updateGutter);

/* ── Console log helper ── */
function logLine(text, color) {
  const d = document.createElement('div');
  d.className = 'ui-console__line';
  d.style.color = color || '';
  d.textContent = text;
  // insert before typing dots
  if (typingDots && !typingDots.hidden) {
    consoleOut.insertBefore(d, typingDots);
  } else {
    consoleOut.appendChild(d);
  }
  consoleOut.scrollTop = consoleOut.scrollHeight;
  return d;
}

function setTyping(on) {
  if (!typingDots) return;
  typingDots.hidden = !on;
  if (on) consoleOut.appendChild(typingDots);
}

/* ══════════════════════════════════════════
   DEMO SECTION — three tabs
══════════════════════════════════════════ */
document.querySelectorAll('.demo-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.demo-tab').forEach(b => b.classList.remove('demo-tab--active'));
    btn.classList.add('demo-tab--active');
    const target = btn.dataset.demo;
    document.querySelectorAll('.demo-panel').forEach(p => p.classList.add('demo-panel--hidden'));
    document.getElementById('demo-' + target)?.classList.remove('demo-panel--hidden');
  });
});

/* Demo editor gutter sync */
const demoCode   = document.getElementById('demoCode');
const demoGutter = document.getElementById('demoGutter');
function syncDemoGutter() {
  if (!demoCode || !demoGutter) return;
  const lines = demoCode.value.split('\n').length;
  demoGutter.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
}
demoCode?.addEventListener('input', syncDemoGutter);
syncDemoGutter();

/* Demo run button */
const demoRunBtn    = document.getElementById('demoRunBtn');
const demoConsoleOut = document.getElementById('demoConsoleOut');
const demoTyping    = document.getElementById('demoTyping');

function demoLog(text, color) {
  const s = document.createElement('span');
  s.className = 'demo-console-line';
  s.style.color = color || '';
  s.textContent = text;
  demoConsoleOut.appendChild(s);
  demoConsoleOut.scrollTop = demoConsoleOut.scrollHeight;
}

demoRunBtn?.addEventListener('click', async () => {
  demoRunBtn.disabled = true;
  const code = demoCode?.value?.trim() || '';
  const now  = new Date().toLocaleTimeString('en-GB');

  demoTyping.hidden = false;
  demoConsoleOut.appendChild(demoTyping);
  await delay(500);

  demoLog(`${now}  Running script…`);
  await delay(280);

  if (code) {
    const first = code.split('\n')[0];
    demoLog(`${now}  > ${first}`, 'var(--acid)');
    await delay(200);
  }

  demoLog(`${now}  Done.`);
  demoTyping.hidden = true;
  demoRunBtn.disabled = false;
});

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ── Download button ── */
// Real link — no JS needed, href handles it

/* ── Discord entry popup ── */
(function () {
  const popup   = document.getElementById('dcPopup');
  const overlay = document.getElementById('dcOverlay');
  const close   = document.getElementById('dcClose');
  const skip    = document.getElementById('dcSkip');
  if (!popup) return;

  // Don't show if dismissed in this session
  if (sessionStorage.getItem('dc-dismissed')) return;

  function openPopup() {
    popup.classList.add('visible');
    overlay.classList.add('visible');
    popup.focus();
  }
  function closePopup() {
    popup.classList.remove('visible');
    overlay.classList.remove('visible');
    sessionStorage.setItem('dc-dismissed', '1');
  }

  // Show after 1.5s
  setTimeout(openPopup, 1500);

  close?.addEventListener('click', closePopup);
  skip?.addEventListener('click', closePopup);
  overlay?.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup.classList.contains('visible')) closePopup();
  });
})();
