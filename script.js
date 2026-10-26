/* =======================================================
   PAWCARE — Comprehensive Frontend Script
   Handles: navbar, mobile menu, tabs, emergency flows,
   appointment forms, health record reminders (localStorage),
   grooming form, marketplace filter + cart, contact form
   ======================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // =====================================================
  // 1. NAVBAR SCROLL SHADOW
  // =====================================================
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }


  // =====================================================
  // 2. HAMBURGER / MOBILE DRAWER
  // =====================================================
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');

  function openDrawer() {
    mobileDrawer.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    mobileDrawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileDrawer) {
    hamburger.addEventListener('click', () => {
      mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });
    mobileDrawer.addEventListener('click', e => {
      if (e.target === mobileDrawer) closeDrawer();
    });
    mobileDrawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  }


  // =====================================================
  // 3. SMOOTH SCROLL FOR ANCHOR LINKS
  // =====================================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = (navbar ? navbar.offsetHeight : 70) + 16;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });


  // =====================================================
  // 4. SCROLL REVEAL (IntersectionObserver)
  // =====================================================
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), i * 70);
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));
  } else {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }


  // =====================================================
  // 5. STAT NUMBER COUNTER ANIMATION
  // =====================================================
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (statNums.length && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        const suffix = target >= 1000 ? '+' : '';
        let start = 0;
        const duration = 1600;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          el.textContent = Math.floor(start).toLocaleString('id-ID') + suffix;
          if (start >= target) clearInterval(timer);
        }, 16);
        counterObs.unobserve(el);
      });
    }, { threshold: 0.5 });
    statNums.forEach(el => counterObs.observe(el));
  }


  // =====================================================
  // 6. APPOINTMENT TABS
  // =====================================================
  const apptTabBar = document.getElementById('apptTabBar');
  if (apptTabBar) {
    apptTabBar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        apptTabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-panel').forEach(p => {
          p.classList.toggle('active', p.id === `panel-${target}`);
        });
      });
    });
  }


  // =====================================================
  // 7. PAWVISIT TOGGLE (Appointment Offline)
  // =====================================================
  const pawvisitRadio = document.getElementById('pawvisit');
  const clinicRadio   = document.getElementById('clinic');
  const addressGroup  = document.getElementById('addressGroup');
  const addressInput  = document.getElementById('f-address');

  if (pawvisitRadio && addressGroup) {
    const toggleAddress = () => {
      const isPawVisit = pawvisitRadio.checked;
      addressGroup.style.display = isPawVisit ? 'block' : 'none';
      if (addressInput) addressInput.required = isPawVisit;
    };
    pawvisitRadio.addEventListener('change', toggleAddress);
    if (clinicRadio) clinicRadio.addEventListener('change', toggleAddress);
  }


  // =====================================================
  // 8. GENERIC FORM VALIDATION + SUBMISSION
  //    (Online Appt, Offline Appt, Grooming)
  // =====================================================
  function handleSimpleForm(formId, confirmId, wrapId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const fields = form.querySelectorAll('[required]');
      let valid = true;
      fields.forEach(f => {
        if (!f.value.trim()) {
          f.classList.add('error');
          valid = false;
        } else {
          f.classList.remove('error');
        }
      });
      if (!valid) {
        form.querySelector('.error')?.focus();
        return;
      }
      if (formId === 'groomForm' && !form.querySelector('.svc-check:checked')) {
        const servicesLabel = form.querySelector('.service-select-grid')?.previousElementSibling;
        servicesLabel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.alert('Please select at least one grooming service.');
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = '⏳ Memproses...'; btn.disabled = true; }
      setTimeout(() => {
        document.getElementById(wrapId).querySelector('form').style.display = 'none';
        document.getElementById(confirmId).style.display = 'block';
      }, 1200);
    });
    // Live clear error on input
    form.querySelectorAll('input,select,textarea').forEach(f => {
      f.addEventListener('input', () => f.classList.remove('error'));
    });
  }
  handleSimpleForm('onlineForm',  'onlineConfirm',  'onlineFormWrap');
  handleSimpleForm('offlineForm', 'offlineConfirm', 'offlineFormWrap');
  handleSimpleForm('groomForm',   'groomConfirm',   'groomFormWrap');


  // =====================================================
  // 9. CONTACT FORM (with field-level validation)
  // =====================================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const rules = [
        { id: 'c-fname',   errId: 'err-fname',   test: v => v.trim().length > 0 },
        { id: 'c-lname',   errId: 'err-lname',   test: v => v.trim().length > 0 },
        { id: 'c-email',   errId: 'err-email',   test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: 'c-subject', errId: 'err-subject',  test: v => v !== '' },
        { id: 'c-message', errId: 'err-message',  test: v => v.trim().length >= 10 },
      ];

      rules.forEach(r => {
        const field = document.getElementById(r.id);
        const errEl = document.getElementById(r.errId);
        const ok = field && r.test(field.value);
        if (field) field.classList.toggle('error', !ok);
        if (errEl) errEl.style.display = ok ? 'none' : 'block';
        if (!ok) valid = false;
      });

      if (!valid) return;

      const btn = document.getElementById('contactSubmitBtn');
      if (btn) { btn.textContent = '⏳ Mengirim...'; btn.disabled = true; }
      setTimeout(() => {
        document.getElementById('contactFormWrap').querySelector('form').style.display = 'none';
        document.getElementById('contactConfirm').style.display = 'block';
      }, 1400);
    });

    // Live clear on input
    contactForm.querySelectorAll('input,select,textarea').forEach(f => {
      f.addEventListener('input', () => {
        f.classList.remove('error');
        const errId = 'err-' + f.id.replace('c-', '');
        const errEl = document.getElementById(errId);
        if (errEl) errEl.style.display = 'none';
      });
    });
  }


  // =====================================================
  // 10. EMERGENCY OPTION SELECTION
  // =====================================================
  const emergOptions = document.querySelectorAll('.emerg-option');
  if (emergOptions.length) {
    emergOptions.forEach(opt => {
      opt.addEventListener('click', () => selectEmergOption(opt.getAttribute('data-option')));
      opt.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') selectEmergOption(opt.getAttribute('data-option'));
      });
    });
  }

  function selectEmergOption(option) {
    // Highlight selected
    document.querySelectorAll('.emerg-option').forEach(o => {
      o.classList.toggle('selected', o.getAttribute('data-option') === option);
      o.setAttribute('aria-pressed', o.getAttribute('data-option') === option ? 'true' : 'false');
    });
    // Show matching flow
    document.querySelectorAll('.emerg-flow').forEach(f => {
      f.classList.toggle('active', f.id === `flow-${option}`);
    });
    // Show back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.style.display = 'block';

    // Scroll to flow
    const flow = document.getElementById(`flow-${option}`);
    if (flow) {
      setTimeout(() => {
        const offset = (navbar ? navbar.offsetHeight : 70) + 16;
        window.scrollTo({ top: flow.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }, 100);
    }
  }


  // =====================================================
  // 11. EMERGENCY — SYMPTOM GUIDANCE CARDS
  // =====================================================
  const guidanceData = {
    breathing: 'Kesulitan Bernapas',
    vomit: 'Muntah / Diare',
    injury: 'Luka / Perdarahan',
    seizure: 'Kejang',
    lethargic: 'Lesu / Tidak Mau Makan',
    poison: 'Kemungkinan Keracunan',
  };

  document.querySelectorAll('.guidance-card').forEach(card => {
    card.addEventListener('click', () => {
      const symptom = card.getAttribute('data-symptom');
      const symptomTitle = guidanceData[symptom];
      if (!symptomTitle) return;

      const resultEl = document.getElementById('guidance-result');
      resultEl.style.display = 'block';

      // Update selected card style
      document.querySelectorAll('.guidance-card').forEach(c => c.style.borderColor = '#E8E0D8');
      card.style.borderColor = '#FFD95C';

      resultEl.innerHTML = `
        <h3 style="font-size:1.3rem;margin-bottom:16px;">${symptomTitle}</h3>
        <div style="background:var(--danger-light);border:2px solid var(--danger);border-radius:var(--r-sm);padding:16px;margin-bottom:16px;font-size:0.92rem;color:var(--brown);">
          <strong>Hubungi dokter hewan atau rumah sakit hewan secara langsung.</strong> Halaman ini tidak dapat menilai gejala atau memberikan diagnosis maupun instruksi penanganan. Jika kondisinya mendesak, jangan menunggu respons dari situs ini.
        </div>
        <p style="font-size:0.88rem;color:var(--text-muted);line-height:1.6;">Pilihan gejala ini hanya membantu menunjukkan informasi yang relevan untuk disampaikan saat menghubungi tenaga profesional.</p>
        <div style="margin-top:20px;padding:14px;background:rgba(255,255,255,0.7);border-radius:var(--r-sm);font-size:0.8rem;color:var(--brown-mid);">
          ⚠️ PawCare tidak menyediakan layanan darurat veteriner langsung atau pencarian klinik real-time.
        </div>
        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
          <a href="appointment.html" class="btn btn-blue btn-sm">📅 Buat Appointment</a>
          <button onclick="document.querySelector('[data-option=hospital]').click()" class="btn btn-outline-brown btn-sm">🏥 Cari Klinik</button>
        </div>
      `;

      resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });


  // =====================================================
  // 12. HEALTH RECORD — REMINDERS (localStorage)
  // =====================================================
  const REMINDERS_KEY = 'pawcare_reminders';

  function getReminders() {
    try { return JSON.parse(localStorage.getItem(REMINDERS_KEY)) || []; }
    catch { return []; }
  }
  function saveReminders(data) {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(data));
  }

  const typeEmoji = { vaccine: '💉', med: '💊', vet: '🏥', groom: '✂️', other: '📌' };

  function renderReminders() {
    const list = document.getElementById('reminderList');
    const emptyEl = document.getElementById('reminderEmpty');
    if (!list) return;

    const reminders = getReminders().sort((a, b) => new Date(a.date) - new Date(b.date));
    list.innerHTML = '';

    if (reminders.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    reminders.forEach(r => {
      const d = new Date(r.date);
      const isOverdue = d < today;
      const formatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      const item = document.createElement('div');
      item.className = `reminder-item${isOverdue ? ' overdue' : ''}`;
      item.innerHTML = `
        <div class="reminder-info">
          <strong>${typeEmoji[r.type] || '📌'} ${r.title}</strong>
          <span>${formatted}${isOverdue ? ' <span style="color:var(--danger);font-size:0.75rem;">• Terlambat</span>' : ''}</span>
          ${r.note ? `<span style="font-size:0.78rem;color:var(--text-light);">${r.note}</span>` : ''}
        </div>
        <div class="reminder-actions">
          <button class="icon-btn" title="Edit" onclick="openEditModal('${r.id}')">✏️</button>
          <button class="icon-btn delete" title="Hapus" onclick="deleteReminder('${r.id}')">🗑️</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  // Add Reminder
  const reminderForm = document.getElementById('reminderForm');
  if (reminderForm) {
    reminderForm.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('r-title').value.trim();
      const type  = document.getElementById('r-type').value;
      const date  = document.getElementById('r-date').value;
      const note  = document.getElementById('r-note').value.trim();

      if (!title || !date) return;

      const reminders = getReminders();
      reminders.push({ id: Date.now().toString(), title, type, date, note });
      saveReminders(reminders);
      reminderForm.reset();
      closeReminderModal();
      renderReminders();
    });
  }

  // Edit Reminder Form
  const editForm = document.getElementById('editReminderForm');
  if (editForm) {
    editForm.addEventListener('submit', e => {
      e.preventDefault();
      const id    = document.getElementById('edit-id').value;
      const title = document.getElementById('edit-title').value.trim();
      const type  = document.getElementById('edit-type').value;
      const date  = document.getElementById('edit-date').value;
      const note  = document.getElementById('edit-note').value.trim();
      if (!title || !date) return;

      const reminders = getReminders().map(r => r.id === id ? { ...r, title, type, date, note } : r);
      saveReminders(reminders);
      closeEditModal();
      renderReminders();
    });
  }

  renderReminders();


  // =====================================================
  // 13. MARKETPLACE — CATEGORY FILTER
  // =====================================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card[data-cat]');

  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        productCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-cat') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Set min date for all date inputs to today
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(inp => {
    if (!inp.min) inp.min = today;
  });

}); // END DOMContentLoaded


/* =========================================================
   GLOBAL FUNCTIONS (called from inline onclick attributes)
   ========================================================= */

