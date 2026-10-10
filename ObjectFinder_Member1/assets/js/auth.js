/* ============================================================
   ObjectFinder — auth.js
   Sign Up, Sign In, Email Verification, Forgot Password Logic
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   UTILITY HELPERS
───────────────────────────────────────── */

/**
 * Show or hide a hint element with a message.
 * @param {HTMLElement} hint  - The hint element
 * @param {string} message    - Message to display
 * @param {'error'|'success'|'info'} type
 */
function setHint(hint, message, type) {
  if (!hint) return;
  hint.textContent = message;
  hint.className = `form-hint hint-${type}`;
}

/**
 * Apply valid/invalid CSS class to an input.
 * @param {HTMLInputElement} input
 * @param {boolean} isValid
 */
function setInputState(input, isValid) {
  if (!input) return;
  input.classList.toggle('valid', isValid);
  input.classList.toggle('invalid', !isValid);
}

/**
 * Toggle show/hide for a password field.
 * @param {string} inputId   - ID of the password input
 * @param {string} toggleId  - ID of the toggle button/icon
 */
function initPasswordToggle(inputId, toggleId) {
  const input  = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.textContent = isPassword ? '🙈' : '👁';
    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

/* ─────────────────────────────────────────
   VALIDATION RULES
───────────────────────────────────────── */

const Rules = {
  /** Only English letters and spaces */
  username: (val) => /^[A-Za-z\s]+$/.test(val.trim()) && val.trim().length >= 2,

  /** Standard email format */
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()),

  /** Minimum 8 characters */
  password: (val) => val.length >= 8,

  /** Must match another field */
  match: (val, other) => val === other && val.length > 0,
};

/* ─────────────────────────────────────────
   SIGN UP PAGE
───────────────────────────────────────── */

