// Settings Logic

document.addEventListener('DOMContentLoaded', () => window.waitForApp(loadSettingsData));

function loadSettingsData() {
  const user = window.Store.getUser();
  const settings = window.Store.getSettings();

  // Profile Form
  if (user) {
    document.getElementById('set-name').value = user.name || '';
    document.getElementById('set-age').value = user.age || '';
    
    // Set avatar initials
    if (user.name) {
      const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
      document.getElementById('profile-avatar-lg').textContent = initials;
    }
  }

  // Preferences Form
  if (user) {
    document.getElementById('set-country').value = user.country || 'US';
    document.getElementById('set-language').value = user.language || 'en';
    document.getElementById('set-budget').value = user.budgetGoal || 0;
  }
  if (settings) {
    document.getElementById('set-currency').value = settings.currency || 'USD';
    document.getElementById('set-theme').value = settings.theme || 'dark';
  }
}

// Tab Switching
function switchTab(tabId) {
  // Update nav
  document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update sections
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
}

// Form Handlers
function saveProfile(e) {
  e.preventDefault();
  const name = document.getElementById('set-name').value;
  const age = document.getElementById('set-age').value;
  
  window.Store.updateUser({ name, age });
  
  // Update UI initials
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
  document.getElementById('profile-avatar-lg').textContent = initials;
  
  // Update header
  const nameSpans = document.querySelectorAll('.user-profile span');
  nameSpans.forEach(span => span.textContent = name);
  const avatars = document.querySelectorAll('.user-profile .avatar');
  avatars.forEach(av => av.textContent = initials);
  
  if(typeof showToast === 'function') showToast('Profile updated successfully');
}

function savePreferences(e) {
  e.preventDefault();
  const country = document.getElementById('set-country').value;
  const language = document.getElementById('set-language').value;
  const currency = document.getElementById('set-currency').value;
  const budgetGoal = parseFloat(document.getElementById('set-budget').value);
  
  window.Store.updateUser({ country, language, budgetGoal });
  window.Store.updateSettings({ currency });
  
  // Refresh the global currency formatter immediately
  if (window.App) {
    window.App.setupFormatters();
    document.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
  }
  
  if(typeof showToast === 'function') showToast('Preferences updated');
}

function saveAppearance(e) {
  e.preventDefault();
  const theme = document.getElementById('set-theme').value;
  
  window.Store.updateSettings({ theme });
  document.documentElement.setAttribute('data-theme', theme);
  
  const btnIcon = document.querySelector('.theme-toggle-btn i');
  if (btnIcon) {
    btnIcon.className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
  
  if(typeof showToast === 'function') showToast('Appearance updated');
}
