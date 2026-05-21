// High Density Analytics Logic

let charts = {};

function initAnalytics() {
  updateChartDefaults();

  renderSummaryMetrics();
  renderCharts();
  
  // Listen for dynamic theme changes to recolor charts
  document.addEventListener('themeChanged', () => {
    updateChartDefaults();
    if (charts.category) charts.category.update();
    if (charts.monthly) charts.monthly.update();
    if (charts.trend) charts.trend.update();
  });
}

function updateChartDefaults() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // Base text color
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.borderColor = gridColor;
  
  // If charts exist, we need to manually update their scales because Chart.defaults 
  // sometimes doesn't retroactively apply to explicitly defined scale options.
  if (charts.trend) {
    charts.trend.options.scales.x.ticks.color = textColor;
    charts.trend.options.scales.y.ticks.color = textColor;
    charts.trend.options.scales.y.grid.color = gridColor;
  }
  if (charts.monthly) {
    charts.monthly.options.scales.x.ticks.color = textColor;
    charts.monthly.options.scales.y.ticks.color = textColor;
    charts.monthly.options.scales.y.grid.color = gridColor;
  }
}

function renderSummaryMetrics() {
  const expenses = window.Store.getExpenses();
  const now = new Date();
  
  // Total Spend
  const currentYearExp = expenses.filter(e => new Date(e.date).getFullYear() === now.getFullYear());
  const ytdSpend = currentYearExp.reduce((sum, e) => sum + e.amount, 0);
  document.getElementById('an-ytd-spend').textContent = window.App.formatCurrency(ytdSpend);

  // Run Rate (Avg monthly based on months passed so far)
  const currentMonth = now.getMonth() + 1;
  const runRate = ytdSpend / currentMonth;
  document.getElementById('an-run-rate').textContent = window.App.formatCurrency(runRate);

  // Top Category All-time
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  let topCat = 'N/A';
  let max = 0;
  for (const [cat, amt] of Object.entries(catTotals)) {
    if (amt > max) { max = amt; topCat = cat; }
  }
  document.getElementById('an-top-cat').textContent = topCat !== 'N/A' ? topCat.charAt(0).toUpperCase() + topCat.slice(1) : 'N/A';
}

function renderCharts() {
  const expenses = window.Store.getExpenses();
  
  if (charts.category) charts.category.destroy();
  if (charts.monthly) charts.monthly.destroy();
  if (charts.trend) charts.trend.destroy();

  // 1. Category Distribution
  const catTotals = {};
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  
  charts.category = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(catTotals).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [{
        data: Object.values(catTotals),
        backgroundColor: [
          '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12 } }
      },
      cutout: '70%'
    }
  });

  // 2. 6-Month Trend
  const monthlyTotals = {};
  const now = new Date();
  const monthsList = [];
  
  for(let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = d.toLocaleDateString('en-US', { month: 'short' });
    monthsList.push(mStr);
    monthlyTotals[mStr] = 0;
  }
  
  expenses.forEach(e => {
    const d = new Date(e.date);
    const mStr = d.toLocaleDateString('en-US', { month: 'short' });
    if (monthlyTotals[mStr] !== undefined) {
      monthlyTotals[mStr] += e.amount;
    }
  });

  charts.trend = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: monthsList,
      datasets: [{
        label: 'Total Expenses',
        data: monthsList.map(m => monthlyTotals[m]),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { color: Chart.defaults.color },
          grid: { color: Chart.defaults.borderColor }
        },
        x: { 
          grid: { display: false },
          ticks: { color: Chart.defaults.color }
        }
      }
    }
  });

  // 3. Monthly Overview (Bar)
  const budget = window.Store.getBudget() || 0;
  
  charts.monthly = new Chart(document.getElementById('monthlyChart'), {
    type: 'bar',
    data: {
      labels: monthsList,
      datasets: [
        {
          label: 'Spending',
          data: monthsList.map(m => monthlyTotals[m]),
          backgroundColor: '#6366f1',
          borderRadius: 4
        },
        {
          label: 'Budget Limit',
          data: monthsList.map(() => budget),
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          borderWidth: 1,
          type: 'line',
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 12 } }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { color: Chart.defaults.color },
          grid: { color: Chart.defaults.borderColor }
        },
        x: { 
          grid: { display: false },
          ticks: { color: Chart.defaults.color }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => window.waitForApp(initAnalytics));

// Re-render when user changes currency in Settings
document.addEventListener('currencyChanged', () => {
  if (typeof renderSummaryMetrics === 'function') renderSummaryMetrics();
});