// Generic form reset
function resetForm(formId, confirmId, wrapId) {
  const form = document.getElementById(formId);
  const confirmEl = document.getElementById(confirmId);
  const wrap = document.getElementById(wrapId);
  if (form) { form.reset(); form.style.display = ''; }
  if (confirmEl) confirmEl.style.display = 'none';
  const btn = form?.querySelector('button[type="submit"]');
  if (btn) { btn.textContent = btn.getAttribute('data-original') || btn.textContent.replace('⏳ Memproses...', ''); btn.disabled = false; }
}

// Contact form reset
function resetContactForm() {
  const form = document.getElementById('contactForm');
  const confirmEl = document.getElementById('contactConfirm');
  if (form) { form.reset(); form.style.display = ''; }
  if (confirmEl) confirmEl.style.display = 'none';
  const btn = document.getElementById('contactSubmitBtn');
  if (btn) { btn.textContent = '💬 Kirim Pesan (Demo)'; btn.disabled = false; }
  // Clear all errors
  document.querySelectorAll('.form-error-msg').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}

// Emergency
function resetEmergency() {
  document.querySelectorAll('.emerg-option').forEach(o => {
    o.classList.remove('selected');
    o.setAttribute('aria-pressed', 'false');
  });
  document.querySelectorAll('.emerg-flow').forEach(f => f.classList.remove('active'));
  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.style.display = 'none';
}

