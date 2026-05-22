<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendar - SpendSmart</title>
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <style>
    .calendar-grid-large {
      display: grid; 
      grid-template-columns: repeat(7, 1fr); 
      gap: 12px; 
      text-align: center;
      min-height: 400px;
    }
    .calendar-grid-large > div {
    .calendar-grid-large .day-cell {
      min-height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      border-radius: 8px;
      padding: 6px 2px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      cursor: pointer;
      position: relative;
      transition: all var(--transition-fast);
    }
    .calendar-grid-large .day-cell:hover {
      transform: translateY(-2px);
      border-color: var(--accent-primary);
      background: var(--bg-card-hover);
      box-shadow: var(--shadow-md);
    }
    .calendar-grid-large .day-cell.has-transactions {
      background: rgba(192, 132, 252, 0.07);
      border-color: rgba(192, 132, 252, 0.35);
      color: var(--accent-primary);
      font-weight: 600;
    }
    .calendar-grid-large .day-cell.has-transactions:hover {
      background: rgba(192, 132, 252, 0.14);
      border-color: var(--accent-primary);
    }
    .calendar-grid-large .day-cell.today {
      box-shadow: 0 0 0 2px var(--accent-primary);
    }
    .calendar-grid-large .day-cell-empty {
      min-height: 80px;
      background: transparent;
      border: 1px solid transparent;
      pointer-events: none;
    }
    .day-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-primary);
      margin-top: 6px;
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
    .calendar-grid-large .day-cell.has-transactions .day-dot {
      opacity: 1;
    }
  </style>
