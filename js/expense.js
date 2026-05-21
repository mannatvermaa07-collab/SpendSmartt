// Toast Notification System
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'success' 
    ? '<i class="fa-solid fa-circle-check success"></i>' 
    : '<i class="fa-solid fa-circle-exclamation error"></i>';

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  if (type === 'undo') {
    toast.innerHTML += `<button class="btn-icon" style="margin-left: auto; color: var(--accent-blue); font-weight: bold; text-decoration: underline;" onclick="undoDeleteExpense()">Undo</button>`;
  }

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, type === 'undo' ? 6000 : 3000);
}

// Modal Logic
const modal = document.getElementById('expense-modal');
const form = document.getElementById('expense-form');

function openExpenseModal(expenseId = null) {
  const title = document.getElementById('modal-title');
  
  if (expenseId) {
    title.textContent = 'Edit Expense';
    const expenses = window.Store.getExpenses();
    const exp = expenses.find(e => e.id === expenseId);
    if (exp) {
      document.getElementById('expense-id').value = exp.id;
      document.getElementById('expense-amount').value = exp.amount;
      document.getElementById('expense-desc').value = exp.description;
      document.getElementById('expense-category').value = exp.category;
      document.getElementById('expense-date').value = exp.date.split('T')[0];
    }
  } else {
    title.textContent = 'Add Expense';
    form.reset();
    document.getElementById('expense-id').value = '';
    document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
  }
  
  modal.classList.add('active');
}

function closeExpenseModal() {
  modal.classList.remove('active');
}

// Form Submission
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const id = document.getElementById('expense-id').value;
  const expenseData = {
    amount: parseFloat(document.getElementById('expense-amount').value),
    description: document.getElementById('expense-desc').value,
    category: document.getElementById('expense-category').value,
    date: new Date(document.getElementById('expense-date').value).toISOString()
  };

  if (id) {
    window.Store.updateExpense(id, expenseData);
    showToast('Expense updated successfully');
  } else {
    window.Store.addExpense(expenseData);
    showToast('Expense added successfully');
  }

  closeExpenseModal();
  
  // Trigger dashboard update if exists
  if (typeof updateDashboard === 'function') {
    updateDashboard();
  }
});

// Delete and Undo
function deleteExpense(id) {
  window.Store.deleteExpense(id);
  showToast('Expense deleted', 'undo');
  
  if (typeof updateDashboard === 'function') {
    updateDashboard();
  }
}

function undoDeleteExpense() {
  const restored = window.Store.undoDelete();
  if (restored) {
    showToast('Expense restored');
    if (typeof updateDashboard === 'function') {
      updateDashboard();
    }
  }
}
