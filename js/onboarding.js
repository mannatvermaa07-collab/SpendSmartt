// Onboarding Logic
function nextStep(step) {
  // Simple validation for step 1
  if (step === 2) {
    const name = document.getElementById('ob-name').value;
    const age = document.getElementById('ob-age').value;
    if (!name || !age) {
      alert("Please fill out your name and age.");
      return;
    }
  }

  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (step === 1) progressBar.style.width = '50%';
  if (step === 2) progressBar.style.width = '100%';
}

document.getElementById('onboarding-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const userProfile = {
    name: document.getElementById('ob-name').value,
    age: document.getElementById('ob-age').value,
    country: document.getElementById('ob-country').value,
    language: 'en', // Defaulting for now
    income: parseFloat(document.getElementById('ob-income').value),
    budgetGoal: parseFloat(document.getElementById('ob-budget').value)
  };

  const currency = document.getElementById('ob-currency').value;

  // Save to Store
  window.Store.updateUser(userProfile);
  window.Store.updateSettings({ currency, onboardingComplete: true });

  // Redirect to dashboard
  window.location.href = 'dashboard.html';
});