</head>
<body>
  <div class="app-container">
    
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <a href="index.html" class="sidebar-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 16c-3.3 0-5-2.2-5-4s1.7-4 5-4 4 2 6 4-2.7 4-6 4zm10-8c3.3 0 5 2.2 5 4s-1.7 4-5 4-4-2-6-4 2.7-4 6-4z"/>
        </svg>
        <span>SpendSmart</span>
      </a>
      
      <nav class="sidebar-nav">
        <a href="dashboard.html" class="nav-item" title="Dashboard">
          <i class="fa-solid fa-house"></i> <span>Dashboard</span>
        </a>
        <a href="analytics.html" class="nav-item" title="Analytics">
          <i class="fa-solid fa-chart-pie"></i> <span>Analytics</span>
        </a>
        <a href="calendar.html" class="nav-item active" title="Calendar">
          <i class="fa-solid fa-calendar"></i> <span>Calendar</span>
        </a>
        <a href="goals.html" class="nav-item" title="Savings Goals">
          <i class="fa-solid fa-bullseye"></i> <span>Savings Goals</span>
        </a>
        <a href="settings.html" class="nav-item" title="Settings">
          <i class="fa-solid fa-gear"></i> <span>Settings</span>
        </a>
      </nav>
      
      <div class="sidebar-bottom">
        <a href="#" onclick="handleLogout(event)" class="nav-item text-muted hover-danger" title="Logout">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> <span>Logout</span>
        </a>
      </div>
    </aside>
    <!-- Main Content -->
    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" onclick="window.App.toggleSidebarCollapse()">
            <i class="fa-solid fa-bars"></i>
          </button>
          <div>
            <h2 id="greeting">Calendar 🗓️</h2>
            <p id="current-date" class="text-muted text-sm">Loading...</p>
          </div>
        </div>
        
        <div class="topbar-right">
          <button class="theme-toggle-btn" onclick="window.App.toggleTheme()" title="Toggle Theme">
            <i class="fa-solid fa-sun"></i>
          </button>
          <div class="user-profile">
            <div class="avatar">JD</div>
            <span class="font-medium text-sm hide-mobile">John Doe</span>
          </div>
        </div>
      </header>
      <div class="content-wrapper">
        <div class="card section-card animate-fade-in" style="animation-delay: 0.1s">
          <div class="section-header">
            <h3>Monthly Spending Calendar 🗓️</h3>
            <div style="font-size: 1.1rem; font-weight: 600;" class="text-muted" id="calendar-month-year">May 2026</div>
          </div>
          <div id="calendar-container">
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 1rem; font-weight: 600; color: var(--text-muted); margin-bottom: 16px;">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div id="calendar-grid" class="calendar-grid-large">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  <div id="day-data-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 9999; justify-content: center; align-items: center; opacity: 0; animation: fadein 0.3s forwards;">
    <div style="background: var(--bg-card); padding: 32px; border-radius: 16px; border: 1px solid var(--border-color); width: 100%; max-width: 450px; box-shadow: var(--shadow-lg); position: relative; transform: translateY(20px); animation: slideup 0.3s forwards;">
      <button onclick="document.getElementById('day-data-modal').style.display='none'" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      <h3 id="day-data-title" style="margin-bottom: 24px; font-weight: 600;">Transactions</h3>
      <div id="day-data-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 300px; overflow-y: auto;">
      </div>
    </div>
  </div>
  <style>
    @keyframes fadein { to { opacity: 1; } }
    @keyframes slideup { to { transform: translateY(0); } }
    @media (max-width: 640px) {
      .hide-mobile { display: none; }
    }
  </style>
  <!-- Floating AI Assistant -->
  <button class="ai-fab" id="ai-fab" onclick="toggleAIPanel()">
    <i class="fa-solid fa-robot"></i>
  </button>
  <div class="ai-panel" id="ai-panel">
    <div class="ai-panel-header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--accent-primary); color: white; display: flex; align-items: center; justify-content: center;">
          <i class="fa-solid fa-robot"></i>
        </div>
        <div>
          <div style="font-weight: 600; font-size: 0.95rem;">SpendSmart AI</div>
          <div style="font-size: 0.75rem; color: var(--success);">Online</div>
        </div>
      </div>
      <button class="btn-icon" onclick="toggleAIPanel()"><i class="fa-solid fa-xmark"></i></button>
    </div>
    
    <div class="ai-panel-messages" id="chat-messages">
      <div style="display: flex; gap: 12px; max-width: 85%;">
        <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--bg-main); border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 0.75rem;"><i class="fa-solid fa-robot"></i></div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="padding: 10px 14px; background: linear-gradient(135deg, var(--bg-main) 0%, rgba(99, 102, 241, 0.05) 100%); border: 1px solid var(--border-color); border-radius: 12px; border-top-left-radius: 4px; font-size: 0.875rem; line-height: 1.5; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            Hello! I am your AI assistant. How can I help you analyze your spending today?
          </div>
          <span style="font-size: 0.65rem; color: var(--text-muted); align-self: flex-start;">Just now</span>
        </div>
      </div>
    </div>
    
    <div class="ai-panel-input">
      <div style="display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;">
        <div class="suggestion-chip" onclick="sendSuggestion('Budget summary')" style="font-size: 0.75rem; padding: 4px 8px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; white-space: nowrap;">Budget summary</div>
        <div class="suggestion-chip" onclick="sendSuggestion('Top expense?')" style="font-size: 0.75rem; padding: 4px 8px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; cursor: pointer; white-space: nowrap;">Top expense?</div>
      </div>
      <form id="chat-form" style="display: flex; gap: 8px;">
        <input type="text" id="chat-input" class="form-control" placeholder="Ask anything..." style="padding: 8px 12px;" autocomplete="off">
        <button type="submit" class="btn btn-primary" style="padding: 8px 16px;"><i class="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  </div>
  <script src="js/firebase.js"></script>
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
  <script src="js/dashboard.js"></script>
  <script src="js/ai.js"></script>
</body>
</html>

