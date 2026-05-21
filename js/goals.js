// Professional Savings Goals Logic

let currentGoalId = null;

function initGoals() {
  renderGoals();
  document.getElementById('goal-form').addEventListener('submit', handleAddGoal);
  document.getElementById('fund-form').addEventListener('submit', handleAddFunds);
}

function renderGoals() {
  const container = document.getElementById('goals-container');
  const goals = window.Store.getGoals();

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="card section-card" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <div style="font-size: 3rem; color: var(--border-color); margin-bottom: 16px;"><i class="fa-solid fa-bullseye"></i></div>
        <h3 style="margin-bottom: 8px;">No Savings Goals Yet</h3>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Create your first milestone and start tracking your savings.</p>
        <button class="btn btn-primary" onclick="openGoalModal()" style="margin: 0 auto;">Create New Goal</button>
      </div>
    `;
    return;
  }

  container.innerHTML = goals.map(g => {
    const percent = Math.min(Math.round((g.current / g.target) * 100), 100);
    const isCompleted = percent >= 100;
    
    // Calculate estimated completion
    let estimateStr = "Ongoing";
    if (!isCompleted && g.current > 0) {
      const avgMonthly = (g.current / Math.max(1, (Date.now() - parseInt(g.id)) / (1000 * 60 * 60 * 24 * 30)));
      if (avgMonthly > 0) {
        const monthsLeft = Math.ceil((g.target - g.current) / avgMonthly);
        const estDate = new Date();
        estDate.setMonth(estDate.getMonth() + monthsLeft);
        estimateStr = `Est. ${estDate.toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}`;
      }
    } else if (isCompleted) {
      estimateStr = "Goal Achieved!";
    }

    return `
      <div class="card goal-card">
        <div class="goal-header">
          <div class="goal-icon"><i class="fa-solid ${isCompleted ? 'fa-trophy' : 'fa-bullseye'}"></i></div>
          <button class="btn-icon text-muted" onclick="deleteGoal('${g.id}')" title="Delete Goal"><i class="fa-solid fa-trash"></i></button>
        </div>
        
        <div>
          <h3 class="goal-title">${g.name}</h3>
          <div style="font-size: 0.875rem; color: var(--text-muted);">
            ${window.App.formatCurrency(g.current)} / ${window.App.formatCurrency(g.target)}
          </div>
        </div>

        <div class="goal-ring-container">
          <div class="ring-wrapper">
            <svg class="ring-svg" viewBox="0 0 36 36">
              <path class="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="ring-progress" stroke-dasharray="${percent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="ring-text" style="color: ${isCompleted ? 'var(--success)' : 'var(--text-main)'}">${percent}%</div>
          </div>
          
          <div class="goal-details">
            <div class="badge ${isCompleted ? 'completed' : ''}">
              <i class="fa-solid ${isCompleted ? 'fa-check-circle' : 'fa-clock'}"></i> ${estimateStr}
            </div>
            ${!isCompleted ? `
              <button class="btn btn-secondary" onclick="openFundModal('${g.id}')" style="margin-top: 12px; width: 100%; font-size: 0.75rem; padding: 6px;">Add Funds</button>
            ` : `
              <button class="btn btn-primary" style="margin-top: 12px; width: 100%; font-size: 0.75rem; padding: 6px;" disabled>Completed</button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openGoalModal() {
  document.getElementById('goal-form').reset();
  const modal = document.getElementById('goal-modal');
  modal.classList.add('active');
}

function closeGoalModal() {
  document.getElementById('goal-modal').classList.remove('active');
}

function handleAddGoal(e) {
  e.preventDefault();
  
  const goal = {
    name: document.getElementById('goal-name').value,
    target: parseFloat(document.getElementById('goal-target').value),
    current: 0
  };
  
  window.Store.addGoal(goal);
  closeGoalModal();
  renderGoals();
  if(typeof showToast === 'function') showToast('Goal created successfully');
}

function openFundModal(id) {
  currentGoalId = id;
  document.getElementById('fund-form').reset();
  document.getElementById('fund-goal-id').value = id;
  const modal = document.getElementById('fund-modal');
  modal.classList.add('active');
}

function closeFundModal() {
  document.getElementById('fund-modal').classList.remove('active');
  currentGoalId = null;
}

function handleAddFunds(e) {
  e.preventDefault();
  
  const amount = parseFloat(document.getElementById('fund-amount').value);
  const goals = window.Store.getGoals();
  const goal = goals.find(g => g.id === currentGoalId);
  
  if (goal) {
    const newAmount = goal.current + amount;
    window.Store.updateGoal(currentGoalId, newAmount);
    closeFundModal();
    renderGoals();
    if(typeof showToast === 'function') showToast('Funds added successfully');
  }
}

function deleteGoal(id) {
  if (confirm("Are you sure you want to delete this goal?")) {
    window.Store.deleteGoal(id);
    renderGoals();
    if(typeof showToast === 'function') showToast('Goal deleted');
  }
}

// Global modal close on outside click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => window.waitForApp(initGoals));

// Re-render when user changes currency in Settings
document.addEventListener('currencyChanged', () => {
  if (typeof renderGoals === 'function') renderGoals();
});
