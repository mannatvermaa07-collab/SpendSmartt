// ============================================================
// SpendSmart — Shared Application Logic
// ============================================================

class App {
  constructor() {
    this.initTheme();
    this.setupFormatters();
    this.checkOnboarding();   // redirect to onboarding if profile not set
    this.initSidebarCollapse();
  }

  // Redirect un-onboarded users on protected pages
  checkOnboarding() {
    const path = window.location.pathname;
    const protected_ = ['dashboard.html','analytics.html','goals.html','settings.html','calendar.html'];
    if (protected_.some(p => path.includes(p))) {
      if (!window.Store.isOnboardingComplete()) {
        window.location.href = 'onboarding.html';
      }
    }
  }

  initTheme() {
    const settings = window.Store.getSettings();
    document.documentElement.setAttribute('data-theme', settings.theme || 'dark');
  }

  toggleTheme() {
    const settings  = window.Store.getSettings();
    const newTheme  = settings.theme === 'dark' ? 'light' : 'dark';
    window.Store.updateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    const icon = document.querySelector('.theme-toggle-btn i');
    if (icon) icon.className = newTheme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
  }

  setupFormatters() {
    const settings = window.Store.getSettings();
    const localeMap = { USD:'en-US', EUR:'de-DE', GBP:'en-GB', INR:'en-IN', JPY:'ja-JP' };
    this.formatter = new Intl.NumberFormat(localeMap[settings.currency] || 'en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    });
  }

  formatCurrency(amount)  { return this.formatter.format(amount); }
  formatDate(dateString)  {
    return new Date(dateString).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
  }

  toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('mobile-open');
  }

  initSidebarCollapse() {
    const sidebar     = document.querySelector('.sidebar');
    const isCollapsed = localStorage.getItem('spendSmart_sidebarCollapsed') === 'true';
    if (sidebar && isCollapsed) sidebar.classList.add('collapsed');
  }

  toggleSidebarCollapse() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      const collapsed = sidebar.classList.toggle('collapsed');
      localStorage.setItem('spendSmart_sidebarCollapsed', collapsed);
    }
  }
}

// ── Global: wait for async App init before running page code ───
// Each page's DOMContentLoaded fires before Firebase resolves,
// so page scripts must call waitForApp(callback) instead of
// relying on window.App being set synchronously.
window.waitForApp = function (callback) {
  if (window.App) {
    callback();
  } else {
    const check = setInterval(() => {
      if (window.App) {
        clearInterval(check);
        callback();
      }
    }, 30);
    // Safety timeout: give up after 8s (network/auth failure)
    setTimeout(() => clearInterval(check), 8000);
  }
};

// ── Global formatCurrency that always reads live settings ───────
// Page scripts should prefer window.App.formatCurrency(), but
// this fallback ensures currency is correct even if called before
// App is ready.
window.formatCurrency = function (amount) {
  if (window.App) return window.App.formatCurrency(amount);
  const settings  = window.Store ? window.Store.getSettings() : {};
  const currency  = (settings && settings.currency) || 'USD';
  const localeMap = { USD:'en-US', EUR:'de-DE', GBP:'en-GB', INR:'en-IN', JPY:'ja-JP' };
  return new Intl.NumberFormat(localeMap[currency] || 'en-US', {
    style: 'currency', currency,
  }).format(amount);
};


window.handleLogout = async function (e) {
  if (e) e.preventDefault();
  try {
    if (window.firebaseAuth) await window.firebaseAuth.signOut();
  } catch (err) {
    console.error('Sign-out error:', err);
  } finally {
    localStorage.removeItem('spendSmart_currentAccount');
    window.location.href = 'login.html';
  }
};