function showDemoHospitals() {
  const loc = document.getElementById('locationInput')?.value?.trim();
  const hospitalsEl = document.getElementById('demo-hospitals');
  const noticeEl    = document.getElementById('hospitals-notice');
  if (!loc) {
    document.getElementById('locationInput')?.focus();
    return;
  }
  if (hospitalsEl) hospitalsEl.style.display = 'none';
  if (noticeEl) {
    noticeEl.textContent = `Live clinic results are not available for “${loc}”. Please search a map service or contact a qualified veterinarian directly.`;
    noticeEl.style.display = 'block';
  }
}

// Health Record Modals
function openReminderModal() {
  const modal = document.getElementById('reminderModal');
  if (modal) modal.classList.add('open');
}
function closeReminderModal() {
  const modal = document.getElementById('reminderModal');
  if (modal) { modal.classList.remove('open'); }
  const form = document.getElementById('reminderForm');
  if (form) form.reset();
}
function openEditModal(id) {
  const reminders = JSON.parse(localStorage.getItem('pawcare_reminders') || '[]');
  const r = reminders.find(x => x.id === id);
  if (!r) return;
  document.getElementById('edit-id').value    = r.id;
  document.getElementById('edit-title').value = r.title;
  document.getElementById('edit-type').value  = r.type;
  document.getElementById('edit-date').value  = r.date;
  document.getElementById('edit-note').value  = r.note || '';
  const modal = document.getElementById('editReminderModal');
  if (modal) modal.classList.add('open');
}
function closeEditModal() {
  const modal = document.getElementById('editReminderModal');
  if (modal) modal.classList.remove('open');
}
function deleteReminder(id) {
  if (!confirm('Hapus pengingat ini?')) return;
  const reminders = JSON.parse(localStorage.getItem('pawcare_reminders') || '[]').filter(r => r.id !== id);
  localStorage.setItem('pawcare_reminders', JSON.stringify(reminders));
  renderReminders();
}
function renderReminders() {
  const list = document.getElementById('reminderList');
  const emptyEl = document.getElementById('reminderEmpty');
  if (!list) return;

  const REMINDERS_KEY = 'pawcare_reminders';
  const typeEmoji = { vaccine: '💉', med: '💊', vet: '🏥', groom: '✂️', other: '📌' };
  let reminders = [];
  try { reminders = JSON.parse(localStorage.getItem(REMINDERS_KEY)) || []; } catch { reminders = []; }
  reminders.sort((a, b) => new Date(a.date) - new Date(b.date));
  list.innerHTML = '';

  if (reminders.length === 0) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  const today = new Date(); today.setHours(0,0,0,0);
  reminders.forEach(r => {
    const d = new Date(r.date);
    const isOverdue = d < today;
    const formatted = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const item = document.createElement('div');
    item.className = `reminder-item${isOverdue ? ' overdue' : ''}`;
    item.innerHTML = `
      <div class="reminder-info">
        <strong>${typeEmoji[r.type] || '📌'} ${r.title}</strong>
        <span>${formatted}${isOverdue ? ' <span style="color:var(--danger);font-size:0.75rem;">• Terlambat</span>' : ''}</span>
        ${r.note ? `<span style="font-size:0.78rem;color:var(--text-light);">${r.note}</span>` : ''}
      </div>
      <div class="reminder-actions">
        <button class="icon-btn" title="Edit" onclick="openEditModal('${r.id}')">✏️</button>
        <button class="icon-btn delete" title="Hapus" onclick="deleteReminder('${r.id}')">🗑️</button>
      </div>
    `;
    list.appendChild(item);
  });
}

