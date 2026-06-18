/* ===================================================
   MURAMALLA JAHNAVI ARTISTRY — main.js
   =================================================== */

(function () {
  'use strict';

  /* ─── SCROLL PROGRESS BAR ─── */
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.transform = 'scaleX(' + progress + ')';
  }

  /* ─── NAV SCROLL STATE ─── */
  const nav = document.getElementById('nav');
  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', function () {
    updateProgress();
    updateNav();
  }, { passive: true });

  /* ─── MOBILE NAV TOGGLE ─── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  navToggle.addEventListener('click', function () {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', open);
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });

  /* ─── PORTFOLIO (LOAD & MASONRY) ─── */
  const grid = document.getElementById('portfolioGrid');
  const loadMoreWrap = document.getElementById('portfolioLoadMoreWrap');
  const btnLoadMore = document.getElementById('btnLoadMore');
  let msnry;
  let allPortfolioItems = [];
  const INITIAL_LIMIT = 6;

  if (grid) {
    async function initPortfolio() {
      const response = await fetch('portfolio/portfolio.json');
      const data = await response.json();
      const allItems = [];

      for (const [category, images] of Object.entries(data)) {
        images.forEach(path => allItems.push({ category, path }));
      }
      
      allItems.forEach((item, index) => {
        item.large = index % 5 === 0;
      });

      allPortfolioItems = allItems;
      renderPortfolio('all', INITIAL_LIMIT);

      // Init Masonry
      msnry = new Masonry(grid, {
        itemSelector: '.portfolio-item',
        columnWidth: '.grid-sizer',
        percentPosition: true,
        gutter: 12,
        transitionDuration: '0.4s'
      });

      imagesLoaded(grid).on('progress', () => msnry.layout());
    }

    function renderPortfolio(filter, limit) {
      const filtered = allPortfolioItems.filter(item => filter === 'all' || item.category === filter);
      const visible = limit ? filtered.slice(0, limit) : filtered;
      
      grid.innerHTML = '<div class="grid-sizer"></div>' + visible.map(item => `
        <div class="portfolio-item ${item.large ? 'portfolio-item-large' : ''}" data-cat="${item.category}">
          <div class="portfolio-img">
            <img src="portfolio/${item.path}" alt="${item.category}" loading="lazy">
            <div class="portfolio-overlay">
              <span class="portfolio-tag">${item.category}</span>
            </div>
          </div>
        </div>
      `).join('');

      if (msnry) {
        msnry.reloadItems();
        msnry.layout();
        imagesLoaded(grid).on('progress', () => msnry.layout());
      }

      if (loadMoreWrap) {
        loadMoreWrap.style.display = filtered.length > visible.length ? 'block' : 'none';
      }
    }

    btnLoadMore.addEventListener('click', () => {
      const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
      renderPortfolio(activeFilter, null);
    });

    /* ─── PORTFOLIO FILTER ─── */
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        renderPortfolio(btn.dataset.filter, INITIAL_LIMIT);
      });
    });

    initPortfolio();
  }

  /* ─── TESTIMONIALS CAROUSEL ─── */
  const track      = document.getElementById('testimonialsTrack');
  const cards      = track ? Array.from(track.querySelectorAll('.testimonial-card')) : [];
  const dotsWrap   = document.getElementById('tDots');
  const prevBtn    = document.getElementById('tPrev');
  const nextBtn    = document.getElementById('tNext');

  if (cards.length && dotsWrap) {
    // How many cards visible at once (CSS: 50% width cards)
    function visibleCount() {
      return window.innerWidth <= 680 ? 1 : 2;
    }
    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    let current = 0;

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      const total = maxIndex() + 1;
      for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.className = 't-dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        dot.setAttribute('role', 'tab');
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      const dots = dotsWrap.querySelectorAll('.t-dot');
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const card = cards[0];
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 0;
      const cardWidth = card.offsetWidth + gap;
      
      track.style.transform = 'translateX(-' + (current * cardWidth) + 'px)';
      updateDots();
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); });

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? current + 1 : current - 1);
    }, { passive: true });

    window.addEventListener('resize', function () { buildDots(); goTo(0); });
    buildDots();
    goTo(0);
  }

  /* ─── FORM — set min date to today ─── */
  const dateInput = document.getElementById('fdate');
  if (dateInput) {
    const today = new Date();
    const yyyy  = today.getFullYear();
    const mm    = String(today.getMonth() + 1).padStart(2, '0');
    const dd    = String(today.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  /* ─── ARTIST 3D CAROUSEL ─── */
  const carousel = document.getElementById('aboutCarousel');
  if (carousel) {
    const cards = Array.from(carousel.querySelectorAll('.about-carousel-card'));
    const prevBtn = document.getElementById('aboutPrev');
    const nextBtn = document.getElementById('aboutNext');
    let currentIndex = 0;

    function updateCarousel() {
      cards.forEach((card, idx) => {
        card.classList.remove('active', 'prev', 'next');
        
        if (idx === currentIndex) {
          card.classList.add('active');
        } else if (idx === (currentIndex + 1) % cards.length) {
          card.classList.add('next');
        } else if (idx === (currentIndex - 1 + cards.length) % cards.length) {
          card.classList.add('prev');
        }
      });
    }

    function rotateNext() {
      currentIndex = (currentIndex + 1) % cards.length;
      updateCarousel();
    }

    function rotatePrev() {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateCarousel();
    }

    // Direct card click to shift focus
    cards.forEach((card) => {
      card.addEventListener('click', function () {
        if (card.classList.contains('next')) {
          rotateNext();
          
        } else if (card.classList.contains('prev')) {
          rotatePrev();
          
        }
      });
    });

    // Control buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        rotatePrev();
        
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        rotateNext();
        
      });
    }

    // Touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const difference = touchStartX - touchEndX;
      const swipeThreshold = 50;
      if (Math.abs(difference) > swipeThreshold) {
        if (difference > 0) {
          rotateNext();
        } else {
          rotatePrev();
        }
        
      }
    }
  }

})();