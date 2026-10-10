/* ============================================================
   ObjectFinder — finder.js
   Report Item, Register Item, View Reported Items filtering,
   and Admin database verification (as per project sketch)
   ============================================================ */

'use strict';

(function initFinderApp() {
  /* ── Initial default reported items ── */
  const defaultItems = [
    {
      id: 1,
      type: 'lost',
      name: 'Black Backpack',
      dept: 'RBMI',
      position: '3rd Year',
      reporterName: 'Rahul Sharma',
      contact: '+91 98765 43210',
      description: 'Large black Nike backpack with red zipper. Contains laptop charger and engineering notebook.',
      location: 'Library, Block B',
      date: '2025-10-08',
      category: 'Clothing / Bags',
      icon: '🎒'
    },
    {
      id: 2,
      type: 'found',
      name: 'Student ID Card',
      dept: 'RBCET',
      position: 'Faculty',
      reporterName: 'Prof. Priya Singh',
      contact: '+91 91234 56789',
      description: 'RBCET student ID card with photo found near the canteen counter. Handed to security reception.',
      location: 'Canteen Area',
      date: '2025-10-09',
      category: 'Documents',
      icon: '🪪'
    },
    {
      id: 3,
      type: 'lost',
      name: 'Mobile Phone (Samsung Galaxy)',
      dept: 'RBCET',
      position: '2nd Year',
      reporterName: 'Amit Kumar',
      contact: '+91 70000 12345',
      description: 'Dark blue cover with camera ring, small scratch on top edge. Lock screen is a mountain wallpaper.',
      location: 'CS Department Lab 2',
      date: '2025-10-10',
      category: 'Electronics',
      icon: '📱'
    },
    {
      id: 4,
      type: 'found',
      name: 'Brown Leather Wallet',
      dept: 'RBMI',
      position: 'HOD',
      reporterName: 'Dr. Sneha Gupta (HOD)',
      contact: '+91 99887 76655',
      description: 'Brown leather bi-fold wallet found on a bench in the corridor. Contains some college receipts.',
      location: 'Corridor, Block A Room 201',
      date: '2025-10-07',
      category: 'Accessories',
      icon: '👛'
    },
    {
      id: 5,
      type: 'lost',
      name: 'White Lab Coat',
      dept: 'RBCP',
      position: '1st Year',
      reporterName: 'Anjali Yadav',
      contact: '+91 88012 34567',
      description: 'Standard white pharmacy apron, size M, marked with "Anjali" on inner collar tag.',
      location: 'Pharmacy Lab 3',
      date: '2025-10-06',
      category: 'Clothing / Bags',
      icon: '🥼'
    },
    {
      id: 6,
      type: 'found',
      name: 'Nursing Clinical Pocket Guide',
      dept: 'RBCN',
      position: '2nd Year',
      reporterName: 'Pooja Verma',
      contact: '+91 77654 32100',
      description: 'Medical pocket manual with green cover and clinical notes. Left in nursing lab room 104.',
      location: 'Nursing Practical Lab, RBCN',
      date: '2025-10-09',
      category: 'Stationery',
      icon: '📓'
    }
  ];

  // Storage key
  const STORAGE_KEY = 'objectfinder_reported_items_v2';

  function getStoredItems() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    return defaultItems;
  }

  function saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  let itemsList = getStoredItems();

  /* ── Category icon mapper ── */
  function getCategoryIcon(name, category) {
    const text = (name + ' ' + (category || '')).toLowerCase();
    if (text.includes('phone') || text.includes('mobile')) return '📱';
    if (text.includes('id') || text.includes('card') || text.includes('license')) return '🪪';
    if (text.includes('bag') || text.includes('backpack')) return '🎒';
    if (text.includes('wallet') || text.includes('purse')) return '👛';
    if (text.includes('bottle')) return '🍶';
    if (text.includes('key')) return '🔑';
    if (text.includes('watch')) return '⌚';
    if (text.includes('laptop')) return '💻';
    if (text.includes('book') || text.includes('notebook') || text.includes('notes')) return '📓';
    if (text.includes('coat') || text.includes('jacket')) return '🥼';
    if (text.includes('earphone') || text.includes('headphone') || text.includes('airpods')) return '🎧';
    return '📦';
  }

  /* ── Render Items in proper way (as per sketch) ── */
  const gridContainer = document.getElementById('reported-items-grid');
  const emptyStateEl  = document.getElementById('empty-items-state');
  const filterPills   = document.querySelectorAll('.filter-pill');
  const searchInput   = document.getElementById('items-search-input');
  const deptSelect    = document.getElementById('items-dept-filter');

  let currentTypeFilter = 'all';
  let currentDeptFilter = 'all';
  let searchQuery       = '';

  function renderItems() {
    if (!gridContainer) return;

    const filtered = itemsList.filter(item => {
      // Type filter
      if (currentTypeFilter !== 'all' && item.type !== currentTypeFilter) {
        return false;
      }
      // Dept filter
      if (currentDeptFilter !== 'all' && item.dept !== currentDeptFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchLoc  = (item.location || '').toLowerCase().includes(q);
        const matchDept = (item.dept || '').toLowerCase().includes(q);
        const matchRep  = (item.reporterName || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLoc && !matchDept && !matchRep) {
          return false;
        }
      }
      return true;
    });

    gridContainer.innerHTML = '';

    if (filtered.length === 0) {
      if (emptyStateEl) emptyStateEl.style.display = 'block';
      return;
    }

    if (emptyStateEl) emptyStateEl.style.display = 'none';

    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'item-report-card animate-fade-up visible';
      card.setAttribute('aria-label', `${item.type.toUpperCase()}: ${item.name}`);

      const isLost = item.type === 'lost';
      const badgeCls = isLost ? 'badge-tag-lost' : 'badge-tag-found';
      const badgeLabel = isLost ? 'Reported Lost' : 'Registered Found';
      const icon = item.icon || getCategoryIcon(item.name, item.category);

      card.innerHTML = `
        <div class="item-card-top">
          <span class="badge-tag ${badgeCls}">${badgeLabel}</span>
          <span class="item-dept-badge">${item.dept || 'Campus'}</span>
        </div>
        <div class="item-icon-box" style="background:${isLost ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)'}; color:${isLost ? '#fca5a5' : '#86efac'};">
          ${icon}
        </div>
        <h3 class="item-card-title">${escapeHtml(item.name)}</h3>
        <p class="item-card-desc">${escapeHtml(item.description)}</p>
        
        <div class="item-meta-row">
          <div class="item-meta-entry">
            <span>📍</span>
            <span><strong>Location:</strong> ${escapeHtml(item.location || 'RBMI Campus')}</span>
          </div>
          <div class="item-meta-entry">
            <span>📅</span>
            <span><strong>Date:</strong> ${escapeHtml(item.date || 'Recent')}</span>
          </div>
        </div>

        <div class="item-reporter-info">
          <div class="reporter-avatar" aria-hidden="true">👤</div>
          <div class="reporter-text">
            <span class="reporter-name">${escapeHtml(item.reporterName || 'Anonymous')}</span>
            <span class="reporter-role">${escapeHtml(item.position || 'Student')} · ${escapeHtml(item.dept || 'RBMI')}</span>
          </div>
        </div>

        <div class="item-card-footer">
          <div>
            <span style="color:var(--clr-muted); font-size:0.75rem;">Contact:</span>
            <span style="font-weight:600; color:var(--clr-accent); margin-left:4px;">${escapeHtml(item.contact || 'In Admin Office')}</span>
          </div>
          <button class="item-contact-btn" data-contact="${escapeHtml(item.contact || '')}" data-name="${escapeHtml(item.name)}">
            ${isLost ? 'Found This?' : 'Claim Item'}
          </button>
        </div>
      `;

      gridContainer.appendChild(card);
    });

    // Attach contact button listeners
    gridContainer.querySelectorAll('.item-contact-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const c = e.target.getAttribute('data-contact');
        const n = e.target.getAttribute('data-name');
        if (window.Toast) {
          window.Toast.show(`Contact info for "${n}": ${c || 'Please visit the college administration office.'}`, 'info', 5000);
        } else {
          alert(`Contact for "${n}": ${c}`);
        }
      });
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ── Filter events ── */
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentTypeFilter = pill.getAttribute('data-filter') || 'all';
      renderItems();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderItems();
  });

  deptSelect?.addEventListener('change', (e) => {
    currentDeptFilter = e.target.value;
    renderItems();
  });

  // Initial render
  renderItems();

  /* ── Strict Validation Helpers for Name and Number Fields ── */
  function showHint(hintEl, inputEl, msg, type = 'error') {
    if (hintEl) {
      hintEl.textContent = msg;
      hintEl.className = `input-hint-msg hint-${type}`;
    }
    if (inputEl) {
      inputEl.classList.remove('input-error', 'input-success');
      inputEl.classList.add(type === 'error' ? 'input-error' : 'input-success');
    }
  }

  function clearHint(hintEl, inputEl) {
    if (hintEl) {
      hintEl.textContent = '';
      hintEl.className = 'input-hint-msg';
    }
    if (inputEl) {
      inputEl.classList.remove('input-error', 'input-success');
    }
  }

  /**
   * Name Validation:
   * Only English alphabets and spaces allowed.
   * Numbers and special characters are strictly forbidden.
   */
  function setupNameValidation(inputEl, hintEl) {
    if (!inputEl) return;

    // Block keypress of numbers or special characters immediately
    inputEl.addEventListener('keydown', (e) => {
      // Allow control keys (Backspace, Tab, Delete, Arrows, Enter, Ctrl shortcuts)
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        return;
      }
      // Check if character is a digit or special character (not A-Z, a-z, or space)
      if (!/^[A-Za-z\s]$/.test(e.key)) {
        e.preventDefault();
        showHint(hintEl, inputEl, '✕ Numbers and special characters are not allowed. Only alphabets (A-Z) allowed.', 'error');
      }
    });

    // Strip illegal characters on paste or input immediately
    inputEl.addEventListener('input', () => {
      const original = inputEl.value;
      const cleaned = original.replace(/[^A-Za-z\s]/g, '');
      if (original !== cleaned) {
        inputEl.value = cleaned;
        showHint(hintEl, inputEl, '✕ Numbers and special characters are not allowed. Only alphabets (A-Z) allowed.', 'error');
        return;
      }

      if (cleaned.trim().length === 0) {
        clearHint(hintEl, inputEl);
      } else if (cleaned.trim().length < 2) {
        showHint(hintEl, inputEl, '✕ Name must be at least 2 characters long.', 'error');
      } else {
        clearHint(hintEl, inputEl);
      }
    });

    inputEl.addEventListener('blur', () => {
      const val = inputEl.value.trim();
      if (!val) {
        clearHint(hintEl, inputEl);
      } else if (!/^[A-Za-z\s]{2,}$/.test(val)) {
        showHint(hintEl, inputEl, '✕ Please enter a valid name using letters and spaces only.', 'error');
      } else {
        clearHint(hintEl, inputEl);
      }
    });
  }

  /**
   * Contact / Phone Number Validation:
   * Only digits (0-9) allowed.
   * Alphabets and special characters are strictly forbidden.
   */
  function setupPhoneValidation(inputEl, hintEl) {
    if (!inputEl) return;

    // Block keypress of any non-digit character immediately
    inputEl.addEventListener('keydown', (e) => {
      // Allow control keys (Backspace, Tab, Delete, Arrows, Enter, Ctrl shortcuts)
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        return;
      }
      // Check if character is not a digit 0-9
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        showHint(hintEl, inputEl, '✕ Alphabets and special characters are not allowed. Only numbers (0-9) allowed.', 'error');
      }
    });

    // Strip illegal characters on paste or input immediately, limit to 10 digits
    inputEl.addEventListener('input', () => {
      const original = inputEl.value;
      const cleaned = original.replace(/[^0-9]/g, '').slice(0, 10);
      if (original !== cleaned) {
        inputEl.value = cleaned;
        showHint(hintEl, inputEl, '✕ Alphabets and special characters are not allowed. Only numbers (0-9) allowed.', 'error');
        return;
      }

      if (cleaned.length === 0) {
        clearHint(hintEl, inputEl);
      } else if (cleaned.length < 10) {
        showHint(hintEl, inputEl, `✕ Enter a 10-digit mobile number (${cleaned.length}/10 digits).`, 'error');
      } else {
        showHint(hintEl, inputEl, '✓ Valid 10-digit contact number', 'success');
      }
    });

    inputEl.addEventListener('blur', () => {
      const val = inputEl.value.trim();
      if (!val) {
        clearHint(hintEl, inputEl);
      } else if (!/^\d{10}$/.test(val)) {
        showHint(hintEl, inputEl, '✕ Please enter a valid 10-digit mobile number without spaces or symbols.', 'error');
      } else {
        showHint(hintEl, inputEl, '✓ Valid 10-digit contact number', 'success');
      }
    });
  }

  // Initialize live field validation
  const rNameInput    = document.getElementById('r-name');
  const rNameHint     = document.getElementById('hint-r-name');
  const rContactInput = document.getElementById('r-contact');
  const rContactHint  = document.getElementById('hint-r-contact');

  const regNameInput    = document.getElementById('reg-name');
  const regNameHint     = document.getElementById('hint-reg-name');
  const regContactInput = document.getElementById('reg-contact');
  const regContactHint  = document.getElementById('hint-reg-contact');

  const adminNameInput  = document.getElementById('admin-name');
  const adminNameHint   = document.getElementById('hint-admin-name');

  setupNameValidation(rNameInput, rNameHint);
  setupNameValidation(regNameInput, regNameHint);
  setupNameValidation(adminNameInput, adminNameHint);

  setupPhoneValidation(rContactInput, rContactHint);
  setupPhoneValidation(regContactInput, regContactHint);

  /* ── Date Inputs: Only allow selection via Calendar picker (Block all manual typing) ── */
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const todayStr = new Date().toISOString().split('T')[0];

  dateInputs.forEach(dateInput => {
    // Set max date to today
    dateInput.setAttribute('max', todayStr);

    // Block any manual typing or numbers entered via keyboard
    dateInput.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' || e.key === 'Escape') return;
      e.preventDefault();
      try {
        dateInput.showPicker();
      } catch (err) {}
    });

    dateInput.addEventListener('keypress', (e) => e.preventDefault());
    dateInput.addEventListener('paste', (e) => e.preventDefault());

    // Clicking anywhere on the date input opens the calendar picker immediately
    dateInput.addEventListener('click', () => {
      try {
        dateInput.showPicker();
      } catch (err) {}
    });
  });

  /* ── Report Lost Item Form Submission ── */
  const reportForm = document.getElementById('report-lost-form');
  reportForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal      = rNameInput?.value.trim();
    const deptVal      = document.getElementById('r-dept')?.value;
    const posVal       = document.getElementById('r-position')?.value;
    const contactVal   = rContactInput?.value.trim();
    const itemNameVal  = document.getElementById('r-item-name')?.value.trim();
    const itemDescVal  = document.getElementById('r-item-desc')?.value.trim();
    const locationVal  = document.getElementById('r-location')?.value.trim();
    const dateVal      = document.getElementById('r-date')?.value || new Date().toISOString().split('T')[0];
    const categoryVal  = document.getElementById('r-category')?.value || 'Other';

    // Strict validation: Name (alphabets and spaces only)
    if (!nameVal || !/^[A-Za-z\s]{2,}$/.test(nameVal)) {
      showHint(rNameHint, rNameInput, '✕ Name must contain only alphabets and spaces (no numbers or symbols, min 2 characters).', 'error');
      window.Toast?.show('Name field must contain only alphabets and spaces (no numbers or special characters)', 'error');
      rNameInput?.focus();
      return;
    }

    if (!deptVal) {
      window.Toast?.show('Please select your department (RBMI, RBCET, RBTTI, RBCP, RBCN)', 'error');
      document.getElementById('r-dept')?.focus();
      return;
    }

    if (!posVal) {
      window.Toast?.show('Please select your year or position (Faculty, HOD, Student)', 'error');
      document.getElementById('r-position')?.focus();
      return;
    }

    // Strict validation: Contact number (digits only, exactly 10 digits)
    if (!contactVal || !/^\d{10}$/.test(contactVal)) {
      showHint(rContactHint, rContactInput, '✕ Contact number must be exactly 10 digits (0-9 only, no letters or symbols).', 'error');
      window.Toast?.show('Contact number must be exactly 10 digits (no alphabets or special characters)', 'error');
      rContactInput?.focus();
      return;
    }

    if (!itemNameVal) {
      window.Toast?.show('Please enter the name of the lost item', 'error');
      document.getElementById('r-item-name')?.focus();
      return;
    }

    if (!itemDescVal) {
      window.Toast?.show('Please provide a description (color, shape, distinguishing features)', 'error');
      document.getElementById('r-item-desc')?.focus();
      return;
    }

    // Create item
    const newItem = {
      id: Date.now(),
      type: 'lost',
      name: itemNameVal,
      dept: deptVal,
      position: posVal,
      reporterName: nameVal,
      contact: contactVal,
      description: itemDescVal,
      location: locationVal || 'RBMI Campus',
      date: dateVal,
      category: categoryVal,
      icon: getCategoryIcon(itemNameVal, categoryVal)
    };

    itemsList.unshift(newItem);
    saveItems(itemsList);
    renderItems();

    reportForm.reset();
    clearHint(rNameHint, rNameInput);
    clearHint(rContactHint, rContactInput);

    if (window.Toast) {
      window.Toast.show(`✓ Lost item "${itemNameVal}" reported successfully! Listed in Reported Items.`, 'success', 5000);
    }

    // Smooth scroll to view items
    setTimeout(() => {
      const viewSec = document.getElementById('view-reported-items');
      if (viewSec) {
        viewSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  });

  /* ── Register Found Item Form Submission ── */
  const registerForm = document.getElementById('register-found-form');
  registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal      = regNameInput?.value.trim();
    const deptVal      = document.getElementById('reg-dept')?.value;
    const posVal       = document.getElementById('reg-position')?.value;
    const contactVal   = regContactInput?.value.trim();
    const itemNameVal  = document.getElementById('reg-item-name')?.value.trim();
    const itemDescVal  = document.getElementById('reg-item-desc')?.value.trim();
    const locationVal  = document.getElementById('reg-location')?.value.trim();
    const dateVal      = document.getElementById('reg-date')?.value || new Date().toISOString().split('T')[0];
    const categoryVal  = document.getElementById('reg-category')?.value || 'Other';

    // Strict validation: Name (alphabets and spaces only)
    if (!nameVal || !/^[A-Za-z\s]{2,}$/.test(nameVal)) {
      showHint(regNameHint, regNameInput, '✕ Name must contain only alphabets and spaces (no numbers or symbols, min 2 characters).', 'error');
      window.Toast?.show('Name field must contain only alphabets and spaces (no numbers or special characters)', 'error');
      regNameInput?.focus();
      return;
    }

    if (!deptVal) {
      window.Toast?.show('Please select your department (RBMI, RBCET, RBTTI, RBCP, RBCN)', 'error');
      document.getElementById('reg-dept')?.focus();
      return;
    }

    if (!posVal) {
      window.Toast?.show('Please select your year or position', 'error');
      document.getElementById('reg-position')?.focus();
      return;
    }

    // Strict validation: Contact number (digits only, exactly 10 digits)
    if (!contactVal || !/^\d{10}$/.test(contactVal)) {
      showHint(regContactHint, regContactInput, '✕ Contact number must be exactly 10 digits (0-9 only, no letters or symbols).', 'error');
      window.Toast?.show('Contact number must be exactly 10 digits (no alphabets or special characters)', 'error');
      regContactInput?.focus();
      return;
    }

    if (!itemNameVal) {
      window.Toast?.show('Please enter the name of the found item', 'error');
      document.getElementById('reg-item-name')?.focus();
      return;
    }

    if (!itemDescVal) {
      window.Toast?.show('Please provide a description (color, shape, distinguishing features)', 'error');
      document.getElementById('reg-item-desc')?.focus();
      return;
    }

    // Create item
    const newItem = {
      id: Date.now(),
      type: 'found',
      name: itemNameVal,
      dept: deptVal,
      position: posVal,
      reporterName: nameVal,
      contact: contactVal,
      description: itemDescVal,
      location: locationVal || 'RBMI Campus',
      date: dateVal,
      category: categoryVal,
      icon: getCategoryIcon(itemNameVal, categoryVal)
    };

    itemsList.unshift(newItem);
    saveItems(itemsList);
    renderItems();

    registerForm.reset();
    clearHint(regNameHint, regNameInput);
    clearHint(regContactHint, regContactInput);

    if (window.Toast) {
      window.Toast.show(`✓ Found item "${itemNameVal}" registered successfully! Listed in Reported Items.`, 'success', 5000);
    }

    setTimeout(() => {
      const viewSec = document.getElementById('view-reported-items');
      if (viewSec) {
        viewSec.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  });

  /* ── Admin Database Verification Modal (as per sketch top) ── */
  const adminBtn        = document.getElementById('nav-admin-btn');
  const adminModal      = document.getElementById('admin-modal-backdrop');
  const adminCloseBtn   = document.getElementById('admin-modal-close');
  const adminForm       = document.getElementById('admin-login-form');
  const adminStatusBox  = document.getElementById('admin-db-status');
  const adminSubmitBtn  = document.getElementById('admin-submit-btn');

  function openAdminModal() {
    if (adminModal) {
      adminModal.classList.add('open');
      document.body.style.overflow = 'hidden';
      if (adminStatusBox) adminStatusBox.className = 'admin-db-status';
    }
  }

  function closeAdminModal() {
    if (adminModal) {
      adminModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  adminBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openAdminModal();
  });

  adminCloseBtn?.addEventListener('click', closeAdminModal);

  adminModal?.addEventListener('click', (e) => {
    if (e.target === adminModal) closeAdminModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal?.classList.contains('open')) {
      closeAdminModal();
    }
  });

  adminForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = adminNameInput?.value.trim();
    const email = document.getElementById('admin-email')?.value.trim();
    const code  = document.getElementById('admin-code')?.value.trim();

    // Strict validation: Admin name (letters and spaces only)
    if (!name || !/^[A-Za-z\s]{2,}$/.test(name)) {
      showHint(adminNameHint, adminNameInput, '✕ Admin name must contain only alphabets and spaces (no numbers or symbols).', 'error');
      adminNameInput?.focus();
      return;
    }

    if (!name || !email || !code) {
      if (adminStatusBox) {
        adminStatusBox.className = 'admin-db-status status-error';
        adminStatusBox.innerHTML = '<span>✕</span><span>Please fill all admin fields (name, email, admin code).</span>';
      }
      return;
    }

    if (adminSubmitBtn) {
      adminSubmitBtn.disabled = true;
      adminSubmitBtn.textContent = 'Verifying database…';
    }

    if (adminStatusBox) {
      adminStatusBox.className = 'admin-db-status status-checking';
      adminStatusBox.innerHTML = '<span>🔄</span><span>Connecting to database &amp; verifying admin credentials…</span>';
    }

    // Simulate backend JSP/database check
    setTimeout(() => {
      if (adminSubmitBtn) {
        adminSubmitBtn.disabled = false;
        adminSubmitBtn.textContent = 'Enter';
      }

      if (adminStatusBox) {
        adminStatusBox.className = 'admin-db-status status-verified';
        adminStatusBox.innerHTML = `
          <span>✓</span>
          <span><strong>Database Verification:</strong> Admin details captured for <em>${escapeHtml(name)}</em> (${escapeHtml(email)}). JSP backend authentication will validate code <code>${escapeHtml(code)}</code> against database records.</span>
        `;
      }

      if (window.Toast) {
        window.Toast.show(`Admin request submitted for ${name}. Verification in progress.`, 'info');
      }
    }, 1200);
  });
})();