// Close modals on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// =====================================================
// MARKETPLACE — Cart & Product Modal
// =====================================================
let demoCart = [];
let currentModalProduct = null;

function addToCart(btn, name, price) {
  demoCart.push({ name, price: parseInt(price) });
  btn.textContent = '✓';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = '+';
    btn.classList.remove('added');
  }, 1500);
  updateCartBadge();
}

function addToCartFromModal() {
  if (!currentModalProduct) return;
  const name  = currentModalProduct.querySelector('.product-name')?.textContent || '';
  const price = currentModalProduct.querySelector('.product-price')?.textContent.replace(/[^\d]/g, '') || 0;
  demoCart.push({ name, price: parseInt(price) });
  updateCartBadge();
  const addBtn = document.getElementById('modal-add-cart-btn');
  if (addBtn) {
    addBtn.textContent = '✓ Ditambahkan!';
    addBtn.classList.remove('btn-yellow');
    addBtn.classList.add('btn-blue');
    setTimeout(() => {
      addBtn.textContent = '🛒 Tambah ke Demo Cart';
      addBtn.classList.add('btn-yellow');
      addBtn.classList.remove('btn-blue');
    }, 1500);
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  badge.textContent = demoCart.length;
  badge.classList.toggle('show', demoCart.length > 0);
}

function openProductModal(card) {
  currentModalProduct = card;
  const modal = document.getElementById('productModal');
  if (!modal) return;
  document.getElementById('modal-product-name').textContent = card.querySelector('.product-name')?.textContent || '';
  document.getElementById('modal-product-img').src  = card.querySelector('.product-img img')?.src || '';
  document.getElementById('modal-product-img').alt  = card.querySelector('.product-img img')?.alt || '';
  document.getElementById('modal-product-cat').textContent  = card.querySelector('.product-cat')?.textContent || '';
  document.getElementById('modal-product-desc').textContent = card.querySelector('.product-desc')?.textContent || '';
  document.getElementById('modal-product-price').textContent = card.querySelector('.product-price')?.textContent || '';
  modal.classList.add('open');
}
function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.remove('open');
  currentModalProduct = null;
}