// High Density Dashboard Logic
const categoryIcons = {
  food: 'fa-burger',
  transport: 'fa-car',
  shopping: 'fa-bag-shopping',
  bills: 'fa-file-invoice-dollar',
  entertainment: 'fa-ticket',
  other: 'fa-hashtag'
};
function initDashboard() {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = dateStr;
  const isCalendarPage = window.location.pathname.includes('calendar.html');
  const user = window.Store.getUser();
  if (!isCalendarPage && user && user.name) {
    const firstName = user.name.split(' ')[0];
    const greetingEl = document.getElementById('greeting');
    if(greetingEl) greetingEl.textContent = `Welcome back, ${firstName} 👋`;
  } else {
    const greetingEl = document.getElementById('greeting');
    if(greetingEl) greetingEl.textContent = isCalendarPage ? 'Calendar 🗓️' : 'Overview 🏠';
  }
  const searchEl = document.getElementById('search-expense');
  if (searchEl) searchEl.addEventListener('input', renderExpenseList);
  
  const reminderForm = document.getElementById('reminder-form');
  if (reminderForm) reminderForm.addEventListener('submit', handleReminderSubmit);
  updateDashboard();
}
function updateDashboard() {
  try { renderStats(); } catch(e){ console.error('Stats error:', e); }
  try { renderExpenseList(); } catch(e){ console.error('ExpenseList error:', e); }
  try { renderHighDensityWidgets(); } catch(e){ console.error('HD Widgets error:', e); }
  try { renderSmartInsights(); } catch(e){ console.error('SmartInsights error:', e); }
  try { renderCalendar(); } catch(e){ console.error('Calendar error:', e); }
  try { renderReminders(); } catch(e){ console.error('Reminders error:', e); }
}
function renderStats() {
  const balanceEl = document.getElementById('stat-balance');
  if (!balanceEl) return;
  
  const expenses = window.Store.getExpenses();
  const budget = window.Store.getBudget() || 0;
  const now = new Date();
  const currentMonthExp = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSpent = currentMonthExp.reduce((sum, e) => sum + e.amount, 0);
  const remaining = budget - totalSpent;
  const percent = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  document.getElementById('stat-balance').textContent = window.App.formatCurrency(Math.max(remaining, 0));
  document.getElementById('stat-spent').textContent = window.App.formatCurrency(totalSpent);
  document.getElementById('stat-remaining').textContent = window.App.formatCurrency(remaining);
  document.getElementById('stat-budget-limit').textContent = window.App.formatCurrency(budget);
  
  document.getElementById('stat-spent-percent').textContent = `${percent}%`;
  const spentFooter = document.getElementById('stat-spent-footer');
  if (percent > 100) {
    document.getElementById('stat-spent').style.color = 'var(--danger)';
    spentFooter.classList.add('trend-down');
    spentFooter.classList.remove('trend-up');
    spentFooter.innerHTML = `<i class="fa-solid fa-arrow-up"></i> <span>Exceeded by ${percent - 100}%</span>`;
  } else {
    document.getElementById('stat-spent').style.color = 'var(--text-main)';
    spentFooter.classList.add('trend-up');
    spentFooter.classList.remove('trend-down');
    spentFooter.innerHTML = `<i class="fa-solid fa-check"></i> <span>${percent}% used</span>`;
  }
  // Budget Ring
  const ring = document.getElementById('budget-ring');
  const ringText = document.getElementById('budget-ring-text');
  if (ring && ringText) {
    const clampedPercent = Math.min(percent, 100);
    ring.style.strokeDasharray = `${clampedPercent}, 100`;
    ring.style.stroke = percent > 85 ? 'var(--danger)' : 'var(--accent-red)';
    ringText.textContent = `${percent}%`;
  }
  updateHealthScore(percent, budget);
}
function updateHealthScore(percent, budget) {
  if (!budget || budget === 0) {
    document.getElementById('stat-health').textContent = '--/100';
    document.getElementById('stat-health-status').textContent = 'Budget not set';
    return;
  }
  let score = 100;
  
  if (percent <= 75) {
    // Drops gradually from 100 down to 85 (15 points range)
    score = 100 - Math.round((percent / 75) * 15);
  } else if (percent <= 100) {
    // Drops gradually from 85 down to 70 (15 points range)
    score = 85 - Math.round(((percent - 75) / 25) * 15);
  } else if (percent <= 150) {
    // Drops dynamically from 70 down to 20 (50 points range)
    score = 70 - Math.round(((percent - 100) / 50) * 50);
  } else {
    // Drops from 20 down to 0 (20 points range)
    score = 20 - Math.round(((percent - 150) / 50) * 20);
  }
  
  score = Math.min(100, Math.max(0, score));
  
  document.getElementById('stat-health').textContent = `${score}/100`;
  
  const statusEl = document.getElementById('stat-health-status');
  if (score >= 90) {
    statusEl.textContent = 'Excellent standing';
    statusEl.style.color = 'var(--accent-purple)';
  } else if (score >= 70) {
    statusEl.textContent = 'Stable performance';
    statusEl.style.color = 'var(--warning)';
  } else {
    statusEl.textContent = 'Requires attention';
    statusEl.style.color = 'var(--danger)';
  }
}
function renderHighDensityWidgets() {
  const expenses = window.Store.getExpenses();
  const now = new Date();
  
  const currentMonthExp = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  
  // Daily Average
  const currentDay = Math.max(1, now.getDate());
  const totalSpent = currentMonthExp.reduce((sum, e) => sum + e.amount, 0);
  
  const dailyAvg = totalSpent / currentDay;
  const avgEl = document.getElementById('daily-avg');
  const avgSub = document.getElementById('daily-avg-sub');
  
  if(avgEl) avgEl.textContent = window.App.formatCurrency(dailyAvg);
  if(avgSub) avgSub.textContent = `Based on ${currentDay} days`;
}
function renderSmartInsights() {
  const container = document.getElementById('smart-insights-container');
  if (!container) return;
  const expenses = window.Store.getExpenses();
  const budget = window.Store.getBudget();
  
  if (expenses.length === 0) {
    container.innerHTML = `<p class="text-sm text-muted">Add some transactions to generate insights.</p>`;
    return;
  }
  const insights = [];
  
  // Logic 1: Budget utilization
  const now = new Date();
  const currentMonthExp = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalSpent = currentMonthExp.reduce((sum, e) => sum + e.amount, 0);
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  const projectedSpend = (totalSpent / currentDay) * daysInMonth;
  
  if (budget && projectedSpend > budget) {
    insights.push({
      icon: 'fa-triangle-exclamation',
      color: 'var(--danger)',
      text: `⚠️ You are projected to exceed your budget by ${window.App.formatCurrency(projectedSpend - budget)} this month.`
    });
  } else if (budget && totalSpent < budget * (currentDay / daysInMonth)) {
    insights.push({
      icon: 'fa-thumbs-up',
      color: 'var(--success)',
      text: `🎉 Great job! Your spending is currently below the daily target average.`
    });
  }
  // Logic 2: Top Category Alert
  const catTotals = {};
  currentMonthExp.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1] - a[1]);
  
  if (sortedCats.length > 0 && budget) {
    const topCatPct = Math.round((sortedCats[0][1] / budget) * 100);
    if (topCatPct > 30) {
      insights.push({
        icon: 'fa-magnifying-glass-chart',
        color: 'var(--warning)',
        text: `🔍 Your ${sortedCats[0][0]} expenses account for ${topCatPct}% of your total monthly budget limit.`
      });
    }
  }
  
  // Default fallback
  if (insights.length === 0) {
    insights.push({
      icon: 'fa-check',
      color: 'var(--accent-primary)',
      text: `✅ Your financial profile is looking stable this week.`
    });
  }
  
  container.innerHTML = insights.map(ins => `
    <div style="display: flex; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
      <div style="color: ${ins.color}; font-size: 1.25rem;"><i class="fa-solid ${ins.icon}"></i></div>
      <div style="font-size: 0.875rem; color: var(--text-main); line-height: 1.5;">${ins.text}</div>
    </div>
  `).join('');
}
function renderExpenseList() {
  const listEl = document.getElementById('expense-list');
  if (!listEl) return;
  let expenses = window.Store.getExpenses();
  
  const searchEl = document.getElementById('search-expense');
  const searchVal = searchEl ? searchEl.value.toLowerCase() : '';
  if (searchVal) {
    expenses = expenses.filter(e => e.description.toLowerCase().includes(searchVal));
  }
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (expenses.length === 0) {
    listEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px 20px; font-size: 0.875rem;">No transactions found.</p>';
    return;
  }
  listEl.innerHTML = expenses.map(e => `
    <div class="expense-item animate-fade-in">
      <div class="expense-info">
        <div class="expense-icon" style="background: var(--bg-main); color: var(--text-muted); border: 1px solid var(--border-color);">
          <i class="fa-solid ${categoryIcons[e.category] || 'fa-receipt'}"></i>
        </div>
        <div class="expense-details">
          <h4>${e.description}</h4>
          <p>${e.category.charAt(0).toUpperCase() + e.category.slice(1)} • ${window.App.formatDate(e.date)}</p>
        </div>
      </div>
      <div class="expense-amount">
        <span>${window.App.formatCurrency(e.amount)}</span>
        <div class="expense-actions">
          <button class="btn-icon" onclick="openExpenseModal('${e.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon danger" onclick="deleteExpense('${e.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
}
// --- Calendar System ---
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('calendar-month-year').textContent = `${monthNames[month]} ${year}`;
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const expenses = window.Store.getExpenses();
  const budget = window.Store.getBudget() || 0;
  const dailyBudget = budget / daysInMonth;
  
  const dailyTotals = {};
  expenses.forEach(e => {
    const d = new Date(e.date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      dailyTotals[d.getDate()] = (dailyTotals[d.getDate()] || 0) + e.amount;
    }
  });
  let html = '';
  // Empty spaces for previous month
  for(let i = 0; i < firstDay; i++) {
    html += `<div></div>`;
    html += `<div class="day-cell-empty"></div>`;
  }
  
  for(let i = 1; i <= daysInMonth; i++) {
    const spent = dailyTotals[i] || 0;
    let bgColor = 'var(--bg-main)';
    let borderColor = 'var(--border-color)';
    let tooltip = `Spent: ${window.App.formatCurrency(spent)}`;
    const hasTransactions = spent > 0;
    
    let classes = ['day-cell'];
    if (hasTransactions) classes.push('has-transactions');
    if (i === now.getDate() && month === now.getMonth() && year === now.getFullYear()) {
      classes.push('today');
    }
    
    const isToday = (i === now.getDate()) ? 'box-shadow: 0 0 0 2px var(--accent-primary);' : '';
    let tooltip = `Spent: ${window.App.formatCurrency(spent)}`;
    
    html += `
      <div style="padding: 6px 2px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 4px; cursor: pointer; transition: transform 0.2s; ${isToday}" 
      <div class="${classes.join(' ')}" 
           title="${tooltip}"
           onclick="showDayData(${year}, ${month}, ${i})"
           onmouseover="this.style.transform='scale(1.1)'"
           onmouseout="this.style.transform='scale(1)'">
        ${i}
           onclick="showDayData(${year}, ${month}, ${i})">
        <span>${i}</span>
        <div class="day-dot"></div>
      </div>
    `;
  }
  grid.innerHTML = html;
}
function showDayData(year, month, day) {
  const modal = document.getElementById('day-data-modal');
  if (!modal) return;
  const title = document.getElementById('day-data-title');
  const list = document.getElementById('day-data-list');
  
  const d = new Date(year, month, day);
  title.textContent = `Transactions on ${d.toLocaleDateString()}`;
  
  const expenses = window.Store.getExpenses().filter(e => {
    const ed = new Date(e.date);
    return ed.getFullYear() === year && ed.getMonth() === month && ed.getDate() === day;
  });
  
  if (expenses.length === 0) {
    list.innerHTML = '<p class="text-muted" style="text-align:center;">No transactions for this day.</p>';
  } else {
    list.innerHTML = expenses.map(e => `
      <div style="display:flex; justify-content:space-between; padding: 12px; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 8px;">
        <div>
          <div style="font-weight:600">${e.description}</div>
          <div style="font-size:0.8rem; color:var(--text-muted)">${e.category}</div>
        </div>
        <div style="font-weight:700">${window.App.formatCurrency(e.amount)}</div>
      </div>
    `).join('');
  }
  modal.style.display = 'flex';
}
// --- Reminders System ---
function renderReminders() {
  const listEl = document.getElementById('reminders-list');
  if (!listEl) return;
  
  let reminders = window.Store.getReminders();
  
  if (reminders.length === 0) {
    listEl.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px 20px; font-size: 0.875rem;">No upcoming reminders.</p>';
    return;
  }
  
  // Sort by startDate
  reminders.sort((a, b) => new Date(a.startDate || a.dueDate) - new Date(b.startDate || b.dueDate));
  
  const now = new Date();
  now.setHours(0,0,0,0);
  
  listEl.innerHTML = reminders.map(r => {
    const dDate = new Date(r.startDate || r.dueDate);
    dDate.setHours(0,0,0,0);
    const diffTime = dDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let colorClass = 'text-muted';
    let label = window.App.formatDate(dDate);
    
    if (diffDays < 0) {
      colorClass = 'text-danger';
      label = `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      colorClass = 'text-warning';
      label = 'Due Today';
    } else if (diffDays <= 3) {
      colorClass = 'text-warning';
      label = `Due in ${diffDays} days`;
    }
    
    const freqBadge = r.frequency !== 'once' ? `<span style="font-size: 0.6rem; padding: 2px 6px; border-radius: 12px; background: var(--bg-card); border: 1px solid var(--border-color);">${r.frequency.charAt(0).toUpperCase() + r.frequency.slice(1)}</span>` : '';
    return `
      <div class="expense-item animate-fade-in" style="background: linear-gradient(145deg, var(--bg-card), var(--bg-main)); border: 1px solid var(--border-color);">
        <div class="expense-info">
          <div class="expense-icon" style="background: var(--bg-main); color: var(--accent-primary); border: 1px solid var(--border-color);">
            <i class="fa-solid fa-repeat"></i>
          </div>
          <div class="expense-details">
            <h4 style="font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">${r.title} ${freqBadge}</h4>
            <p class="${colorClass}" style="font-weight: 500;">${label}</p>
          </div>
        </div>
        <div class="expense-amount">
          ${r.amount ? `<span>${window.App.formatCurrency(r.amount)}</span>` : ''}
          <div class="expense-actions" style="display: flex; opacity: 1; align-items: center; gap: 4px; margin-left: 12px;">
            <button class="btn-icon" style="color: var(--success);" onclick="completeReminder('${r.id}')" title="Mark Completed"><i class="fa-solid fa-check-circle"></i></button>
            <button class="btn-icon" onclick="editReminder('${r.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-icon danger" onclick="deleteReminder('${r.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
function openReminderModal() {
  document.getElementById('reminder-form').reset();
  document.getElementById('reminder-id').value = '';
  document.getElementById('reminder-frequency').value = 'monthly';
  document.getElementById('reminder-modal-title').textContent = 'Add Recurring Payment';
  document.getElementById('reminder-modal').classList.add('active');
}
function closeReminderModal() {
  document.getElementById('reminder-modal').classList.remove('active');
}
function editReminder(id) {
  const r = window.Store.getReminders().find(r => r.id === id);
  if (r) {
    document.getElementById('reminder-id').value = r.id;
    document.getElementById('reminder-title').value = r.title;
    document.getElementById('reminder-amount').value = r.amount || '';
    document.getElementById('reminder-frequency').value = r.frequency || 'monthly';
    document.getElementById('reminder-start-date').value = r.startDate || r.dueDate || '';
    document.getElementById('reminder-end-date').value = r.endDate || '';
    
    document.getElementById('reminder-modal-title').textContent = 'Edit Recurring Payment';
    document.getElementById('reminder-modal').classList.add('active');
  }
}
function handleReminderSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('reminder-id').value;
  
  if (window.Store.accountId === 'demo') {
    if(typeof showToast === 'function') showToast('Read-only Demo Mode: Cannot save changes.');
    return;
  }
  
  const data = {
    title: document.getElementById('reminder-title').value,
    amount: document.getElementById('reminder-amount').value ? parseFloat(document.getElementById('reminder-amount').value) : null,
    frequency: document.getElementById('reminder-frequency').value,
    startDate: document.getElementById('reminder-start-date').value,
    endDate: document.getElementById('reminder-end-date').value || null
  };
  
  if (id) {
    window.Store.updateReminder(id, data);
    if(typeof showToast === 'function') showToast('Payment updated');
  } else {
    window.Store.addReminder(data);
    if(typeof showToast === 'function') showToast('Payment scheduled');
  }
  
  closeReminderModal();
  renderReminders();
}
function completeReminder(id) {
  if (window.Store.accountId === 'demo') {
    if(typeof showToast === 'function') showToast('Read-only Demo Mode: Cannot modify data.');
    return;
  }
  window.Store.completeReminder(id);
  if(typeof showToast === 'function') showToast('Payment logged and advanced to next due date.');
  renderReminders();
}
function deleteReminder(id) {
  if (window.Store.accountId === 'demo') {
    if(typeof showToast === 'function') showToast('Read-only Demo Mode: Cannot delete data.');
    return;
  }
  if (confirm("Cancel this recurring payment permanently?")) {
    window.Store.deleteReminder(id);
    if(typeof showToast === 'function') showToast('Payment cancelled');
    renderReminders();
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.waitForApp(initDashboard));
} else {
  window.waitForApp(initDashboard);
}
// Re-render when user changes currency in Settings
document.addEventListener('currencyChanged', () => {
  if (typeof updateDashboard === 'function') updateDashboard();
});
