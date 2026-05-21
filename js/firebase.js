// ============================================================
// SpendSmart — Local Mock Auth (Compat with Firebase Auth Calls)
// ============================================================

class MockFirebaseAuth {
  constructor() {
    this.listeners = new Set();
    this.currentUser = null;
    this.initCurrentUser();
  }

  initCurrentUser() {
    const currentUid = localStorage.getItem('spendSmart_currentAccount');
    if (currentUid && currentUid !== 'demo') {
      const accounts = JSON.parse(localStorage.getItem('spendSmart_local_accounts') || '{}');
      const account = Object.values(accounts).find(acc => acc.uid === currentUid);
      if (account) {
        this.currentUser = {
          uid: account.uid,
          email: account.email,
          displayName: account.name,
          photoURL: null,
          updateProfile: async (profileData) => {
            if (profileData.displayName) {
              account.name = profileData.displayName;
              accounts[account.email.toLowerCase()] = account;
              localStorage.setItem('spendSmart_local_accounts', JSON.stringify(accounts));
              this.currentUser.displayName = profileData.displayName;
            }
          }
        };
      } else {
        // Fallback for social sign-ins or generic users
        let displayName = 'User';
        let email = 'user@example.com';
        if (currentUid === 'usr_google') {
          displayName = 'Google User';
          email = 'google.user@gmail.com';
        } else if (currentUid === 'usr_apple') {
          displayName = 'Apple User';
          email = 'apple.user@icloud.com';
        }
        this.currentUser = {
          uid: currentUid,
          email: email,
          displayName: displayName,
          photoURL: currentUid === 'usr_google' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' : null,
          updateProfile: async () => {}
        };
      }
    } else {
      this.currentUser = null;
    }
  }

  onAuthStateChanged(callback) {
    this.listeners.add(callback);
    // Fire initially
    setTimeout(() => {
      callback(this.currentUser);
    }, 0);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  async signInWithEmailAndPassword(email, password) {
    const accounts = JSON.parse(localStorage.getItem('spendSmart_local_accounts') || '{}');
    const acc = accounts[email.toLowerCase()];
    if (!acc || acc.password !== password) {
      const err = new Error("Incorrect email or password.");
      err.code = 'auth/invalid-credential';
      throw err;
    }
    localStorage.setItem('spendSmart_currentAccount', acc.uid);
    this.initCurrentUser();
    this.listeners.forEach(cb => cb(this.currentUser));
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email, password) {
    if (!email || !email.includes('@')) {
      const err = new Error("Invalid email format.");
      err.code = 'auth/invalid-email';
      throw err;
    }
    if (password.length < 6) {
      const err = new Error("Password must be at least 6 characters.");
      err.code = 'auth/weak-password';
      throw err;
    }
    const accounts = JSON.parse(localStorage.getItem('spendSmart_local_accounts') || '{}');
    if (accounts[email.toLowerCase()]) {
      const err = new Error("An account already exists with this email.");
      err.code = 'auth/email-already-in-use';
      throw err;
    }

    const uid = 'usr_' + Math.random().toString(36).substr(2, 9);
    accounts[email.toLowerCase()] = { name: '', email, password, uid };
    localStorage.setItem('spendSmart_local_accounts', JSON.stringify(accounts));
    
    localStorage.setItem('spendSmart_currentAccount', uid);
    this.initCurrentUser();
    this.listeners.forEach(cb => cb(this.currentUser));
    return { user: this.currentUser };
  }

  async signOut() {
    localStorage.removeItem('spendSmart_currentAccount');
    this.currentUser = null;
    this.listeners.forEach(cb => cb(null));
  }
}

const authInstance = new MockFirebaseAuth();
window.firebaseAuth = authInstance;

// Expose legacy helpers
window.signInWithGoogle = async function () {
  localStorage.setItem('spendSmart_currentAccount', 'usr_google');
  authInstance.initCurrentUser();
  authInstance.listeners.forEach(cb => cb(authInstance.currentUser));
  return authInstance.currentUser;
};

window.signInWithApple = async function () {
  localStorage.setItem('spendSmart_currentAccount', 'usr_apple');
  authInstance.initCurrentUser();
  authInstance.listeners.forEach(cb => cb(authInstance.currentUser));
  return authInstance.currentUser;
};

window.signInWithEmail = async function (email, password) {
  const result = await authInstance.signInWithEmailAndPassword(email, password);
  return result.user;
};

window.signUpWithEmail = async function (email, password) {
  const result = await authInstance.createUserWithEmailAndPassword(email, password);
  return result.user;
};

window.firebaseSignOut = async function () {
  await authInstance.signOut();
};

window.getCurrentFirebaseUser = function () {
  return authInstance.currentUser;
};