function openCartModal() {
  const modal = document.getElementById('cartModal');
  if (!modal) return;
  const itemsEl    = document.getElementById('cartItems');
  const emptyEl    = document.getElementById('cartEmpty');
  const totalEl    = document.getElementById('cartTotal');
  const totalPrEl  = document.getElementById('cartTotalPrice');
  const checkoutEl = document.getElementById('checkoutBtn');

  itemsEl.innerHTML = '';

  if (demoCart.length === 0) {
    emptyEl.style.display = 'block';
    totalEl.style.display = 'none';
    checkoutEl.style.display = 'none';
  } else {
    emptyEl.style.display = 'none';
    totalEl.style.display = 'block';
    checkoutEl.style.display = 'flex';

    demoCart.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--grey-100);font-size:0.92rem;';
      row.innerHTML = `
        <span>${item.name}</span>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-weight:700;">Rp ${item.price.toLocaleString('id-ID')}</span>
          <button onclick="removeFromCart(${idx})" class="icon-btn delete" style="width:26px;height:26px;font-size:0.8rem;">✕</button>
        </div>
      `;
      itemsEl.appendChild(row);
    });

    const total = demoCart.reduce((sum, i) => sum + i.price, 0);
    totalPrEl.textContent = 'Rp ' + total.toLocaleString('id-ID');
  }

  modal.classList.add('open');
}
function closeCartModal() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.classList.remove('open');
}
function removeFromCart(idx) {
  demoCart.splice(idx, 1);
  updateCartBadge();
  openCartModal(); // re-render
}
function demoCheckout() {
  const itemsEl   = document.getElementById('cartItems');
  const totalEl   = document.getElementById('cartTotal');
  const checkoutEl = document.getElementById('checkoutBtn');
  const emptyEl   = document.getElementById('cartEmpty');
  if (itemsEl)    itemsEl.innerHTML = '';
  if (totalEl)    totalEl.style.display = 'none';
  if (checkoutEl) checkoutEl.style.display = 'none';
  if (emptyEl)    emptyEl.style.display = 'block';
  emptyEl.innerHTML = `
    <div style="font-size:2.5rem;margin-bottom:14px;">🎉</div>
    <h4 style="font-size:1.3rem;margin-bottom:8px;">Demo Checkout Selesai!</h4>
    <p style="color:var(--text-muted);font-size:0.88rem;">Ini adalah simulasi checkout. Tidak ada pesanan nyata yang dibuat dan tidak ada pembayaran yang diproses.</p>
  `;
  demoCart = [];
  updateCartBadge();
}
