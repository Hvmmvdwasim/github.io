/* =========================================================
   Zeera & Co. — site script
   Covers: DOM events, mouse events, keyboard events,
   form validation, filtering, modal, counters, theme toggle.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Theme toggle (light/dark) ---------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  var savedTheme = localStorage.getItem('zeera-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('zeera-theme', next);
      themeBtn.textContent = next === 'dark' ? '☀' : '☾';
    });
    themeBtn.textContent = (savedTheme === 'dark') ? '☀' : '☾';
  }

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.classList.toggle('is-active', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    });
  }

  /* ---------- Back-to-top button ---------- */
  var toTop = document.querySelector('.to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 480);
    });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var start = 0;
        var duration = 1400;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * (target - start) + start) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Generic image slider/carousel (hero) ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.slider-track');
    var slides = slider.querySelectorAll('.slider-track img');
    var dots = slider.querySelectorAll('.slider-dots button');
    var index = 0;
    var total = slides.length;
    var timer;

    function go(i) {
      index = (i + total) % total;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, di) { d.classList.toggle('is-active', di === index); });
    }
    slider.querySelectorAll('[data-next]').forEach(function (b) { b.addEventListener('click', function () { go(index + 1); resetTimer(); }); });
    slider.querySelectorAll('[data-prev]').forEach(function (b) { b.addEventListener('click', function () { go(index - 1); resetTimer(); }); });
    dots.forEach(function (d, di) { d.addEventListener('click', function () { go(di); resetTimer(); }); });

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function () { go(index + 1); }, 4500);
    }
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', resetTimer);
    resetTimer();
  });

  /* ---------- Testimonial carousel ---------- */
  var testiWrap = document.querySelector('[data-testimonials]');
  if (testiWrap) {
    var tSlides = testiWrap.querySelectorAll('.testi-slide');
    var tDots = testiWrap.querySelectorAll('.testi-nav button');
    var tIndex = 0;
    function showTesti(i) {
      tIndex = (i + tSlides.length) % tSlides.length;
      tSlides.forEach(function (s, si) { s.classList.toggle('is-active', si === tIndex); });
      tDots.forEach(function (d, di) { d.classList.toggle('is-active', di === tIndex); });
    }
    tDots.forEach(function (d, di) { d.addEventListener('click', function () { showTesti(di); }); });
    setInterval(function () { showTesti(tIndex + 1); }, 5500);
  }

  /* ---------- Newsletter form ---------- */
  var newsForm = document.querySelector('[data-newsletter]');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = newsForm.querySelector('input[type="email"]');
      var msg = newsForm.querySelector('.form-msg');
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(input.value.trim())) {
        msg.textContent = 'Please enter a valid email address.';
        msg.className = 'form-msg err';
        input.focus();
        return;
      }
      msg.textContent = 'You\u2019re on the list \u2014 look out for our next harvest update.';
      msg.className = 'form-msg ok';
      newsForm.reset();
    });
  }

  /* =========================================================
     PRODUCTS PAGE: filter, search, modal, inquiry tray
     ========================================================= */
  var productGrid = document.querySelector('[data-product-grid]');
  if (productGrid) {
    var cards = Array.from(productGrid.querySelectorAll('.product-card'));
    var pills = document.querySelectorAll('.pill[data-filter]');
    var searchInput = document.querySelector('[data-product-search]');
    var emptyState = document.querySelector('.empty-state');
    var activeFilter = 'all';

    function applyFilters() {
      var term = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        var name = card.getAttribute('data-name').toLowerCase();
        var matchesCat = activeFilter === 'all' || cat === activeFilter;
        var matchesTerm = name.indexOf(term) !== -1;
        var show = matchesCat && matchesTerm;
        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
      });
      if (emptyState) emptyState.classList.toggle('is-visible', visibleCount === 0);
    }

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        pills.forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');
        activeFilter = pill.getAttribute('data-filter');
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('keyup', function () { applyFilters(); });
    }

    /* ---------- Modal ---------- */
    var overlay = document.querySelector('[data-modal]');
    var modalImg = overlay ? overlay.querySelector('[data-modal-img]') : null;
    var modalTag = overlay ? overlay.querySelector('[data-modal-tag]') : null;
    var modalTitle = overlay ? overlay.querySelector('[data-modal-title]') : null;
    var modalDesc = overlay ? overlay.querySelector('[data-modal-desc]') : null;
    var modalPrice = overlay ? overlay.querySelector('[data-modal-price]') : null;
    var modalQty = overlay ? overlay.querySelector('[data-qty]') : null;
    var modalWa = overlay ? overlay.querySelector('[data-modal-wa]') : null;
    var currentProduct = null;
    var qty = 1;

    function openModal(card) {
      currentProduct = {
        name: card.getAttribute('data-name'),
        price: card.getAttribute('data-price'),
        img: card.querySelector('img').getAttribute('src'),
        desc: card.getAttribute('data-desc'),
        tag: card.getAttribute('data-tag')
      };
      qty = 1;
      if (modalQty) modalQty.textContent = qty;
      if (modalImg) { modalImg.src = currentProduct.img; modalImg.alt = currentProduct.name; }
      if (modalTag) modalTag.textContent = currentProduct.tag;
      if (modalTitle) modalTitle.textContent = currentProduct.name;
      if (modalDesc) modalDesc.textContent = currentProduct.desc;
      if (modalPrice) modalPrice.textContent = currentProduct.price;
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    function closeModal() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    cards.forEach(function (card) {
      var viewBtn = card.querySelector('[data-view]');
      if (viewBtn) viewBtn.addEventListener('click', function () { openModal(card); });
      card.querySelector('.product-media').addEventListener('click', function () { openModal(card); });
    });

    if (overlay) {
      overlay.querySelector('.modal-close').addEventListener('click', closeModal);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
      /* Keyboard event: close modal on Escape */
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
      });
      var qtyMinus = overlay.querySelector('[data-qty-minus]');
      var qtyPlus = overlay.querySelector('[data-qty-plus]');
      if (qtyMinus) qtyMinus.addEventListener('click', function () { qty = Math.max(1, qty - 1); modalQty.textContent = qty; });
      if (qtyPlus) qtyPlus.addEventListener('click', function () { qty = Math.min(20, qty + 1); modalQty.textContent = qty; });

      /* ---------- Inquiry tray ---------- */
      var trayItems = [];
      var trayToggle = document.querySelector('[data-tray-toggle]');
      var tray = document.querySelector('[data-tray]');
      var trayList = document.querySelector('[data-tray-list]');
      var trayCount = document.querySelector('[data-tray-count]');
      var traySend = document.querySelector('[data-tray-send]');

      function renderTray() {
        if (!trayList) return;
        trayCount.textContent = trayItems.length;
        trayCount.style.display = trayItems.length ? 'flex' : 'none';
        if (!trayItems.length) {
          trayList.innerHTML = '<p class="tray-empty">No items yet. Open a product and add it to your inquiry.</p>';
          return;
        }
        trayList.innerHTML = trayItems.map(function (item, i) {
          return '<div class="tray-item"><span>' + item.qty + '\u00D7 ' + item.name + '</span>' +
            '<button type="button" data-remove="' + i + '">Remove</button></div>';
        }).join('');
        trayList.querySelectorAll('[data-remove]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            trayItems.splice(parseInt(btn.getAttribute('data-remove'), 10), 1);
            renderTray();
          });
        });
      }

      var addBtn = overlay.querySelector('[data-add-inquiry]');
      if (addBtn) {
        addBtn.addEventListener('click', function () {
          trayItems.push({ name: currentProduct.name, qty: qty });
          renderTray();
          addBtn.textContent = 'Added \u2713';
          setTimeout(function () { addBtn.textContent = 'Add to inquiry'; }, 1400);
          if (tray) tray.classList.add('is-open');
        });
      }
      if (trayToggle) trayToggle.addEventListener('click', function () { tray.classList.toggle('is-open'); });
      if (traySend) {
        traySend.addEventListener('click', function () {
          if (!trayItems.length) return;
          var lines = trayItems.map(function (i) { return '- ' + i.qty + 'x ' + i.name; }).join('\n');
          var text = 'Hello Zeera & Co, I would like to enquire about:\n' + lines;
          window.open('https://wa.me/923001234567?text=' + encodeURIComponent(text), '_blank');
        });
      }
      renderTray();

      if (modalWa) {
        modalWa.addEventListener('click', function (e) {
          e.preventDefault();
          var text = 'Hello Zeera & Co, I would like to order ' + qty + 'x ' + currentProduct.name + '.';
          window.open('https://wa.me/923001234567?text=' + encodeURIComponent(text), '_blank');
        });
      }
    }

    applyFilters();
  }

  /* =========================================================
     ACCORDION (FAQ) — mouse click + keyboard accessible
     ========================================================= */
  document.querySelectorAll('.accordion-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.style.maxHeight = expanded ? null : panel.scrollHeight + 'px';
    });
  });

  /* =========================================================
     CONTACT FORM VALIDATION
     ========================================================= */
  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    var successBox = document.querySelector('.form-success');
    var messageField = contactForm.querySelector('#message');
    var charCount = document.querySelector('[data-char-count]');

    if (messageField && charCount) {
      messageField.addEventListener('keyup', function () {
        var remaining = 400 - messageField.value.length;
        charCount.textContent = Math.max(remaining, 0) + ' characters left';
      });
    }

    function setError(field, message) {
      var wrap = field.closest('.field');
      wrap.classList.toggle('has-error', !!message);
      var errEl = wrap.querySelector('.field-error');
      if (errEl) errEl.textContent = message || '';
    }

    function validateField(field) {
      var value = field.value.trim();
      if (field.hasAttribute('required') && !value) {
        setError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && value) {
        var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!ok) { setError(field, 'Enter a valid email address.'); return false; }
      }
      if (field.id === 'phone' && value) {
        var okPhone = /^[0-9+\-\s]{7,15}$/.test(value);
        if (!okPhone) { setError(field, 'Enter a valid phone number.'); return false; }
      }
      if (field.id === 'message' && value && value.length < 10) {
        setError(field, 'Please add a little more detail (min. 10 characters).');
        return false;
      }
      setError(field, '');
      return true;
    }

    contactForm.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field); });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = contactForm.querySelectorAll('input, textarea, select');
      var allValid = true;
      fields.forEach(function (field) { if (!validateField(field)) allValid = false; });

      var terms = contactForm.querySelector('#terms');
      if (terms && !terms.checked) {
        allValid = false;
        alert('Please confirm you agree to be contacted before submitting.');
      }

      if (!allValid) return;

      successBox.textContent = 'Thank you \u2014 your message has been received. Our team will reply within one business day.';
      successBox.classList.add('is-visible');
      contactForm.reset();
      if (charCount) charCount.textContent = '400 characters left';
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

});