(function initSignUp() {
  const form          = document.getElementById('signup-form');
  const mainView      = document.getElementById('signup-main');
  const verifyView    = document.getElementById('verify-pending');
  const successView   = document.getElementById('verify-success');

  if (!form) return; // Not on signup page

  const fields = {
    username:        document.getElementById('su-username'),
    email:           document.getElementById('su-email'),
    password:        document.getElementById('su-password'),
    confirmPassword: document.getElementById('su-confirm-password'),
    terms:           document.getElementById('su-terms'),
  };

  const hints = {
    username:        document.getElementById('hint-username'),
    email:           document.getElementById('hint-email'),
    password:        document.getElementById('hint-password'),
    confirmPassword: document.getElementById('hint-confirm'),
    terms:           document.getElementById('hint-terms'),
  };

  const strengthBar   = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');
  const submitBtn     = document.getElementById('signup-submit');

  /* ── Password toggles ── */
  initPasswordToggle('su-password', 'toggle-password');
  initPasswordToggle('su-confirm-password', 'toggle-confirm');

  /* ── Real-time username validation (No numbers, no special characters) ── */
  fields.username?.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;
    if (!/^[A-Za-z\s]$/.test(e.key)) {
      e.preventDefault();
      setHint(hints.username, '✕ Numbers and special characters are not allowed in names. Only alphabets (A-Z) allowed.', 'error');
    }
  });

  fields.username?.addEventListener('input', () => {
    const original = fields.username.value;
    const cleaned = original.replace(/[^A-Za-z\s]/g, '');
    if (original !== cleaned) {
      fields.username.value = cleaned;
      setHint(hints.username, '✕ Numbers and special characters are not allowed. Only alphabets allowed.', 'error');
      setInputState(fields.username, false);
      return;
    }
    const val = fields.username.value;
    if (!val) {
      setHint(hints.username, '', 'info');
      fields.username.classList.remove('valid', 'invalid');
      return;
    }
    if (val.trim().length < 2) {
      setHint(hints.username, '✕ Username must be at least 2 characters', 'error');
      setInputState(fields.username, false);
    } else {
      setHint(hints.username, '✓ Looks good!', 'success');
      setInputState(fields.username, true);
    }
  });

  /* ── Real-time email validation ── */
  fields.email?.addEventListener('input', () => {
    const val = fields.email.value;
    if (!val) {
      setHint(hints.email, '', 'info');
      fields.email.classList.remove('valid', 'invalid');
      return;
    }
    if (Rules.email(val)) {
      setHint(hints.email, '✓ Valid email address', 'success');
      setInputState(fields.email, true);
    } else {
      setHint(hints.email, '✕ Enter a valid email address (e.g. name@domain.com)', 'error');
      setInputState(fields.email, false);
    }
  });

  /* ── Real-time password validation + strength ── */
  fields.password?.addEventListener('input', () => {
    const val = fields.password.value;
    if (!val) {
      setHint(hints.password, '', 'info');
      fields.password.classList.remove('valid', 'invalid');
      updateStrengthBar(0);
      return;
    }

    const strength = getPasswordStrength(val);
    updateStrengthBar(strength.level);

    if (val.length < 8) {
      setHint(hints.password, `✕ Need ${8 - val.length} more character${8 - val.length > 1 ? 's' : ''} (minimum 8)`, 'error');
      setInputState(fields.password, false);
    } else {
      setHint(hints.password, `✓ ${strength.label}`, 'success');
      setInputState(fields.password, true);
    }

    // Re-validate confirm if filled
    if (fields.confirmPassword.value) {
      validateConfirm();
    }
  });

  /* ── Real-time confirm password ── */
  fields.confirmPassword?.addEventListener('input', validateConfirm);

  function validateConfirm() {
    const val   = fields.confirmPassword.value;
    const other = fields.password.value;
    if (!val) {
      setHint(hints.confirmPassword, '', 'info');
      fields.confirmPassword.classList.remove('valid', 'invalid');
      return;
    }
    if (val === other) {
      setHint(hints.confirmPassword, '✓ Passwords match', 'success');
      setInputState(fields.confirmPassword, true);
    } else {
      setHint(hints.confirmPassword, '✕ Passwords do not match', 'error');
      setInputState(fields.confirmPassword, false);
    }
  }

  /* ── Password strength calculator ── */
  function getPasswordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    const levels = [
      { level: 0, label: '', cls: '' },
      { level: 1, label: 'Weak', cls: 'weak' },
      { level: 2, label: 'Fair', cls: 'fair' },
      { level: 3, label: 'Good', cls: 'good' },
      { level: 4, label: 'Strong', cls: 'strong' },
    ];

    const idx = Math.min(Math.ceil(score / 1.25), 4);
    return levels[idx];
  }

  function updateStrengthBar(level) {
    if (!strengthBar || !strengthLabel) return;
    const segs = strengthBar.querySelectorAll('.strength-seg');
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const classes = ['', 'weak', 'fair', 'good', 'strong'];

    segs.forEach((seg, i) => {
      seg.className = 'strength-seg';
      if (i < level) seg.classList.add(classes[level]);
    });
    strengthLabel.textContent = level > 0 ? `Password strength: ${labels[level]}` : '';
  }

  /* ── Form submit ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Validate username
    if (!Rules.username(fields.username.value)) {
      setHint(hints.username, '✕ Username must contain only English letters and spaces', 'error');
      setInputState(fields.username, false);
      valid = false;
    }

    // Validate email
    if (!Rules.email(fields.email.value)) {
      setHint(hints.email, '✕ Enter a valid email address', 'error');
      setInputState(fields.email, false);
      valid = false;
    }

    // Validate password
    if (!Rules.password(fields.password.value)) {
      setHint(hints.password, '✕ Password must be at least 8 characters', 'error');
      setInputState(fields.password, false);
      valid = false;
    }

    // Validate confirm
    if (!Rules.match(fields.confirmPassword.value, fields.password.value)) {
      setHint(hints.confirmPassword, '✕ Passwords do not match', 'error');
      setInputState(fields.confirmPassword, false);
      valid = false;
    }

    // Validate terms
    if (fields.terms && !fields.terms.checked) {
      setHint(hints.terms, '✕ You must agree to the Terms and Conditions', 'error');
      valid = false;
    } else {
      setHint(hints.terms, '', 'info');
    }

    if (!valid) return;

    // Simulate submission — show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Transition to verification screen
      if (mainView && verifyView) {
        mainView.style.display = 'none';
        verifyView.classList.add('active');

        // Update displayed email
        const emailDisplay = document.getElementById('verify-email-display');
        if (emailDisplay) emailDisplay.textContent = fields.email.value;
      }
    }, 1500);
  });

  /* ── Simulate verification button ── */
  const simBtn = document.getElementById('simulate-verify-btn');
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      simBtn.textContent = 'Verifying…';
      simBtn.disabled = true;

      // Fill OTP boxes animation
      const otpBoxes = document.querySelectorAll('.otp-box');
      const demoCode = ['O','F','2','0','2','5'];
      otpBoxes.forEach((box, i) => {
        setTimeout(() => {
          box.textContent = demoCode[i] || '';
          box.classList.add('filled');
        }, i * 150);
      });

      setTimeout(() => {
        if (verifyView && successView) {
          verifyView.classList.remove('active');
          successView.classList.add('active');
        }
      }, 1200);
    });
  }
})();