// ── Main init (async — waits for Firebase auth state) ───────────
document.addEventListener('DOMContentLoaded', async () => {
  const path           = window.location.pathname;
  const protectedPages = ['dashboard.html','analytics.html','goals.html','settings.html','calendar.html'];
  const isProtected    = protectedPages.some(p => path.includes(p));
  const isLoginPage    = path.includes('login.html');

  // ── Show loading overlay on protected pages ─────────────────
  if (isProtected && window.firebaseAuth) {
    const overlay = document.createElement('div');
    overlay.id    = 'auth-loading-overlay';
    overlay.innerHTML = `
      <style>
        #auth-loading-overlay {
          position: fixed; inset: 0;
          background: var(--bg-main);
          z-index: 99999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 18px;
        }
        ._auth-spin {
          width: 36px; height: 36px;
          border: 3px solid var(--border-color);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: __spin 0.75s linear infinite;
        }
        @keyframes __spin { to { transform: rotate(360deg); } }
      </style>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
           stroke="var(--accent-primary)" stroke-width="2.5"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 16c-3.3 0-5-2.2-5-4s1.7-4 5-4 4 2 6 4-2.7 4-6 4zm10-8c3.3 0 5 2.2 5 4s-1.7 4-5 4-4-2-6-4 2.7-4 6-4z"/>
      </svg>
      <span style="font-weight:700;font-size:1.1rem;color:var(--text-main);">SpendSmart</span>
      <div class="_auth-spin"></div>`;
    document.body.prepend(overlay);
  }

  // ── Resolve Firebase auth state ─────────────────────────────
  let firebaseUser = null;
  if (window.firebaseAuth) {
    firebaseUser = await new Promise(resolve => {
      const unsub = window.firebaseAuth.onAuthStateChanged(user => { unsub(); resolve(user); });
    });
    if (firebaseUser) {
      // Scope ALL data to Firebase UID (replaces email-based key)
      localStorage.setItem('spendSmart_currentAccount', firebaseUser.uid);
      window.Store.init();
    }
  }

  // ── Remove loading overlay ──────────────────────────────────
  document.getElementById('auth-loading-overlay')?.remove();

  // ── Auth guards ─────────────────────────────────────────────
  // Not logged in on a protected page → login
  if (isProtected && !firebaseUser) {
    const legacy = localStorage.getItem('spendSmart_currentAccount');
    if (!legacy) { window.location.href = 'login.html'; return; }
  }
  // Already logged in on login page → skip ahead
  if (isLoginPage && firebaseUser) {
    const dest = window.Store.isOnboardingComplete() ? 'dashboard.html' : 'onboarding.html';
    window.location.href = dest;
    return;
  }

  // ── Boot app ────────────────────────────────────────────────
  window.App = new App();

  // Sync theme icon
  const settings    = window.Store.getSettings();
  const themeIcon   = document.querySelector('.theme-toggle-btn i');
  if (themeIcon) themeIcon.className = settings.theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';

  // Highlight active sidebar link
  const currentPage = path.split('/').pop();
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  });

  // ── Demo Mode Banner ────────────────────────────────────────
  if (window.Store?.accountId === 'demo' && !path.includes('login.html') && !path.includes('index.html')) {
    const banner       = document.createElement('div');
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--warning-bg);color:var(--warning);border-bottom:1px solid var(--warning);text-align:center;padding:10px;font-weight:600;font-size:0.875rem;backdrop-filter:blur(8px);display:flex;justify-content:center;gap:8px;';
    banner.innerHTML   = '<i class="fa-solid fa-triangle-exclamation"></i> Demo Mode — <a href="login.html" style="color:inherit;text-decoration:underline;">Sign in to save changes</a>';
    document.body.prepend(banner);
    document.querySelector('.topbar')?.style.setProperty('top','40px');
    document.querySelector('.sidebar')?.style.setProperty('top','40px');
    document.querySelector('.main-content')?.style.setProperty('margin-top','40px');
    document.addEventListener('submit', e => {
      if (['expense-form','goal-form','budget-form'].includes(e.target.id)) {
        e.preventDefault();
        if (typeof showToast === 'function') showToast('Read-only Demo Mode: Cannot save changes.');
      }
    });
  }

  // ── Topbar user info ────────────────────────────────────────
  if (firebaseUser) {
    // Use Firebase profile first, fall back to onboarding data
    const displayName = firebaseUser.displayName
      || window.Store.getUser()?.name
      || 'User';
    const photoURL = firebaseUser.photoURL;

    // Name chips
    document.querySelectorAll('.user-profile span').forEach(span => {
      span.textContent = displayName.split(' ')[0];
    });

    // Avatar: photo from Google or initials fallback
    document.querySelectorAll('.user-profile .avatar').forEach(av => {
      if (photoURL) {
        av.textContent = '';
        av.style.cssText += 'padding:0;overflow:hidden;';
        const img = document.createElement('img');
        img.src             = photoURL;
        img.referrerPolicy  = 'no-referrer';
        img.alt             = displayName;
        img.style.cssText   = 'width:100%;height:100%;object-fit:cover;border-radius:50%;';
        av.appendChild(img);
      } else {
        av.textContent = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      }
    });
  } else {
    // Legacy localStorage-based profile display
    const user = window.Store.getUser();
    if (user?.name) {
      document.querySelectorAll('.user-profile span').forEach(s => s.textContent = user.name.split(' ')[0]);
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      document.querySelectorAll('.user-profile .avatar').forEach(av => av.textContent = initials);
    }
  }
});

// ── Global helpers ──────────────────────────────────────────────
function navigateTo(url) { window.location.href = url; }

window.showToast = function (message, type = 'info') {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:var(--bg-card);color:var(--text-main);border:1px solid var(--border-color);padding:12px 24px;border-radius:8px;box-shadow:var(--shadow-lg);transform:translateY(100px);opacity:0;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);max-width:320px;';
    document.body.appendChild(toast);
  }
  const iconMap = { info:'fa-circle-info', success:'fa-circle-check', error:'fa-circle-xmark' };
  const colorMap = { info:'var(--accent-primary)', success:'var(--success)', error:'var(--danger)' };
  toast.innerHTML = `<i class="fa-solid ${iconMap[type] || iconMap.info}" style="color:${colorMap[type] || colorMap.info};margin-right:8px;"></i>${message}`;
  setTimeout(() => { toast.style.transform = 'translateY(0)'; toast.style.opacity = '1'; }, 10);
  setTimeout(() => { toast.style.transform = 'translateY(100px)'; toast.style.opacity = '0'; }, 3200);
};

// Demo mode: intercept deleteExpense
window._originalDeleteExpense = window.deleteExpense;
window.deleteExpense = function (id) {
  if (window.Store?.accountId === 'demo') {
    showToast('Read-only Demo Mode: Cannot delete data.');
    return;
  }
  if (window._originalDeleteExpense) window._originalDeleteExpense(id);
};
