class Store {
  constructor() {
    this.init();
  }

  get accountId() {
    return localStorage.getItem('spendSmart_currentAccount') || 'default';
  }

  getPrefix() {
    return `spendSmart_${this.accountId}_`;
  }

  init() {
    // Only init if the keys are entirely missing for this account
    const p = this.getPrefix();
    if (!localStorage.getItem(p + 'expenses')) {
      localStorage.setItem(p + 'expenses', JSON.stringify([]));
    }
    if (!localStorage.getItem(p + 'goals')) {
      localStorage.setItem(p + 'goals', JSON.stringify([]));
    }
    if (!localStorage.getItem(p + 'reminders')) {
      localStorage.setItem(p + 'reminders', JSON.stringify([]));
    }
    if (!localStorage.getItem(p + 'settings')) {
      localStorage.setItem(p + 'settings', JSON.stringify({
        theme: 'dark',
        currency: 'USD',
        onboardingComplete: false
      }));
    }
    if (!localStorage.getItem(p + 'user')) {
      localStorage.setItem(p + 'user', JSON.stringify({
        name: '',
        age: '',
        country: '',
        language: 'en',
        income: 0,
        budgetGoal: 0
      }));
    }
  }

  // Helper for dynamic keys
  _get(key) {
    return JSON.parse(localStorage.getItem(this.getPrefix() + key));
  }

  _set(key, data) {
    localStorage.setItem(this.getPrefix() + key, JSON.stringify(data));
  }

  // --- User Profile (Onboarding & Settings) ---
  getUser() {
    return this._get('user');
  }

  updateUser(userData) {
    const user = { ...this.getUser(), ...userData };
    this._set('user', user);
    
    if (userData.budgetGoal) {
      this.setBudget(userData.budgetGoal);
    }
    return user;
  }

  // --- Expenses ---
  getExpenses() {
    return this._get('expenses') || [];
  }

  addExpense(expense) {
    const expenses = this.getExpenses();
    expense.id = Date.now().toString();
    expense.date = expense.date || new Date().toISOString();
    expenses.push(expense);
    this._set('expenses', expenses);
    return expense;
  }

  updateExpense(id, updatedData) {
    let expenses = this.getExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updatedData };
      this._set('expenses', expenses);
      return expenses[index];
    }
    return null;
  }

  deleteExpense(id) {
    let expenses = this.getExpenses();
    const expense = expenses.find(e => e.id === id);
    expenses = expenses.filter(e => e.id !== id);
    this._set('expenses', expenses);
    
    if (expense) {
      sessionStorage.setItem('spendSmart_undo', JSON.stringify(expense));
    }
  }

  undoDelete() {
    const expenseStr = sessionStorage.getItem('spendSmart_undo');
    if (expenseStr) {
      const expense = JSON.parse(expenseStr);
      let expenses = this.getExpenses();
      expenses.push(expense);
      this._set('expenses', expenses);
      sessionStorage.removeItem('spendSmart_undo');
      return expense;
    }
    return null;
  }

  // --- Reminders ---
  getReminders() {
    return this._get('reminders') || [];
  }

  addReminder(reminder) {
    const reminders = this.getReminders();
    reminder.id = Date.now().toString();
    reminders.push(reminder);
    this._set('reminders', reminders);
    return reminder;
  }

  updateReminder(id, updatedData) {
    let reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      reminders[index] = { ...reminders[index], ...updatedData };
      this._set('reminders', reminders);
      return reminders[index];
    }
    return null;
  }

  deleteReminder(id) {
    let reminders = this.getReminders();
    reminders = reminders.filter(r => r.id !== id);
    this._set('reminders', reminders);
  }

  completeReminder(id) {
    let reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      const r = reminders[index];
      if (r.frequency === 'once') {
        this.deleteReminder(id);
        return null;
      }
      
      const d = new Date(r.startDate || r.dueDate); // handle legacy dueDate
      if (r.frequency === 'weekly') d.setDate(d.getDate() + 7);
      else if (r.frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1); // default monthly
      
      const nextDateStr = d.toISOString().split('T')[0];
      
      if (r.endDate && new Date(nextDateStr) > new Date(r.endDate)) {
        this.deleteReminder(id);
        return null;
      }

      r.startDate = nextDateStr;
      r.dueDate = nextDateStr; // keep legacy sync
      this._set('reminders', reminders);
      return r;
    }
    return null;
  }

  // --- Budget ---
  getBudget() {
    const user = this.getUser();
    return user.budgetGoal || 0;
  }

  setBudget(amount) {
    const user = this.getUser();
    user.budgetGoal = Number(amount);
    this._set('user', user);
  }

  // --- Goals ---
  getGoals() {
    return this._get('goals') || [];
  }

  addGoal(goal) {
    const goals = this.getGoals();
    goal.id = Date.now().toString();
    goal.current = goal.current || 0;
    goals.push(goal);
    this._set('goals', goals);
    return goal;
  }
  
  updateGoal(id, currentAmount) {
    const goals = this.getGoals();
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      goals[index].current = currentAmount;
      this._set('goals', goals);
    }
  }
  
  deleteGoal(id) {
    let goals = this.getGoals();
    goals = goals.filter(g => g.id !== id);
    this._set('goals', goals);
  }

  // --- Settings ---
  getSettings() {
    return this._get('settings');
  }

  updateSettings(newSettings) {
    const settings = { ...this.getSettings(), ...newSettings };
    this._set('settings', settings);
    return settings;
  }

  isOnboardingComplete() {
    const settings = this.getSettings();
    return settings && settings.onboardingComplete === true;
  }
}

// Global instance
window.Store = new Store();