/* ─────────────────────────────────────────
   SIGN IN PAGE
───────────────────────────────────────── */

(function initSignIn() {
  const form   = document.getElementById('signin-form');
  if (!form) return;

  const fields = {
    identifier: document.getElementById('si-identifier'),
    password:   document.getElementById('si-password'),
  };

  const hints = {
    identifier: document.getElementById('hint-si-identifier'),
    password:   document.getElementById('hint-si-password'),
  };

  const alertBox  = document.getElementById('signin-alert');
  const submitBtn = document.getElementById('signin-submit');

  /* ── Password toggle ── */
  initPasswordToggle('si-password', 'toggle-si-password');

  /* ── Clear error on input ── */
  Object.values(fields).forEach(field => {
    field?.addEventListener('input', () => {
      if (alertBox) alertBox.style.display = 'none';
    });
  });

  /* ── Form submit ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const id  = fields.identifier?.value.trim();
    const pwd = fields.password?.value;

    if (!id) {
      setHint(hints.identifier, '✕ Please enter your username or email', 'error');
      setInputState(fields.identifier, false);
      valid = false;
    } else {
      setHint(hints.identifier, '', 'info');
      setInputState(fields.identifier, true);
    }

    if (!pwd) {
      setHint(hints.password, '✕ Please enter your password', 'error');
      setInputState(fields.password, false);
      valid = false;
    } else {
      setHint(hints.password, '', 'info');
      setInputState(fields.password, true);
    }

    if (!valid) return;

    // Simulate loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;

      // Show backend-required message (do not fake authentication)
      if (alertBox) {
        alertBox.innerHTML = `
          <span class="alert-icon">ℹ</span>
          <span class="alert-text">
            <strong>Backend required:</strong> Authentication will be verified against the database when the JSP backend is integrated.
            Your credentials have been captured for testing.
          </span>
        `;
        alertBox.className = 'alert alert-info';
        alertBox.style.display = 'flex';
      }
    }, 1200);
  });
})();

/* ─────────────────────────────────────────
   FORGOT PASSWORD PAGE
───────────────────────────────────────── */

(function initForgotPassword() {
  const step1 = document.getElementById('fp-step-1');
  const step2 = document.getElementById('fp-step-2');
  const step3 = document.getElementById('fp-step-3');

  if (!step1 && !step2 && !step3) return; // Not on forgot password page

  /* ── Step 1: Request reset link ── */
  const requestForm = document.getElementById('fp-request-form');
  if (requestForm) {
    const emailInput = document.getElementById('fp-email');
    const emailHint  = document.getElementById('hint-fp-email');
    const submitBtn  = document.getElementById('fp-request-submit');

    emailInput?.addEventListener('input', () => {
      const val = emailInput.value;
      if (!val) {
        setHint(emailHint, '', 'info');
        emailInput.classList.remove('valid', 'invalid');
        return;
      }
      if (Rules.email(val)) {
        setHint(emailHint, '✓ Valid email address', 'success');
        setInputState(emailInput, true);
      } else {
        setHint(emailHint, '✕ Enter a valid email address', 'error');
        setInputState(emailInput, false);
      }
    });

    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = emailInput?.value.trim();

      if (!val || !Rules.email(val)) {
        setHint(emailHint, '✕ Please enter a valid email address', 'error');
        setInputState(emailInput, false);
        return;
      }

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Show step 2
        if (step1 && step2) {
          step1.classList.remove('active');
          step2.classList.add('active');
          const emailDisplay = document.getElementById('fp-email-display');
          if (emailDisplay) emailDisplay.textContent = val;
        }
      }, 1500);
    });
  }

  /* ── Step 2 → 3: Simulate link click ── */
  const simLinkBtn = document.getElementById('fp-simulate-link');
  if (simLinkBtn) {
    simLinkBtn.addEventListener('click', () => {
      if (step2 && step3) {
        step2.classList.remove('active');
        step3.classList.add('active');
      }
    });
  }

  /* ── Step 3: New password form ── */
  const resetForm = document.getElementById('fp-reset-form');
  if (resetForm) {
    const newPwd    = document.getElementById('fp-new-password');
    const confPwd   = document.getElementById('fp-confirm-password');
    const hintNew   = document.getElementById('hint-fp-new-password');
    const hintConf  = document.getElementById('hint-fp-confirm-password');
    const submitBtn = document.getElementById('fp-reset-submit');

    initPasswordToggle('fp-new-password', 'toggle-fp-password');
    initPasswordToggle('fp-confirm-password', 'toggle-fp-confirm');

    newPwd?.addEventListener('input', () => {
      const val = newPwd.value;
      if (!val) {
        setHint(hintNew, '', 'info');
        newPwd.classList.remove('valid', 'invalid');
        return;
      }
      if (val.length < 8) {
        setHint(hintNew, `✕ Need ${8 - val.length} more character(s)`, 'error');
        setInputState(newPwd, false);
      } else {
        setHint(hintNew, '✓ Password length is valid', 'success');
        setInputState(newPwd, true);
      }
      if (confPwd.value) validateResetConfirm();
    });

    confPwd?.addEventListener('input', validateResetConfirm);

    function validateResetConfirm() {
      const val   = confPwd.value;
      const other = newPwd.value;
      if (!val) {
        setHint(hintConf, '', 'info');
        confPwd.classList.remove('valid', 'invalid');
        return;
      }
      if (val === other) {
        setHint(hintConf, '✓ Passwords match', 'success');
        setInputState(confPwd, true);
      } else {
        setHint(hintConf, '✕ Passwords do not match', 'error');
        setInputState(confPwd, false);
      }
    }

    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      if (!Rules.password(newPwd?.value || '')) {
        setHint(hintNew, '✕ Password must be at least 8 characters', 'error');
        setInputState(newPwd, false);
        valid = false;
      }

      if (!Rules.match(confPwd?.value || '', newPwd?.value || '')) {
        setHint(hintConf, '✕ Passwords do not match', 'error');
        setInputState(confPwd, false);
        valid = false;
      }

      if (!valid) return;

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Show success state
        const successEl  = document.getElementById('fp-success');
        const formWrapEl = document.getElementById('fp-reset-form-wrap');
        if (formWrapEl && successEl) {
          formWrapEl.style.display = 'none';
          successEl.style.display  = 'flex';
          successEl.style.flexDirection = 'column';
          successEl.style.alignItems    = 'center';
        }
      }, 1400);
    });
  }
})();
