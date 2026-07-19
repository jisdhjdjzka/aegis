const root = document.documentElement;
const header = document.getElementById('siteHeader');
const menuButton = document.getElementById('menuButton');
const mobileNav = document.getElementById('mobileNav');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

root.classList.add('js');

function setMenu(open, focusFirst = false) {
  if (!menuButton || !mobileNav) return;
  menuButton.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (open && focusFirst) mobileNav.querySelector('a')?.focus();
}

menuButton?.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true', true);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return;
  setMenu(false);
  menuButton.focus();
});

document.addEventListener('click', event => {
  if (menuButton?.getAttribute('aria-expanded') !== 'true') return;
  if (!mobileNav?.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
});

mobileNav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) setMenu(false);
}, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
});


let frame;
function updatePageState() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const progress = available > 0 ? Math.min(1, window.scrollY / available) : 0;
    header?.style.setProperty('--scroll-progress', progress);
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
  });
}
window.addEventListener('scroll', updatePageState, { passive: true });
window.addEventListener('resize', updatePageState, { passive: true });
updatePageState();

const sectionLinks = document.querySelectorAll('.desktop-nav a[href^="#"], .mobile-nav > a[href^="#"]');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    const current = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!current) return;
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${current.target.id}`;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-30% 0px -55%', threshold: [0, .25, .6] });
  document.querySelectorAll('#workflow, #features, #safety, #faq').forEach(section => sectionObserver.observe(section));
}

const revealItems = document.querySelectorAll('main > section:not(.hero), .footer');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  root.classList.add('can-reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .08, rootMargin: '0px 0px -35px' });
  revealItems.forEach(item => {
    item.dataset.reveal = '';
    revealObserver.observe(item);
  });
}

document.querySelectorAll('.faq details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq details[open]').forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

const previewTitles = {
  identity: 'Profile',
  avatar: 'Avatar',
  balance: 'Currency',
  inventory: 'Inventory'
};
const previewTabs = [...document.querySelectorAll('[data-preview-tab]')];
const previewPanels = [...document.querySelectorAll('[data-preview-panel]')];
const previewTitle = document.getElementById('previewTitle');

function activatePreview(name, moveFocus = false) {
  previewTabs.forEach(tab => {
    const active = tab.dataset.previewTab === name;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && moveFocus) tab.focus();
  });
  previewPanels.forEach(panel => {
    const active = panel.dataset.previewPanel === name;
    panel.hidden = !active;
    panel.classList.toggle('is-active', active);
  });
  if (previewTitle) previewTitle.textContent = previewTitles[name] || 'Preview';
}

previewTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activatePreview(tab.dataset.previewTab));
  tab.addEventListener('keydown', event => {
    const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = previewTabs.length - 1;
    else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % previewTabs.length;
    else next = (index - 1 + previewTabs.length) % previewTabs.length;
    activatePreview(previewTabs[next].dataset.previewTab, true);
  });
});


const concepts = [
  ['Local Preview', '@local_preview', '1.2K', '48K', '12.4K'],
  ['Neon Concept', '@neon_concept', '842', '21K', '604'],
  ['Aegis Studio', '@aegis_studio', '2.4K', '76K', '8.1K'],
  ['Midnight UI', '@midnight_ui', '512', '9.8K', '331']
];
let conceptIndex = 0;
const demoFields = {
  name: document.getElementById('demoName'),
  handle: document.getElementById('demoHandle'),
  field: document.getElementById('demoField'),
  friends: document.getElementById('demoFriends'),
  followers: document.getElementById('demoFollowers'),
  following: document.getElementById('demoFollowing')
};
const verifiedToggle = document.querySelector('[data-demo-verified]');
const demoBadge = document.getElementById('demoBadge');
const balanceRange = document.getElementById('balanceRange');
const demoBalance = document.getElementById('demoBalance');
const balanceOutput = document.getElementById('balanceOutput');

function renderConcept(index) {
  const [name, handle, friends, followers, following] = concepts[index];
  const values = { name, field: name, handle, friends, followers, following };
  Object.entries(values).forEach(([key, value]) => {
    const field = demoFields[key];
    if (!field) return;
    if ('value' in field) field.value = value;
    else field.textContent = value;
  });
}

document.querySelector('[data-demo-randomize]')?.addEventListener('click', () => {
  conceptIndex = (conceptIndex + 1) % concepts.length;
  renderConcept(conceptIndex);
});

verifiedToggle?.addEventListener('click', () => {
  const enabled = verifiedToggle.getAttribute('aria-checked') !== 'true';
  verifiedToggle.setAttribute('aria-checked', String(enabled));
  verifiedToggle.classList.toggle('is-on', enabled);
  if (demoBadge) demoBadge.hidden = !enabled;
});

function updateBalance() {
  if (!balanceRange) return;
  const value = Number(balanceRange.value);
  if (demoBalance) demoBalance.textContent = value.toLocaleString('en-US');
  if (balanceOutput) {
    balanceOutput.textContent = Intl.NumberFormat('en', {
      notation: 'compact', maximumFractionDigits: 1
    }).format(value);
  }
  document.querySelectorAll('.mini-chart span').forEach((bar, index) => {
    bar.style.height = `${Math.max(8, Math.min(100, value / 100000 * 70 + index * 4))}%`;
  });
}
balanceRange?.addEventListener('input', updateBalance);

['.option-grid', '.inventory-grid'].forEach(selector => {
  document.querySelector(selector)?.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    button.parentElement.querySelectorAll('button').forEach(item => {
      item.classList.toggle('is-selected', item === button);
    });
  });
});

document.querySelector('[data-demo-reset]')?.addEventListener('click', () => {
  conceptIndex = 0;
  renderConcept(0);
  activatePreview('identity');
  if (verifiedToggle) {
    verifiedToggle.setAttribute('aria-checked', 'true');
    verifiedToggle.classList.add('is-on');
  }
  if (demoBadge) demoBadge.hidden = false;
  if (balanceRange) balanceRange.value = '12500';
  updateBalance();
  document.querySelectorAll('.option-grid, .inventory-grid').forEach(group => {
    group.querySelectorAll('button').forEach((item, index) => {
      item.classList.toggle('is-selected', index === 0);
    });
  });
});

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const input = document.createElement('textarea');
  input.value = value;
  input.readOnly = true;
  input.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  if (!copied) throw new Error('Copy unavailable');
}

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    const label = button.querySelector('span') || button;
    const original = label.textContent;
    try {
      await copyText(button.dataset.copy);
      label.textContent = 'Copied';
    } catch {
      label.textContent = 'Copy failed';
    }
    window.setTimeout(() => { label.textContent = original; }, 1500);
  });
});

const year = document.getElementById('currentYear');
if (year) year.textContent = new Date().getFullYear();


// Interaction layer for the larp-style preview.
const larpUi = document.querySelector('.larp-ui');
const larpSearch = document.getElementById('larpSearch');
const larpStatus = document.querySelector('.larp-status');
const statusText = larpStatus?.querySelector('span:first-child');
let statusTimer;

function setLarpStatus(message) {
  if (!statusText || !larpStatus) return;
  window.clearTimeout(statusTimer);
  statusText.textContent = message;
  larpStatus.classList.add('is-active');
  statusTimer = window.setTimeout(() => {
    statusText.textContent = 'Ready';
    larpStatus.classList.remove('is-active');
  }, 1400);
}

function filterActivePanel() {
  if (!larpSearch) return;
  const query = larpSearch.value.trim().toLowerCase();
  const panel = previewPanels.find(item => !item.hidden);
  if (!panel) return;
  const targets = panel.querySelectorAll('.larp-control, .inventory-grid button');
  let shown = 0;
  targets.forEach(target => {
    const text = `${target.dataset.searchLabel || ''} ${target.textContent}`.toLowerCase();
    const visible = !query || text.includes(query);
    target.classList.toggle('is-search-hidden', !visible);
    if (visible) shown += 1;
  });
  if (query) setLarpStatus(shown ? `${shown} result${shown === 1 ? '' : 's'}` : 'No matches');
}

larpSearch?.addEventListener('input', filterActivePanel);
larpSearch?.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  larpSearch.value = '';
  filterActivePanel();
  larpSearch.blur();
  setLarpStatus('Search cleared');
});

document.addEventListener('keydown', event => {
  const editing = event.target.matches('input, textarea, select, [contenteditable="true"]');
  if (event.key === '/' && !editing) {
    event.preventDefault();
    larpSearch?.focus();
  }
});

previewTabs.forEach(tab => tab.addEventListener('click', () => {
  if (larpSearch) larpSearch.value = '';
  filterActivePanel();
  setLarpStatus(`${previewTitles[tab.dataset.previewTab]} loaded`);
}));

document.querySelectorAll('.larp-tabs').forEach(group => {
  group.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    group.querySelectorAll('button').forEach(item => item.classList.toggle('is-active', item === button));
    setLarpStatus(`${button.textContent.trim()} tab selected`);
  });
});

document.querySelector('[data-account-toggle]')?.addEventListener('click', event => {
  const button = event.currentTarget;
  const enabled = button.getAttribute('aria-checked') !== 'true';
  button.setAttribute('aria-checked', String(enabled));
  setLarpStatus(`Premium ${enabled ? 'enabled' : 'disabled'}`);
});

verifiedToggle?.addEventListener('click', () => {
  setLarpStatus(`Verified ${verifiedToggle.getAttribute('aria-checked') === 'true' ? 'enabled' : 'disabled'}`);
});

const displayNameInput = document.getElementById('demoDisplayName');
displayNameInput?.addEventListener('input', () => {
  if (demoFields.name) demoFields.name.textContent = displayNameInput.value || 'Preview User';
  setLarpStatus('Display name updated');
});
demoFields.field?.addEventListener('input', () => {
  if (!demoFields.handle) return;
  const handle = demoFields.field.value.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  demoFields.handle.textContent = `@${handle || 'local_preview'}`;
});

document.querySelectorAll('.larp-control select, .larp-control input[type="number"]').forEach(control => {
  control.addEventListener('change', () => setLarpStatus(`${control.closest('.larp-control')?.querySelector('label')?.textContent || 'Value'} updated`));
});

const avatarStage = document.querySelector('.larp-center .avatar-stage');
document.querySelector('.option-grid')?.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || !avatarStage) return;
  avatarStage.dataset.preset = button.textContent.trim();
  setLarpStatus(`${button.textContent.trim()} preset applied`);
});

document.querySelector('.inventory-grid')?.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  setLarpStatus(`${button.querySelector('small')?.textContent || 'Item'} selected`);
});

balanceRange?.addEventListener('change', () => setLarpStatus('Balance preview updated'));

document.querySelector('[data-demo-randomize]')?.addEventListener('click', () => setLarpStatus('Profile loaded'));

document.querySelector('[data-demo-reset]')?.addEventListener('click', () => {
  if (larpSearch) larpSearch.value = '';
  filterActivePanel();
  document.querySelectorAll('[data-account-toggle]').forEach(toggle => toggle.setAttribute('aria-checked', 'true'));
  document.querySelectorAll('.larp-tabs').forEach(group => {
    group.querySelectorAll('button').forEach((button, index) => button.classList.toggle('is-active', index === 0));
  });
  larpUi?.classList.add('is-resetting');
  window.setTimeout(() => larpUi?.classList.remove('is-resetting'), 180);
  setLarpStatus('Preview reset');
});


// Require an explicit confirmation before opening the ZIP download.
const downloadDialog = document.getElementById('downloadDialog');
const downloadConsent = document.getElementById('downloadConsent');
const confirmDownload = document.getElementById('confirmDownload');
let downloadOpener;

function setDownloadReady(ready) {
  if (!confirmDownload) return;
  confirmDownload.classList.toggle('is-disabled', !ready);
  confirmDownload.setAttribute('aria-disabled', String(!ready));
  confirmDownload.tabIndex = ready ? 0 : -1;
}

function openDownloadDialog(event) {
  if (!downloadDialog || typeof downloadDialog.showModal !== 'function') return;
  event.preventDefault();
  downloadOpener = event.currentTarget;
  if (downloadConsent) downloadConsent.checked = false;
  setDownloadReady(false);
  downloadDialog.showModal();
  document.body.classList.add('download-dialog-open');
  window.setTimeout(() => downloadConsent?.focus(), 0);
}

function closeDownloadDialog() {
  if (!downloadDialog?.open) return;
  downloadDialog.close();
}

document.querySelectorAll('a[href*="Aegis.zip"]:not(#confirmDownload)').forEach(link => {
  link.addEventListener('click', openDownloadDialog);
});

downloadConsent?.addEventListener('change', () => setDownloadReady(downloadConsent.checked));
document.querySelectorAll('[data-download-close]').forEach(button => button.addEventListener('click', closeDownloadDialog));

confirmDownload?.addEventListener('click', event => {
  if (confirmDownload.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
    downloadConsent?.focus();
    return;
  }
  downloadDialog?.close();
});

downloadDialog?.addEventListener('click', event => {
  if (event.target !== downloadDialog) return;
  const bounds = downloadDialog.getBoundingClientRect();
  const inside = event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
  if (!inside) closeDownloadDialog();
});

downloadDialog?.addEventListener('close', () => {
  document.body.classList.remove('download-dialog-open');
  downloadOpener?.focus();
});