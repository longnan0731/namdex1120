/* ==========================================================================
   Apple Keynote Style Presentation Controller (app.js)
   100% Offline & Portable
   ========================================================================== */

(function () {
  let currentSlide = 0;
  let slides = [];
  let pills = [];

  const orbPositions = [
    { o1: [-120, -180, '#2997ff'], o2: [-100, -180, '#bf5af2'] },
    { o1: [100, -120, '#5ac8fa'],  o2: [80, -140, '#2997ff'] },
    { o1: [-80, 120, '#bf5af2'],   o2: [-120, 60, '#5ac8fa'] },
    { o1: [160, -100, '#ff9f0a'],  o2: [-80, -160, '#2997ff'] },
    { o1: [-140, -100, '#bf5af2'], o2: [120, -120, '#30d158'] },
    { o1: [80, 80, '#30d158'],     o2: [-100, -140, '#2997ff'] },
    { o1: [-100, -150, '#2997ff'], o2: [100, -100, '#30d158'] },
    { o1: [0, -180, '#30d158'],    o2: [-80, -160, '#bf5af2'] },
    { o1: [-120, -180, '#2997ff'], o2: [-100, -180, '#bf5af2'] }
  ];

  function init() {
    slides = Array.from(document.querySelectorAll('.slide'));
    pills = Array.from(document.querySelectorAll('.nav-pill'));

    // Bind top navigation pills
    pills.forEach((pill, idx) => {
      pill.addEventListener('click', () => goToSlide(idx));
    });

    // Support horizontal mouse-wheel scrolling over nav-pills (ideal for Windows PC mouse)
    const navPillsContainer = document.querySelector('.nav-pills');
    if (navPillsContainer) {
      navPillsContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          navPillsContainer.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // Bind Prev / Next buttons
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    if (prevBtn) prevBtn.addEventListener('click', () => prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => nextSlide());

    // Bind Theme Toggle (Default is Apple Store Light Mode)
    const themeBtn = document.getElementById('btn-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-theme');
        themeBtn.textContent = isDark ? '☀️ 라이트' : '🌙 다크';
      });
    }

    // Bind Fullscreen Toggle
    const fsBtn = document.getElementById('btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', toggleFullScreen);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const splash = document.getElementById('apple-hero-splash');
      if (splash && splash.classList.contains('active')) {
        const p2 = document.getElementById('splash-page-2');
        const p3 = document.getElementById('splash-page-3');
        const p4 = document.getElementById('splash-page-4');
        const h = window.innerHeight;
        let curPage = 1;
        if (p4 && p4.getBoundingClientRect().top <= h * 0.45) {
          curPage = 4;
        } else if (p3 && p3.getBoundingClientRect().top <= h * 0.45) {
          curPage = 3;
        } else if (p2 && p2.getBoundingClientRect().top <= h * 0.45) {
          curPage = 2;
        }

        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
          e.preventDefault();
          if (curPage === 1) scrollToSplashPage(2);
          else if (curPage === 2) scrollToSplashPage(3);
          else if (curPage === 3) scrollToSplashPage(4);
          else if (typeof window.startMainPresentation === 'function') window.startMainPresentation();
          else closeHeroSplash();
          return;
        }
        if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          if (curPage === 4) scrollToSplashPage(3);
          else if (curPage === 3) scrollToSplashPage(2);
          else if (curPage === 2) scrollToSplashPage(1);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeHeroSplash();
          return;
        }
        // Arrow navigation on Page 3 (TestRail switcher)
        if (curPage === 3 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          if (e.key === 'ArrowLeft') window.switchTestRailSlide(1);
          else window.switchTestRailSlide(2);
          return;
        }

        // Arrow navigation on Page 4 (Challenge switcher: Slide 1 Web F12 <-> Slide 2 Locked iPhone)
        if (curPage === 4 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          if (e.key === 'ArrowLeft') window.switchChallengeSlide(1);
          else window.switchChallengeSlide(2);
          return;
        }

        if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          if (curPage === 1) scrollToSplashPage(2);
          else if (curPage === 2) scrollToSplashPage(3);
          else if (curPage === 3) scrollToSplashPage(4);
          else if (typeof window.startMainPresentation === 'function') window.startMainPresentation();
          else closeHeroSplash();
          return;
        }
        return;
      }
      const modal = document.getElementById('lightbox-modal');
      if (modal && modal.classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const activeTrImg = document.getElementById('lightbox-active-img');
          if (activeTrImg && activeTrImg.src.includes('sample_testrail')) {
            e.preventDefault();
            const nextSlide = e.key === 'ArrowLeft' ? 1 : 2;
            window.switchTestRailSlide(nextSlide);
            activeTrImg.src = nextSlide === 1 
              ? './media/sample_testrail_homepage1.png' 
              : './media/sample_testrail_homepage2.png';
            const trPill = document.querySelector('.lightbox-slide-pill');
            if (trPill) trPill.textContent = nextSlide === 1 ? '1 / 2 전체 Suite 요약' : '2 / 2 상세 케이스 로그';
          }
        }
        return;
      }

      // Escape key exits content full-screen mode and returns to category shelf
      if (e.key === 'Escape' && document.body.classList.contains('content-fullscreen-active')) {
        e.preventDefault();
        window.jumpToTop();
        return;
      }

      // Shift + ArrowLeft/Right to flip detailed comparison carousel cards
      if (e.shiftKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const resultsSec = document.getElementById('sec-results');
        if (resultsSec && resultsSec.classList.contains('active') && typeof window.navigateCompareCard === 'function') {
          e.preventDefault();
          if (e.key === 'ArrowRight') window.navigateCompareCard(1);
          else window.navigateCompareCard(-1);
          return;
        }
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
      }
    });

    initSubTabs();
    initMediaSlots();
    initLiveSimulators();
    initLiveTypingEngine();
    initSplashBadgeRolling();
    initCategoryTabs();
    initShowcaseSlider();

    // Splash scroll observer for sticky header tabs & autoplay sync (3-Page system: 01 개요, 02 영상, 03 TestRail)
    const splashEl = document.getElementById('apple-hero-splash');
    if (splashEl) {
      // Set default muted + loop for splash videos
      const initVi = document.getElementById('splash-video-ide');
      const initVp = document.getElementById('splash-video-phone');
      if (initVi) { initVi.muted = true; initVi.loop = true; }
      if (initVp) { initVp.muted = true; initVp.loop = true; }

      splashEl.addEventListener('scroll', () => {
        const p1 = document.getElementById('splash-page-1');
        const p2 = document.getElementById('splash-page-2');
        const p3 = document.getElementById('splash-page-3');
        const p4 = document.getElementById('splash-page-4');
        const tab1 = document.getElementById('splash-nav-p1');
        const tab2 = document.getElementById('splash-nav-p2');
        const tab3 = document.getElementById('splash-nav-p3');
        const tab4 = document.getElementById('splash-nav-p4');
        const splashTopBtn = document.getElementById('splash-floating-back-to-top');

        if (!p1 || !p2 || !p3) return;

        const h = window.innerHeight;
        const r2 = p2.getBoundingClientRect();
        const r3 = p3.getBoundingClientRect();
        const r4 = p4 ? p4.getBoundingClientRect() : null;

        let activePage = 1;
        if (r4 && r4.top <= h * 0.45) {
          activePage = 4;
        } else if (r3.top <= h * 0.45) {
          activePage = 3;
        } else if (r2.top <= h * 0.45) {
          activePage = 2;
        }

        if (tab1) tab1.classList.toggle('active', activePage === 1);
        if (tab2) tab2.classList.toggle('active', activePage === 2);
        if (tab3) tab3.classList.toggle('active', activePage === 3);
        if (tab4) tab4.classList.toggle('active', activePage === 4);

        // Toggle Splash Dedicated Floating Back-to-Top Button
        if (splashTopBtn) {
          if (activePage >= 2 || splashEl.scrollTop > 80) {
            splashTopBtn.classList.add('visible');
          } else {
            splashTopBtn.classList.remove('visible');
          }
        }

        const vi = document.getElementById('splash-video-ide');
        const vp = document.getElementById('splash-video-phone');
        if (vi) { vi.muted = true; vi.loop = true; }
        if (vp) { vp.muted = true; vp.loop = true; }

        if (activePage === 2) {
          if (vi && vi.paused) vi.play().catch(() => {});
          if (vp && vp.paused) vp.play().catch(() => {});
        }
      }, { passive: true });
    }

    // Ensure Overview Hero Splash is open and active by default on entry
    const splash = document.getElementById('apple-hero-splash');
    if (splash) {
      splash.classList.remove('closed', 'closing');
      splash.classList.add('active');
      splash.scrollTop = 0;
    }
    // Clean stale URL hash on fresh entry so reload stays on Overview splash
    if (window.location.hash) {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (_) {}
    }

    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '').trim();
      const parsed = parseInt(newHash, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < slides.length && parsed !== currentSlide) {
        goToSlide(parsed);
      }
    });

    updateUI();
  }

  window.goToSlide = function (index) {
    if (typeof window.showCategoryTab === 'function') {
      window.showCategoryTab(index <= 1 ? 0 : index - 1);
    }
  };

  function nextSlide() {
    if (typeof window.showCategoryTab === 'function' && typeof currentCategoryIdx !== 'undefined') {
      if (currentCategoryIdx < integratedSections.length - 1) {
        window.showCategoryTab(currentCategoryIdx + 1);
      }
    }
  }

  function prevSlide() {
    if (typeof window.showCategoryTab === 'function' && typeof currentCategoryIdx !== 'undefined') {
      if (currentCategoryIdx > 0) {
        window.showCategoryTab(currentCategoryIdx - 1);
      }
    }
  }

  function updateUI() {
    slides.forEach((s, idx) => {
      if (idx === currentSlide) {
        s.classList.add('active');
        s.scrollTop = 0;
      } else {
        s.classList.remove('active');
      }
    });

    pills.forEach((p, idx) => {
      p.classList.toggle('active', idx === currentSlide);
    });

    const counter = document.getElementById('slide-counter');
    if (counter) {
      counter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }

    const progress = document.getElementById('progress-fill');
    if (progress) {
      const pct = ((currentSlide + 1) / slides.length) * 100;
      progress.style.width = `${pct}%`;
    }

    // Move ambient orbs subtly
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    const cfg = orbPositions[currentSlide % orbPositions.length];
    if (orb1 && orb2 && cfg) {
      orb1.style.transform = `translate(${cfg.o1[0]}px, ${cfg.o1[1]}px)`;
      orb2.style.transform = `translate(${cfg.o2[0]}px, ${cfg.o2[1]}px)`;
    }

    // Auto-scroll GNB pills so active category tab is never clipped
    scrollActivePillIntoView();

    // Trigger or pause Live YAML typing engine on Slide 03-A
    if (window.handleSlideTyping) {
      window.handleSlideTyping(currentSlide);
    }

    // Keep URL hash in sync for easy F5 refresh and slide bookmarking
    try {
      history.replaceState(null, '', '#' + currentSlide);
    } catch (_) {}
  }

  /* ========================================================================
     Auto-Scroll GNB Nav Pills
     Smoothly slides navigation pills horizontally so the active category tab
     is always comfortably in view and never clipped at screen edges.
     ======================================================================== */
  function scrollActivePillIntoView(smooth = true) {
    if (!pills || pills.length === 0 || currentSlide < 0 || currentSlide >= pills.length) return;
    const activePill = pills[currentSlide];
    const container = document.querySelector('.nav-pills');
    if (!activePill || !container) return;

    requestAnimationFrame(() => {
      // If content fits without overflow, nothing to scroll
      if (container.scrollWidth <= container.clientWidth + 2) return;

      const cRect = container.getBoundingClientRect();
      const pRect = activePill.getBoundingClientRect();

      // Desired scroll: center the active pill within the visible pill container
      const pillCenter = pRect.left + pRect.width / 2;
      const containerCenter = cRect.left + cRect.width / 2;
      const delta = pillCenter - containerCenter;

      if (Math.abs(delta) > 6) {
        container.scrollBy({
          left: delta,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });
  }

  function toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function initSubTabs() {
    const tabGroups = document.querySelectorAll('[data-tab-group]');
    tabGroups.forEach((group) => {
      const groupName = group.getAttribute('data-tab-group');
      const buttons = group.querySelectorAll('.sub-tab-btn');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-tab-target');
          buttons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          const panels = document.querySelectorAll(`[data-tab-panel="${groupName}"]`);
          panels.forEach((panel) => {
            panel.style.display = panel.id === targetId ? 'block' : 'none';
          });
        });
      });
    });
  }

  /* ========================================================================
     Media Slots: Supports GIF, MP4/MOV Video, File Picker & Drag-and-Drop
     ======================================================================== */
  function initMediaSlots() {
    const slots = document.querySelectorAll('.media-slot');
    slots.forEach((slot) => {
      const fileInput = slot.querySelector('input[type="file"]');
      const loadBtn = slot.querySelector('.btn-load-media');
      const resetBtn = slot.querySelector('.btn-reset-media');
      const expandBtn = slot.querySelector('.btn-expand-media');

      if (loadBtn && fileInput) {
        loadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (file) renderMediaFile(slot, file);
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          clearCustomMedia(slot);
        });
      }

      if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openSlotInLightbox(slot);
        });
      }

      // Drag and drop support
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.style.outline = '2px dashed #2997ff';
      });
      slot.addEventListener('dragleave', () => {
        slot.style.outline = 'none';
      });
      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.style.outline = 'none';
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) renderMediaFile(slot, file);
      });
    });
  }

  function renderMediaFile(slot, file) {
    clearCustomMedia(slot);
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);

    if (isVideo) {
      const video = document.createElement('video');
      video.src = url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.controls = true;
      video.className = 'custom-media-el';
      slot.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.className = 'custom-media custom-media-el';
      slot.appendChild(img);
    }

    const overlay = slot.querySelector('.sim-overlay-layer');
    if (overlay) overlay.style.display = 'none';

    const resetBtn = slot.querySelector('.btn-reset-media');
    if (resetBtn) resetBtn.style.display = 'inline-block';
  }

  function clearCustomMedia(slot) {
    const existing = slot.querySelectorAll('.custom-media-el');
    existing.forEach((el) => el.remove());
    const overlay = slot.querySelector('.sim-overlay-layer');
    if (overlay) overlay.style.display = '';
    const resetBtn = slot.querySelector('.btn-reset-media');
    if (resetBtn) resetBtn.style.display = 'none';
  }

  function openSlotInLightbox(slot) {
    const modal = document.getElementById('lightbox-modal');
    const body = document.getElementById('lightbox-body');
    if (!modal || !body) return;

    body.innerHTML = '';
    const customVideo = slot.querySelector('video.custom-media-el');
    const customImg = slot.querySelector('img.custom-media-el');
    const defaultImg = slot.querySelector('img.default-capture');

    if (customVideo) {
      const v = document.createElement('video');
      v.src = customVideo.src;
      v.autoplay = true;
      v.loop = true;
      v.controls = true;
      body.appendChild(v);
    } else if (customImg) {
      const i = document.createElement('img');
      i.src = customImg.src;
      body.appendChild(i);
    } else if (defaultImg) {
      const i = document.createElement('img');
      i.src = defaultImg.src;
      body.appendChild(i);
    } else {
      return;
    }

    modal.classList.add('open');
  }

  window.closeLightbox = function () {
    const modal = document.getElementById('lightbox-modal');
    const body = document.getElementById('lightbox-body');
    if (modal) modal.classList.remove('open');
    if (body) body.innerHTML = '';
  };

  /* ========================================================================
     Live Animated Simulator inside iPhone / Terminal Mockups
     ======================================================================== */
  function initLiveSimulators() {
    const touchEl = document.getElementById('sim-touch-dot');
    const highlightBox = document.getElementById('sim-highlight-box');
    const stepBadge = document.getElementById('sim-step-badge');
    const simSteps = [
      {
        x: '89.0%',
        y: '15.6%',
        w: '48px',
        h: '40px',
        label: '① tapOn: id="Mthingsbook.append.end.more" (더보기 ⋯)'
      },
      {
        x: '45.2%',
        y: '31.0%',
        w: '58px',
        h: '34px',
        label: '② tapOn: "IMDb" (OTT 인앱 링크 열기)'
      },
      {
        x: '25.6%',
        y: '36.5%',
        w: '120px',
        h: '170px',
        label: '③ tapOn: point="100, 300" (OTT 글감 상세 이동)'
      },
      {
        x: '43.0%',
        y: '51.0%',
        w: '260px',
        h: '40px',
        label: '④ assertVisible: "The Shawshank Redemption" (타이틀)'
      },
      {
        x: '11.3%',
        y: '93.3%',
        w: '46px',
        h: '34px',
        label: '⑤ tapOn: point="45, 785" (좋아요 ♥)'
      },
      {
        x: '78.7%',
        y: '93.3%',
        w: '46px',
        h: '34px',
        label: '⑥ tapOn: point="307, 785" (Keep 🔖)'
      },
      {
        x: '11.0%',
        y: '15.6%',
        w: '42px',
        h: '40px',
        label: '⑦ tapOn: "close" (글 End 닫기 ✕)'
      }
    ];

    let sIdx = 0;
    let simTimer = null;

    function applyStep(idx) {
      sIdx = ((idx % simSteps.length) + simSteps.length) % simSteps.length;
      const step = simSteps[sIdx];
      if (touchEl) {
        touchEl.style.left = step.x;
        touchEl.style.top = step.y;
      }
      if (highlightBox) {
        highlightBox.style.left = step.x;
        highlightBox.style.top = step.y;
        highlightBox.style.width = step.w;
        highlightBox.style.height = step.h;
      }
      if (stepBadge) {
        stepBadge.textContent = step.label;
      }
      document.querySelectorAll('.sim-pin, .sim-pill-btn, .inspect-pin-card').forEach((el) => {
        const attrVal = el.getAttribute('data-sim-step') ?? el.getAttribute('data-sim-idx');
        const elStep = parseInt(attrVal, 10);
        el.classList.toggle('active', elStep === sIdx);
      });
    }

    function startTimer() {
      if (simTimer) clearInterval(simTimer);
      simTimer = setInterval(() => {
        applyStep(sIdx + 1);
      }, 2600);
    }

    if (touchEl || highlightBox) {
      applyStep(0);
      startTimer();

      document.querySelectorAll('[data-sim-step], [data-sim-idx]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const attrVal = el.getAttribute('data-sim-step') ?? el.getAttribute('data-sim-idx');
          const targetIdx = parseInt(attrVal, 10);
          if (!isNaN(targetIdx)) {
            applyStep(targetIdx);
            startTimer();
          }
        });
      });
    }
  }

  /* ========================================================================
     Live Code Typing Simulator (Slide 03-A: iOS_Suite_006_OTT.yaml)
     Video-like keystroke typing animation with syntax highlighting & controls
     ======================================================================== */
  const ottYamlScript = [
    { text: '#C12253244 — TestRail TC 매칭: OTT 글감 검색 및 결과 확인', html: '<span class="c-comment">#C12253244 — TestRail TC 매칭: OTT 글감 검색 및 결과 확인</span>' },
    { text: '# 0. 로그인 상태로 ThingsBook 앱 진입', html: '<span class="c-comment"># 0. 로그인 상태로 ThingsBook 앱 진입</span>' },
    { text: '- launchApp:', html: '- <span class="c-key">launchApp</span>:' },
    { text: '    appId: com.navercorp.article.ios', html: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-key">appId</span>: <span class="c-str">com.navercorp.article.ios</span>' },
    { text: '', html: '' },
    { text: '# 1. GNB "+" Create 버튼 탭', html: '<span class="c-comment"># 1. GNB "+" Create 버튼 탭</span>' },
    { text: '- tapOn: "tabPlus"', html: '- <span class="c-key">tapOn</span>: <span class="c-str">"tabPlus"</span>' },
    { text: '', html: '' },
    { text: '# 2. 컬렉션 리스트에서 "NamAuto_Movie" 스와이프 탐색 후 선택', html: '<span class="c-comment"># 2. 컬렉션 리스트에서 "NamAuto_Movie" 스와이프 탐색 후 선택</span>' },
    { text: '- scrollUntilVisible:', html: '- <span class="c-key">scrollUntilVisible</span>:' },
    { text: '    element:', html: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-key">element</span>:' },
    { text: '      text: "NamAuto_Movie"', html: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-key">text</span>: <span class="c-str">"NamAuto_Movie"</span>' },
    { text: '    direction: DOWN', html: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-key">direction</span>: <span class="c-str">DOWN</span>' },
    { text: '- tapOn: "NamAuto_Movie"', html: '- <span class="c-key">tapOn</span>: <span class="c-str">"NamAuto_Movie"</span>' },
    { text: '', html: '' },
    { text: '# 3. 글쓰기 에디터 글감 추가 [+] 버튼 클릭', html: '<span class="c-comment"># 3. 글쓰기 에디터 글감 추가 [+] 버튼 클릭</span>' },
    { text: '- tapOn: "plus"', html: '- <span class="c-key">tapOn</span>: <span class="c-str">"plus"</span>' },
    { text: '', html: '' },
    { text: '# 4. OTT 글감 검색 및 쇼생크 탈출 검색어 타이핑', html: '<span class="c-comment"># 4. OTT 글감 검색 및 쇼생크 탈출 검색어 타이핑</span>' },
    { text: '- extendedWaitUntil:', html: '- <span class="c-key">extendedWaitUntil</span>:' },
    { text: '    visible: "Search movie or TV show"', html: '&nbsp;&nbsp;&nbsp;&nbsp;<span class="c-key">visible</span>: <span class="c-str">"Search movie or TV show"</span>' },
    { text: '- inputText: "The Shawshank Redemption"', html: '- <span class="c-key">inputText</span>: <span class="c-str">"The Shawshank Redemption"</span>' },
    { text: '', html: '' },
    { text: '# 5. 검색 결과 및 OTT 메타데이터 정답 검증 (PASS)', html: '<span class="c-comment"># 5. 검색 결과 및 OTT 메타데이터 정답 검증 (PASS)</span>' },
    { text: '- assertVisible: "The Shawshank Redemption"', html: '- <span class="c-key">assertVisible</span>: <span class="c-str">"The Shawshank Redemption"</span>' }
  ];

  let typingState = {
    lineIdx: 0,
    charIdx: 0,
    isRunning: false,
    isPaused: false,
    speed: 1,
    timerId: null,
    hasAutoStarted: false
  };

  function initLiveTypingEngine() {
    const codeArea = document.getElementById('live-yaml-code');
    const toggleBtn = document.getElementById('btn-typing-toggle');
    const replayBtn = document.getElementById('btn-typing-replay');
    const speedBtn = document.getElementById('btn-typing-speed');
    const skipBtn = document.getElementById('btn-typing-skip');
    const statusBadge = document.getElementById('live-typing-status');
    const progressEl = document.getElementById('live-typing-progress');

    if (!codeArea) return;

    function updateBadge(state) {
      if (!statusBadge) return;
      statusBadge.classList.remove('completed', 'paused');
      const textEl = statusBadge.querySelector('.status-text');
      if (state === 'typing') {
        if (textEl) textEl.textContent = 'LIVE';
      } else if (state === 'paused') {
        statusBadge.classList.add('paused');
        if (textEl) textEl.textContent = 'PAUSE';
      } else if (state === 'completed') {
        statusBadge.classList.add('completed');
        if (textEl) textEl.textContent = 'DONE';
      }
    }

    function renderProgress() {
      if (progressEl) {
        progressEl.textContent = `Line ${Math.min(typingState.lineIdx + 1, ottYamlScript.length)}/${ottYamlScript.length}`;
      }
    }

    function renderAllInstantly() {
      if (typingState.timerId) clearTimeout(typingState.timerId);
      typingState.isRunning = false;
      typingState.isPaused = false;
      typingState.lineIdx = ottYamlScript.length;

      codeArea.innerHTML = ottYamlScript.map(item => {
        if (!item.text) return '<div style="height: 8px;"></div>';
        return `<div class="live-line">${item.html}</div>`;
      }).join('');
      codeArea.scrollTop = 0;

      updateBadge('completed');
      if (toggleBtn) toggleBtn.textContent = '▶ 재생';
      renderProgress();
    }

    function resetAndStart() {
      if (typingState.timerId) clearTimeout(typingState.timerId);
      typingState.lineIdx = 0;
      typingState.charIdx = 0;
      typingState.isRunning = true;
      typingState.isPaused = false;

      codeArea.innerHTML = '';
      updateBadge('typing');
      if (toggleBtn) toggleBtn.textContent = '❚❚ 정지';
      renderProgress();

      typeNextStep();
    }

    function typeNextStep() {
      if (!typingState.isRunning || typingState.isPaused) return;

      if (typingState.lineIdx >= ottYamlScript.length) {
        typingState.isRunning = false;
        const cursors = codeArea.querySelectorAll('.typing-cursor');
        cursors.forEach(c => c.remove());
        updateBadge('completed');
        if (toggleBtn) toggleBtn.textContent = '▶ 재생';
        renderProgress();
        return;
      }

      const item = ottYamlScript[typingState.lineIdx];

      // Empty spacing line
      if (!item.text || item.text.trim() === '') {
        const spacer = document.createElement('div');
        spacer.style.height = '8px';
        codeArea.appendChild(spacer);
        typingState.lineIdx++;
        typingState.charIdx = 0;
        renderProgress();
        typingState.timerId = setTimeout(typeNextStep, 50 / typingState.speed);
        return;
      }

      // Starting new line
      let lineDiv = codeArea.children[typingState.lineIdx];
      if (!lineDiv) {
        lineDiv = document.createElement('div');
        lineDiv.className = 'live-line';
        if (item.text.startsWith('#')) lineDiv.className += ' c-comment';
        codeArea.appendChild(lineDiv);
      }

      // Add character
      const fullText = item.text;
      const currentSub = fullText.substring(0, typingState.charIdx + 1);

      // Preserve leading indentation whitespace
      const matchLeading = currentSub.match(/^(\s*)/);
      const leadingCount = matchLeading ? matchLeading[0].length : 0;
      const indentHtml = '&nbsp;'.repeat(leadingCount);
      const textAfterIndent = currentSub.substring(leadingCount);

      lineDiv.innerHTML = `${indentHtml}${escapeHtmlText(textAfterIndent)}<span class="typing-cursor"></span>`;

      // Auto-scroll downward to follow the typing caret
      codeArea.scrollTop = codeArea.scrollHeight;

      typingState.charIdx++;

      if (typingState.charIdx >= fullText.length) {
        // Line finished typing: swap in vibrant Apple syntax-highlighted HTML
        lineDiv.innerHTML = item.html;
        typingState.lineIdx++;
        typingState.charIdx = 0;
        renderProgress();

        // Brief natural pause at line end
        const linePause = (item.text.startsWith('#') ? 130 : 90) / typingState.speed;
        typingState.timerId = setTimeout(typeNextStep, linePause);
      } else {
        // Human-like natural typing cadence (15-30ms)
        const baseCharDelay = (14 + Math.random() * 14) / typingState.speed;
        typingState.timerId = setTimeout(typeNextStep, baseCharDelay);
      }
    }

    function escapeHtmlText(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Bind Controls
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (!typingState.isRunning && typingState.lineIdx >= ottYamlScript.length) {
          resetAndStart();
        } else if (typingState.isPaused) {
          typingState.isPaused = false;
          toggleBtn.textContent = '❚❚ 정지';
          updateBadge('typing');
          typeNextStep();
        } else {
          typingState.isPaused = true;
          toggleBtn.textContent = '▶ 재생';
          updateBadge('paused');
        }
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        resetAndStart();
      });
    }

    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        if (typingState.speed === 1) {
          typingState.speed = 2;
          speedBtn.textContent = '2x';
        } else if (typingState.speed === 2) {
          typingState.speed = 3;
          speedBtn.textContent = '3x';
        } else {
          typingState.speed = 1;
          speedBtn.textContent = '1x';
        }
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        renderAllInstantly();
      });
    }

    // Slide change handler
    window.handleSlideTyping = function (slideIndex) {
      if (slideIndex === 3) { // Slide 03: STEP 3-A
        if (!typingState.hasAutoStarted) {
          typingState.hasAutoStarted = true;
          resetAndStart();
        } else if (typingState.isPaused) {
          typingState.isPaused = false;
          if (toggleBtn) toggleBtn.textContent = '❚❚ 정지';
          updateBadge('typing');
          typeNextStep();
        }
      } else {
        if (typingState.isRunning && !typingState.isPaused) {
          typingState.isPaused = true;
          if (toggleBtn) toggleBtn.textContent = '▶ 재생';
          updateBadge('paused');
        }
      }
    };
  }

  function initShowcaseSlider() {
    const slider = document.getElementById('apple-showcase-slider');
    const prevBtn = document.getElementById('btn-showcase-prev');
    const nextBtn = document.getElementById('btn-showcase-next');
    if (!slider) return;

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        slider.scrollBy({ left: -390, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        slider.scrollBy({ left: 390, behavior: 'smooth' });
      });
    }

    // Support horizontal mouse-wheel scrolling
    slider.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
      }
    }, { passive: false });
  }

  
  /* ========================================================================
     Splash Badge Rolling Focus (轮流滚动标重点)
     Cyclic highlight across all 6 technical stack badges with pause on hover
     ======================================================================== */
  let splashBadgeTimer = null;
  let currentBadgeIndex = 0;

  function initSplashBadgeRolling() {
    const badgeRow = document.getElementById('splash-badge-row');
    if (!badgeRow) return;

    const badges = Array.from(badgeRow.querySelectorAll('.splash-badge'));
    if (!badges || badges.length === 0) return;

    const initialHighlight = badges.findIndex(b => b.classList.contains('highlight'));
    currentBadgeIndex = initialHighlight >= 0 ? initialHighlight : 0;

    function applyHighlight(index) {
      badges.forEach((b, idx) => {
        if (idx === index) {
          b.classList.add('highlight', 'rolling-active');
        } else {
          b.classList.remove('highlight', 'rolling-active');
        }
      });
      currentBadgeIndex = index;
    }

    function stepNextBadge() {
      const nextIdx = (currentBadgeIndex + 1) % badges.length;
      applyHighlight(nextIdx);
    }

    function startTimer() {
      if (splashBadgeTimer) clearInterval(splashBadgeTimer);
      splashBadgeTimer = setInterval(stepNextBadge, 1800);
    }

    function stopTimer() {
      if (splashBadgeTimer) {
        clearInterval(splashBadgeTimer);
        splashBadgeTimer = null;
      }
    }

    startTimer();

    badges.forEach((badge, idx) => {
      badge.addEventListener('mouseenter', () => {
        stopTimer();
        applyHighlight(idx);
      });
      badge.addEventListener('mouseleave', () => {
        startTimer();
      });
      badge.addEventListener('click', () => {
        applyHighlight(idx);
      });
    });

    window.splashBadgeController = {
      start: startTimer,
      stop: stopTimer,
      setIndex: applyHighlight
    };
  }

  /* ========================================================================
     ThingsBook QA Integrated All-in-One Hub Navigation & ScrollSpy
     Fused single-scroll system with sticky shelf & single tab GNB
     ======================================================================== */
  const integratedSections = [
    { id: 'sec-setup', title: '01. 실기기 세팅 · iPhone 12 & Mac', shelfIdx: 0, slideIdx: 1 },
    { id: 'sec-inspect', title: '02. 요소 탐색 · Appium & XML/ID', shelfIdx: 1, slideIdx: 2 },
    { id: 'sec-yaml', title: '03. 수동 코딩 · YAML & 화면 매핑', shelfIdx: 2, slideIdx: 3 },
    { id: 'sec-aita', title: '04. AITA & AI · 아키텍처 & 방어 룰', shelfIdx: 3, slideIdx: 4 },
    { id: 'sec-batch', title: '05. 배치 실행 · 사전 검증 & E2E 파이프라인', shelfIdx: 4, slideIdx: 5 },
    { id: 'sec-results', title: '06. 실행 결과 · 240건 자동 완주', shelfIdx: 5, slideIdx: 6 },
    { id: 'sec-compare', title: '07. 도입 전후 비교 · 수동 vs 자동화', shelfIdx: 6, slideIdx: 7 },
    { id: 'sec-summary', title: '08. 총결 및 로드맵 · 성과 & 확장 계획', shelfIdx: 7, slideIdx: 8 }
  ];

  /* ========================================================================
     ThingsBook QA Pure Category Tab Panel System
     (한 카테고리 탭 선택 시 해당 카테고리 내용만 단독 노출)
     ======================================================================== */
  let currentCategoryIdx = 0;

  window.showCategoryTab = function (target) {
    let targetIdx = -1;
    if (typeof target === 'number') {
      targetIdx = Math.max(0, Math.min(target, integratedSections.length - 1));
    } else if (typeof target === 'string') {
      targetIdx = integratedSections.findIndex(s => s.id === target);
    }

    if (targetIdx === -1) targetIdx = 0;
    currentCategoryIdx = targetIdx;
    const activeData = integratedSections[targetIdx];

    // Note: Do not auto-close splash on tab setup to keep Overview splash default on page entry

    // 1. Hide all sections and show ONLY active section
    const allSections = document.querySelectorAll('.integrated-section');
    allSections.forEach(sec => {
      sec.classList.remove('active');
      sec.style.display = 'none';
    });

    const activeEl = document.getElementById(activeData.id);
    if (activeEl) {
      activeEl.style.display = 'block';
      requestAnimationFrame(() => {
        activeEl.classList.add('active');
      });
    }

    // 2. Update shelf highlight
    const shelfItems = document.querySelectorAll('.shelf-item');
    shelfItems.forEach((item, idx) => {
      const isMatch = (idx === activeData.shelfIdx) || (item.getAttribute('data-target') === activeData.id);
      item.classList.toggle('active', isMatch);
      if (isMatch) {
        try {
          item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } catch (_) {}
      }
    });

    // 3. Update top GNB single pill indicator
    const pillTitle = document.getElementById('nav-pill-title');
    if (pillTitle && pillTitle.textContent !== activeData.title) {
      pillTitle.style.opacity = '0';
      pillTitle.style.transform = 'translateY(-3px)';
      setTimeout(() => {
        pillTitle.textContent = activeData.title;
        pillTitle.style.opacity = '1';
        pillTitle.style.transform = 'translateY(0)';
      }, 120);
    }

    // 3-B. Update full-screen floating pill indicator
    const fsPillTitle = document.getElementById('fs-pill-tab-name');
    if (fsPillTitle) {
      fsPillTitle.textContent = activeData.title;
    }

    // 4. Update bottom slide counter & progress fill
    const counter = document.getElementById('slide-counter');
    if (counter) {
      counter.textContent = `${String(targetIdx + 1).padStart(2, '0')} / ${String(integratedSections.length).padStart(2, '0')}`;
    }

    const progress = document.getElementById('progress-fill');
    if (progress) {
      const pct = ((targetIdx + 1) / integratedSections.length) * 100;
      progress.style.width = `${pct}%`;
    }

    // 5. Scroll container cleanly to top of view
    const mainSlide = document.getElementById('integrated-main-slide') || document.querySelector('.slide.active');
    if (mainSlide) {
      mainSlide.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Aliases for compatibility
  window.jumpToSection = window.showCategoryTab;
  window.jumpToCurrentActiveSection = function () {
    window.showCategoryTab(currentCategoryIdx);
  };
  window.jumpToTop = function () {
    document.body.classList.remove('content-fullscreen-active');
    const mainSlide = document.getElementById('integrated-main-slide') || document.querySelector('.slide.active');
    if (mainSlide) {
      mainSlide.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function initCategoryTabs() {
    const mainSlide = document.getElementById('integrated-main-slide') || document.querySelector('.slide.active');
    const shelfContainer = document.getElementById('apple-shelf-nav') || document.querySelector('.apple-shelf');
    const backToTopBtn = document.getElementById('floating-back-to-top');

    // Horizontal wheel scroll for shelf bar
    if (shelfContainer) {
      shelfContainer.addEventListener('wheel', (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          shelfContainer.scrollLeft += e.deltaY;
        }
      }, { passive: false });
    }

    // Scroll observer on mainSlide for Full Screen Mode & Floating Back-to-Top button (Throttled with rAF)
    let isScrollTicking = false;
    const handleContentScroll = () => {
      if (!isScrollTicking) {
        window.requestAnimationFrame(() => {
          const st = mainSlide ? mainSlide.scrollTop : (window.pageYOffset || document.documentElement.scrollTop);

          // Trigger full-screen mode when scrolling past header into content area (> 80px)
          if (st > 80) {
            if (!document.body.classList.contains('content-fullscreen-active')) {
              document.body.classList.add('content-fullscreen-active');
            }
            if (backToTopBtn && !backToTopBtn.classList.contains('visible')) {
              backToTopBtn.classList.add('visible');
            }
          } else if (st <= 40) {
            if (document.body.classList.contains('content-fullscreen-active')) {
              document.body.classList.remove('content-fullscreen-active');
            }
            if (backToTopBtn && backToTopBtn.classList.contains('visible')) {
              backToTopBtn.classList.remove('visible');
            }
          }
          isScrollTicking = false;
        });
        isScrollTicking = true;
      }
    };

    if (mainSlide) {
      mainSlide.addEventListener('scroll', handleContentScroll, { passive: true });
    }
    window.addEventListener('scroll', handleContentScroll, { passive: true });

    // Initialize with first tab
    window.showCategoryTab(0);
  }

  document.addEventListener('DOMContentLoaded', init);
})();


  /* ========================================================================
     APPLE HERO SPLASH (3-PAGE SCROLL SYSTEM: 01 개요, 02 영상, 03 TestRail)
     ======================================================================== */
  window.scrollToSplashPage = function (pageNum) {
    const splash = document.getElementById('apple-hero-splash');
    const page = document.getElementById('splash-page-' + pageNum);
    if (!splash || !page) return;

    page.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const tab1 = document.getElementById('splash-nav-p1');
    const tab2 = document.getElementById('splash-nav-p2');
    const tab3 = document.getElementById('splash-nav-p3');
    const tab4 = document.getElementById('splash-nav-p4');
    if (tab1) tab1.classList.toggle('active', pageNum === 1);
    if (tab2) tab2.classList.toggle('active', pageNum === 2);
    if (tab3) tab3.classList.toggle('active', pageNum === 3);
    if (tab4) tab4.classList.toggle('active', pageNum === 4);

    const splashTopBtn = document.getElementById('splash-floating-back-to-top');
    if (splashTopBtn) {
      if (pageNum === 1) splashTopBtn.classList.remove('visible');
      else splashTopBtn.classList.add('visible');
    }

    const vi = document.getElementById('splash-video-ide');
    const vp = document.getElementById('splash-video-phone');
    if (vi) { vi.muted = true; vi.loop = true; }
    if (vp) { vp.muted = true; vp.loop = true; }

    if (pageNum === 2) {
      if (vi && vi.paused) vi.play().catch(() => {});
      if (vp && vp.paused) vp.play().catch(() => {});
    }
  };

  window.toggleSplashVideo = function (type) {
    const vidId = type === 'ide' ? 'splash-video-ide' : 'splash-video-phone';
    const btnId = type === 'ide' ? 'splash-play-ide' : 'splash-play-phone';
    const v = document.getElementById(vidId);
    const btn = document.getElementById(btnId);
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      if (btn) btn.textContent = '⏸';
    } else {
      v.pause();
      if (btn) btn.textContent = '▶';
    }
  };

  window.toggleSplashMute = function (type) {
    const vidId = type === 'ide' ? 'splash-video-ide' : 'splash-video-phone';
    const btnId = type === 'ide' ? 'splash-mute-ide' : 'splash-mute-phone';
    const v = document.getElementById(vidId);
    const btn = document.getElementById(btnId);
    if (!v) return;
    v.muted = !v.muted;
    if (btn) btn.textContent = v.muted ? '🔇' : '🔊';
  };

  window.expandSplashVideo = function (type) {
    const vidId = type === 'ide' ? 'splash-video-ide' : 'splash-video-phone';
    if (typeof window.openVideoInLightbox === 'function') {
      window.openVideoInLightbox(vidId);
    }
  };

  window.openHeroSplash = function () {
    if (window.splashBadgeController) window.splashBadgeController.start();
    const splash = document.getElementById('apple-hero-splash');
    if (!splash) return;
    splash.classList.remove('closed', 'closing');
    splash.classList.add('active');
    splash.scrollTop = 0;
    const tab1 = document.getElementById('splash-nav-p1');
    const tab2 = document.getElementById('splash-nav-p2');
    const tab3 = document.getElementById('splash-nav-p3');
    const tab4 = document.getElementById('splash-nav-p4');
    if (tab1) tab1.classList.add('active');
    if (tab2) tab2.classList.remove('active');
    if (tab3) tab3.classList.remove('active');
    if (tab4) tab4.classList.remove('active');

    const splashTopBtn = document.getElementById('splash-floating-back-to-top');
    if (splashTopBtn) splashTopBtn.classList.remove('visible');

    const vp = document.getElementById('splash-video-phone');
    const vi = document.getElementById('splash-video-ide');
    if (vp) { vp.loop = true; vp.muted = true; vp.currentTime = 0; vp.play().catch(() => {}); }
    if (vi) { vi.loop = true; vi.muted = true; vi.currentTime = 0; vi.play().catch(() => {}); }
    setTimeout(syncSplashDeviceHeights, 50);
  };

  // Symmetrically sync Splash Page 2 MacBook IDE and iPhone Heights
  function syncSplashDeviceHeights() {
    const macbookWrap = document.querySelector('.macbook-device-wrap');
    const iphoneFrame = document.querySelector('.splash-phone-card .splash-iphone-frame');
    if (!macbookWrap || !iphoneFrame) return;

    if (window.innerWidth <= 980) {
      iphoneFrame.style.height = '';
      iphoneFrame.style.width = '';
      return;
    }

    const h = macbookWrap.offsetHeight;
    if (h > 200) {
      iphoneFrame.style.height = h + 'px';
      // Proportional width preserving iPhone display ratio with 12px bezel
      const w = Math.round((h - 24) * (390 / 844) + 24);
      iphoneFrame.style.width = w + 'px';
    }
  }

  window.syncSplashDeviceHeights = syncSplashDeviceHeights;
  window.addEventListener('resize', syncSplashDeviceHeights);
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(syncSplashDeviceHeights);
    const mb = document.querySelector('.macbook-device-wrap');
    if (mb) ro.observe(mb);
  }
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(syncSplashDeviceHeights, 150);
  });

  window.closeHeroSplash = function () {
    const splash = document.getElementById('apple-hero-splash');
    if (!splash) return;
    splash.classList.add('closing');
    const vp = document.getElementById('splash-video-phone');
    const vi = document.getElementById('splash-video-ide');
    if (vp) vp.pause();
    if (vi) vi.pause();
    setTimeout(() => {
      splash.classList.remove('active', 'closing');
      if (window.splashBadgeController) window.splashBadgeController.stop();
      splash.classList.add('closed');
      goToSlide(0);
    }, 400);
  };

  /* ========================================================================
     SLIDE 02: PIN VIEW vs REAL VIDEO TOGGLE
     ======================================================================== */
  window.setSlide2Mode = function (mode) {
    const btnPins = document.getElementById('s2-btn-pins');
    const btnVideo = document.getElementById('s2-btn-video');
    const img = document.getElementById('slide2-capture-img');
    const overlay = document.getElementById('sim-overlay-layer');
    const video = document.getElementById('slide2-iphone-video');
    const playBtn = document.getElementById('s2-play-btn');
    const muteBtn = document.getElementById('s2-mute-btn');
    const caption = document.getElementById('slide2-caption-text');

    if (mode === 'video') {
      if (btnPins) btnPins.classList.remove('active');
      if (btnVideo) btnVideo.classList.add('active');
      if (img) img.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
      if (video) {
        video.style.display = 'block';
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      if (playBtn) { playBtn.style.display = 'inline-block'; playBtn.textContent = '⏸ 일시정지'; }
      if (muteBtn) { muteBtn.style.display = 'inline-block'; muteBtn.textContent = '🔊 음소거'; }
      if (caption) caption.innerHTML = '▲ <strong>Real iPhone 12 Pro</strong> · Test_03_iOS_Suite_006_OTT.yaml 실제 구동 영상 (45초)';
    } else {
      if (btnVideo) btnVideo.classList.remove('active');
      if (btnPins) btnPins.classList.add('active');
      if (video) { video.pause(); video.style.display = 'none'; }
      if (img) img.style.display = 'block';
      if (overlay) overlay.style.display = 'block';
      if (playBtn) playBtn.style.display = 'none';
      if (muteBtn) muteBtn.style.display = 'none';
      if (caption) caption.innerHTML = '▲ <strong>The Shawshank Redemption 글 End</strong> 실기기 캡처 — 번호(1~7) 클릭 시 요소 하이라이트';
    }
  };

  window.toggleSlide2Video = function () {
    const v = document.getElementById('slide2-iphone-video');
    const btn = document.getElementById('s2-play-btn');
    if (!v) return;
    if (v.paused) {
      v.play();
      if (btn) btn.textContent = '⏸ 일시정지';
    } else {
      v.pause();
      if (btn) btn.textContent = '▶ 재생';
    }
  };

  window.toggleSlide2Mute = function () {
    const v = document.getElementById('slide2-iphone-video');
    const btn = document.getElementById('s2-mute-btn');
    if (!v) return;
    v.muted = !v.muted;
    if (btn) btn.textContent = v.muted ? '🔊 소리켜기' : '🔇 음소거';
  };

  window.openSlide2InLightbox = function () {
    const btnVideo = document.getElementById('s2-btn-video');
    const isVideoMode = btnVideo && btnVideo.classList.contains('active');
    if (isVideoMode) {
      openVideoInLightbox('slide2-iphone-video');
    } else {
      const img = document.getElementById('slide2-capture-img');
      if (img) openImageInLightbox(img.src);
    }
  };

  /* ========================================================================
     SLIDE 05: DUAL RUNNER (IPHONE vs IDE) CONTROLS
     ======================================================================== */
  window.switchSlide5Mode = function (mode) {
    const btnPhone = document.getElementById('btn-run-iphone');
    const btnIde = document.getElementById('btn-run-ide');
    const boxPhone = document.getElementById('slide5-iphone-container');
    const boxIde = document.getElementById('slide5-ide-container');
    const vPhone = document.getElementById('slide5-iphone-video');
    const vIde = document.getElementById('slide5-ide-video');

    if (mode === 'ide') {
      if (btnPhone) btnPhone.classList.remove('active');
      if (btnIde) btnIde.classList.add('active');
      if (boxPhone) boxPhone.style.display = 'none';
      if (boxIde) boxIde.style.display = 'flex';
      if (vPhone) vPhone.pause();
      if (vIde) { vIde.currentTime = 0; vIde.play().catch(() => {}); }
      const playBtn = document.getElementById('s5-play-btn-ide');
      if (playBtn) playBtn.textContent = '⏸ 일시정지';
    } else {
      if (btnIde) btnIde.classList.remove('active');
      if (btnPhone) btnPhone.classList.add('active');
      if (boxIde) boxIde.style.display = 'none';
      if (boxPhone) boxPhone.style.display = 'block';
      if (vIde) vIde.pause();
      if (vPhone) { vPhone.play().catch(() => {}); }
      const playBtn = document.getElementById('s5-play-btn-iphone');
      if (playBtn) playBtn.textContent = '⏸ 일시정지';
    }
  };

  window.toggleSlide5Video = function (target) {
    const v = document.getElementById(target === 'ide' ? 'slide5-ide-video' : 'slide5-iphone-video');
    const btn = document.getElementById(target === 'ide' ? 's5-play-btn-ide' : 's5-play-btn-iphone');
    if (!v) return;
    if (v.paused) {
      v.play();
      if (btn) btn.textContent = '⏸ 일시정지';
    } else {
      v.pause();
      if (btn) btn.textContent = '▶ 재생';
    }
  };

  window.toggleSlide5Mute = function (target) {
    const v = document.getElementById(target === 'ide' ? 'slide5-ide-video' : 'slide5-iphone-video');
    const btn = document.getElementById(target === 'ide' ? 's5-mute-btn-ide' : 's5-mute-btn-iphone');
    if (!v) return;
    v.muted = !v.muted;
    if (btn) btn.textContent = v.muted ? '🔊 소리켜기' : '🔇 음소거';
  };

  window.restartSlide5Video = function (target) {
    const v = document.getElementById(target === 'ide' ? 'slide5-ide-video' : 'slide5-iphone-video');
    const btn = document.getElementById(target === 'ide' ? 's5-play-btn-ide' : 's5-play-btn-iphone');
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
    if (btn) btn.textContent = '⏸ 일시정지';
  };

  /* ========================================================================
     UNIVERSAL LIGHTBOX HELPERS FOR VIDEO & IMAGE
     ======================================================================== */
  window.openVideoInLightbox = function (target) {
    const modal = document.getElementById('lightbox-modal');
    const body = document.getElementById('lightbox-body');
    if (!modal || !body) return;

    let src = '';
    if (typeof target === 'string') {
      const el = document.getElementById(target);
      if (el && el.src) {
        src = el.src;
      } else {
        src = target;
      }
    } else if (target && target.src) {
      src = target.src;
    }
    if (!src) return;

    body.innerHTML = '';
    const v = document.createElement('video');
    v.src = src;
    v.autoplay = true;
    v.loop = true;
    v.controls = true;
    v.style.maxWidth = '90vw';
    v.style.maxHeight = '84vh';
    v.style.borderRadius = '16px';
    v.style.boxShadow = '0 24px 80px rgba(0, 0, 0, 0.7)';
    v.style.background = '#000';
    body.appendChild(v);
    modal.classList.add('open');
  };

  /* ==========================================================================
     TestRail Results Two-Image Showcase & Carousel Logic
     ========================================================================== */
  window.currentTestRailSlide = 1;

  window.switchTestRailSlide = function (slideNum, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    window.currentTestRailSlide = slideNum;

    const slide1 = document.getElementById('testrail-slide-1');
    const slide2 = document.getElementById('testrail-slide-2');
    const tab1 = document.getElementById('tr-view-tab-1');
    const tab2 = document.getElementById('tr-view-tab-2');
    const dot1 = document.getElementById('tr-dot-1');
    const dot2 = document.getElementById('tr-dot-2');
    const hintNum = document.getElementById('tr-hint-num');
    const urlText = document.getElementById('testrail-url-text');

    if (slideNum === 1) {
      if (slide1) slide1.classList.add('active');
      if (slide2) slide2.classList.remove('active');
      if (tab1) { tab1.classList.add('active'); tab1.setAttribute('aria-selected', 'true'); }
      if (tab2) { tab2.classList.remove('active'); tab2.setAttribute('aria-selected', 'false'); }
      if (dot1) dot1.classList.add('active');
      if (dot2) dot2.classList.remove('active');
      if (hintNum) hintNum.textContent = '1/2';
      if (urlText) urlText.textContent = 'https://testrail.thingsbook.internal/index.php?/runs/view/1204';
    } else {
      if (slide1) slide1.classList.remove('active');
      if (slide2) slide2.classList.add('active');
      if (tab1) { tab1.classList.remove('active'); tab1.setAttribute('aria-selected', 'false'); }
      if (tab2) { tab2.classList.add('active'); tab2.setAttribute('aria-selected', 'true'); }
      if (dot1) dot1.classList.remove('active');
      if (dot2) dot2.classList.add('active');
      if (hintNum) hintNum.textContent = '2/2';
      if (urlText) urlText.textContent = 'https://testrail.thingsbook.internal/index.php?/runs/view/1204&group_by=cases';
    }
  };

  window.prevTestRailSlide = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const next = window.currentTestRailSlide === 1 ? 2 : 1;
    window.switchTestRailSlide(next, e);
  };

  window.nextTestRailSlide = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const next = window.currentTestRailSlide === 1 ? 2 : 1;
    window.switchTestRailSlide(next, e);
  };

  window.openCurrentTestRailLightbox = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const src = window.currentTestRailSlide === 1
      ? './media/sample_testrail_homepage1.png'
      : './media/sample_testrail_homepage2.png';
    window.openImageInLightbox(src, true);
  };

  window.handleTestRailImageClick = function (e) {
    // If clicked on navigation buttons or indicator dots, do not trigger lightbox
    if (e.target.closest('.testrail-carousel-btn') || e.target.closest('.testrail-slider-dots') || e.target.closest('.testrail-view-switch')) {
      return;
    }
    window.openCurrentTestRailLightbox(e);
  };

  window.openImageInLightbox = function (src, isTestRail = false) {
    const modal = document.getElementById('lightbox-modal');
    const body = document.getElementById('lightbox-body');
    if (!modal || !body) return;
    body.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'lightbox-img-container';

    const img = document.createElement('img');
    img.id = 'lightbox-active-img';
    img.src = src;
    img.style.maxWidth = '90vw';
    img.style.maxHeight = '84vh';
    img.style.borderRadius = '16px';
    img.style.boxShadow = '0 24px 80px rgba(0, 0, 0, 0.7)';
    container.appendChild(img);

    const isTr = isTestRail || src.includes('sample_testrail');
    if (isTr) {
      // Prev Button
      const prevBtn = document.createElement('button');
      prevBtn.className = 'lightbox-nav-btn prev';
      prevBtn.innerHTML = '‹';
      prevBtn.title = '이전 사진 (1번)';
      prevBtn.onclick = function (e) {
        e.stopPropagation();
        const nextSlide = window.currentTestRailSlide === 1 ? 2 : 1;
        window.switchTestRailSlide(nextSlide);
        img.src = nextSlide === 1
          ? './media/sample_testrail_homepage1.png'
          : './media/sample_testrail_homepage2.png';
        if (pill) pill.textContent = nextSlide === 1 ? '1 / 2 전체 Suite 요약' : '2 / 2 상세 케이스 로그';
      };

      // Next Button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'lightbox-nav-btn next';
      nextBtn.innerHTML = '›';
      nextBtn.title = '다음 사진 (2번)';
      nextBtn.onclick = function (e) {
        e.stopPropagation();
        const nextSlide = window.currentTestRailSlide === 1 ? 2 : 1;
        window.switchTestRailSlide(nextSlide);
        img.src = nextSlide === 1
          ? './media/sample_testrail_homepage1.png'
          : './media/sample_testrail_homepage2.png';
        if (pill) pill.textContent = nextSlide === 1 ? '1 / 2 전체 Suite 요약' : '2 / 2 상세 케이스 로그';
      };

      // Indicator Pill
      const pill = document.createElement('div');
      pill.className = 'lightbox-slide-pill';
      pill.textContent = window.currentTestRailSlide === 1 ? '1 / 2 전체 Suite 요약' : '2 / 2 상세 케이스 로그';

      container.appendChild(prevBtn);
      container.appendChild(nextBtn);
      container.appendChild(pill);
    }

    body.appendChild(container);
    modal.classList.add('open');
  };

  /* Universal Image Lightbox with optional title caption */
  window.openImageLightbox = function (src, title) {
    const modal = document.getElementById('lightbox-modal');
    const body = document.getElementById('lightbox-body');
    if (!modal || !body) return;
    body.innerHTML = '';

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.maxWidth = '95vw';

    if (title) {
      const header = document.createElement('div');
      header.style.color = '#ffffff';
      header.style.fontSize = '14px';
      header.style.fontWeight = '600';
      header.style.marginBottom = '12px';
      header.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Apple SD Gothic Neo', sans-serif";
      header.innerHTML = '<span style="color:#0a84ff;">✦ 원본 고해상도 확대:</span> ' + title;
      container.appendChild(header);
    }

    const img = document.createElement('img');
    img.id = 'lightbox-active-img';
    img.src = src;
    img.alt = title || 'Expanded Image';
    img.style.maxWidth = '92vw';
    img.style.maxHeight = '82vh';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '16px';
    img.style.boxShadow = '0 24px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.1)';
    container.appendChild(img);

    body.appendChild(container);
    modal.classList.add('open');
  };


  /* ==========================================================================
     Apple Comparison Showcase Interactive Controls & Keynote Transition FX
     ========================================================================== */
  let currentAppleCompareMode = 'manual';
  let isCompareTransitioning = false;

  /* Animated number counter helper with smooth cubic-bezier easing */
  function animateNumberValue(el, start, end, duration, suffix = '', decimals = 0) {
    if (!el) return;
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current)) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = (decimals > 0 ? end.toFixed(decimals) : Math.round(end)) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  /* Animated time label helper */
  function animateTimeMorph(el, fromText, toText) {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(-3px)';
    setTimeout(() => {
      el.textContent = toText;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 150);
  }

  /* Toggle Apple Compare Dropdown Popover */
  window.toggleAppleCompareMenu = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const popover = document.getElementById('apple-compare-popover');
    const pill = document.getElementById('apple-compare-select-pill');
    if (!popover || !pill) return;
    const isShowing = popover.classList.contains('show');
    if (isShowing) {
      window.closeAppleCompareMenu();
    } else {
      popover.classList.add('show');
      pill.classList.add('active');
    }
  };

  /* Close Apple Compare Dropdown Popover */
  window.closeAppleCompareMenu = function () {
    const popover = document.getElementById('apple-compare-popover');
    const pill = document.getElementById('apple-compare-select-pill');
    if (popover) popover.classList.remove('show');
    if (pill) pill.classList.remove('active');
  };

  /* Individual Tile DOM Updates */
  function updateTile1DOM(mode) {
    const t1Top = document.getElementById('tile1-top');
    const t1Radial = document.getElementById('tile1-radial-fill');
    const t1Val = document.getElementById('tile1-val');
    const t1Sub = document.getElementById('tile1-sub');
    const t1Badge = document.getElementById('tile1-badge');
    const t1Headline = document.getElementById('tile1-headline');

    if (mode === 'auto') {
      if (t1Top) t1Top.innerHTML = '<span class="compare-tag-old">수동 284개 전수</span> ➔ <span class="compare-tag-new">230개 전수 자동화 달성 (물리 단말 제외)</span>';
      if (t1Radial) {
        t1Radial.style.stroke = '#30d158';
        t1Radial.style.strokeDashoffset = '52.56'; // 81% fill (230/284)
      }
      const metricWrap1 = document.querySelector('#bento-tile-1 .apple-radial-metric');
      if (metricWrap1) metricWrap1.classList.add('breathing-glow');
      if (t1Val) {
        t1Val.style.color = '#ffffff';
        animateNumberValue(t1Val, 0, 81, 650, '%', 0);
      }
      if (t1Sub) {
        t1Sub.textContent = 'COVERAGE';
        t1Sub.style.color = '#30d158';
      }
      if (t1Badge) t1Badge.innerHTML = '<span class="auto-delta-badge">⚡ 230개 전수 자동화 구축 달성</span>';
      if (t1Headline) t1Headline.innerHTML = '<span class="old-struck">수기 284개 클릭</span> ➔ 전체 284개 중 230개 자동화 (81%)';
    } else {
      if (t1Top) t1Top.textContent = '기존 수동 리그레션 검증 방식';
      if (t1Radial) {
        t1Radial.style.stroke = '#ff9f0a';
        t1Radial.style.strokeDashoffset = '276.46'; // 0%
      }
      const metricWrap1 = document.querySelector('#bento-tile-1 .apple-radial-metric');
      if (metricWrap1) metricWrap1.classList.remove('breathing-glow');
      if (t1Val) {
        t1Val.style.color = '#ff9f0a';
        animateNumberValue(t1Val, 81, 0, 450, '%', 0);
      }
      if (t1Sub) {
        t1Sub.textContent = 'MANUAL';
        t1Sub.style.color = '#86868b';
      }
      if (t1Badge) t1Badge.innerHTML = '<span class="manual-center-badge">수기 284개 TC 전수 점검</span>';
      if (t1Headline) t1Headline.textContent = '전체 284개 TC 일일이 수기 클릭';
    }
  }

  function updateTile2DOM(mode) {
    const t2Top = document.getElementById('tile2-top');
    const t2ManualView = document.getElementById('tile2-manual-view');
    const t2AutoView = document.getElementById('tile2-auto-view');
    const t2Badge = document.getElementById('tile2-badge');
    const t2Headline = document.getElementById('tile2-headline');

    if (mode === 'auto') {
      if (t2Top) t2Top.innerHTML = '<span class="compare-tag-old">수동 8시간+ 소요</span> ➔ <span class="compare-tag-new">최대 2시간 완주</span>';
      if (t2ManualView) t2ManualView.style.display = 'none';
      if (t2AutoView) t2AutoView.style.display = 'flex';
      if (t2Badge) t2Badge.innerHTML = '<span class="auto-delta-badge">⚡ 75% 시간 절감 (6시간 세이브)</span>';
      if (t2Headline) t2Headline.innerHTML = '<span class="old-struck">8시간+ 전일 소요</span> ➔ 단 2시간 전수 완주';
    } else {
      if (t2Top) t2Top.textContent = '기존 수동 검증 소요 시간';
      if (t2ManualView) t2ManualView.style.display = 'flex';
      if (t2AutoView) t2AutoView.style.display = 'none';
      if (t2Badge) t2Badge.innerHTML = '<span class="manual-center-badge warn">1인 전일(Full-Day) 소요</span>';
      if (t2Headline) t2Headline.textContent = '최소 8시간 이상 전일 수기 검증';
    }
  }

  function updateTile3DOM(mode) {
    const t3Top = document.getElementById('tile3-top');
    const t3ManualView = document.getElementById('tile3-manual-view');
    const t3AutoView = document.getElementById('tile3-auto-view');
    const t3Badge = document.getElementById('tile3-badge');
    const t3Headline = document.getElementById('tile3-headline');

    if (mode === 'auto') {
      if (t3Top) t3Top.innerHTML = '<span class="compare-tag-old">반복 검증에 고갈</span> ➔ <span class="compare-tag-new">고부가가치 창의적 테스팅으로 전환</span>';
      if (t3ManualView) t3ManualView.style.display = 'none';
      if (t3AutoView) t3AutoView.style.display = 'flex';
      if (t3Badge) t3Badge.innerHTML = '<span class="auto-delta-badge">🌟 고부가가치 품질 고도화</span>';
      if (t3Headline) t3Headline.innerHTML = '<span class="old-struck">단순 반복 업무</span> ➔ 탐색적·경험 기반 테스팅 집중';
    } else {
      if (t3Top) t3Top.textContent = '반복 테스트에 고갈';
      if (t3ManualView) t3ManualView.style.display = 'flex';
      if (t3AutoView) t3AutoView.style.display = 'none';
      if (t3Badge) t3Badge.innerHTML = '<span class="manual-center-badge warn">단순 반복 클릭에 번아웃</span>';
      if (t3Headline) t3Headline.textContent = '단순 반복 테스트로 테스터 에너지 소진';
    }
  }

  function updateTile4DOM(mode) {
    const t4Top = document.getElementById('tile4-top');
    const t4ManualView = document.getElementById('tile4-manual-view');
    const t4AutoView = document.getElementById('tile4-auto-view');
    const t4Badge = document.getElementById('tile4-badge');
    const t4Headline = document.getElementById('tile4-headline');

    if (mode === 'auto') {
      if (t4Top) t4Top.innerHTML = '<span class="compare-tag-old">휴먼 에러 위험</span> ➔ <span class="compare-tag-new">100% 일관된 정밀 검증 (휴먼 에러 제로)</span>';
      if (t4ManualView) t4ManualView.style.display = 'none';
      if (t4AutoView) t4AutoView.style.display = 'flex';
      if (t4Badge) t4Badge.innerHTML = '<span class="auto-delta-badge">✨ 100% 오차 없는 일관된 품질</span>';
      if (t4Headline) t4Headline.innerHTML = '<span class="old-struck">휴먼 에러 위험</span> ➔ 100% 일관된 기준으로 검증 편차 제로';
    } else {
      if (t4Top) t4Top.textContent = '휴먼 에러 & 검증 누락 위험';
      if (t4ManualView) t4ManualView.style.display = 'flex';
      if (t4AutoView) t4AutoView.style.display = 'none';
      if (t4Badge) t4Badge.innerHTML = '<span class="manual-center-badge warn">피로 누적 시 결함 누락 위험</span>';
      if (t4Headline) t4Headline.textContent = '테스터의 피로도와 주관에 따라 검증 편차 발생';
    }
  }

  function updateTile5DOM(mode) {
    const t5Top = document.getElementById('tile5-top');
    const t5ManualView = document.getElementById('tile5-manual-view');
    const t5AutoView = document.getElementById('tile5-auto-view');
    const t5Badge = document.getElementById('tile5-badge');
    const t5Headline = document.getElementById('tile5-headline');

    if (mode === 'auto') {
      if (t5Top) t5Top.innerHTML = '<span class="compare-tag-old">360시간 (45일)</span> ➔ <span class="compare-tag-new">테스트 자동화 제작 속도 가속화</span>';
      if (t5ManualView) t5ManualView.style.display = 'none';
      if (t5AutoView) t5AutoView.style.display = 'flex';
      if (t5Badge) t5Badge.innerHTML = '<span class="auto-delta-badge">⚡ 6.4배 초고속 제작 (84.4% 단축)</span>';
      if (t5Headline) t5Headline.innerHTML = '<span class="old-struck">45일(360h)</span> ➔ 56시간(7일) 만에 전 영역 구축 완료';
    } else {
      if (t5Top) t5Top.textContent = '자동화 코드 개발 필요 시간 (AI 부재 시)';
      if (t5ManualView) t5ManualView.style.display = 'flex';
      if (t5AutoView) t5AutoView.style.display = 'none';
      if (t5Badge) t5Badge.innerHTML = '<span class="manual-center-badge warn">45일 소요 (360시간 장기 개발)</span>';
      if (t5Headline) t5Headline.textContent = 'AI 없이 수작업 코딩 시 45일(360h) 소요';
    }
  }

  function updateTile6DOM(mode) {
    const t6Top = document.getElementById('tile6-top');
    const t6ManualView = document.getElementById('tile6-manual-view');
    const t6AutoView = document.getElementById('tile6-auto-view');
    const t6Badge = document.getElementById('tile6-badge');
    const t6Headline = document.getElementById('tile6-headline');

    if (mode === 'auto') {
      if (t6Top) t6Top.innerHTML = '<span class="compare-tag-old">수기 기록 1시간+</span> ➔ <span class="compare-tag-new">TestRail API 100% 양방향 실시간 동기화</span>';
      if (t6ManualView) t6ManualView.style.display = 'none';
      if (t6AutoView) t6AutoView.style.display = 'flex';
      if (t6Badge) t6Badge.innerHTML = '<span class="auto-delta-badge purple-delta">⚡ 수기 0분 · 리포트 100% 자동 완성</span>';
      if (t6Headline) t6Headline.innerHTML = '<span class="old-struck">수기 1시간+</span> ➔ TestRail API 실시간 100% 자동 동기화';
    } else {
      if (t6Top) t6Top.textContent = 'TestRail 결과 수기 기입';
      if (t6ManualView) t6ManualView.style.display = 'flex';
      if (t6AutoView) t6AutoView.style.display = 'none';
      if (t6Badge) t6Badge.innerHTML = '<span class="manual-center-badge warn">결과 누락 위험 &amp; 피로도 가중</span>';
      if (t6Headline) t6Headline.textContent = 'TestRail 284개 결과 수기 입력';
    }
  }

  window.setAppleCompareMode = function (mode, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (mode === 'basic') mode = 'auto'; // backward compatibility
    if (currentAppleCompareMode === mode && !isCompareTransitioning) {
      window.closeAppleCompareMenu();
      return;
    }
    currentAppleCompareMode = mode;
    isCompareTransitioning = true;

    // 1. Update Segmented Buttons
    const segManual = document.getElementById('seg-btn-manual');
    const segAuto = document.getElementById('seg-btn-auto');
    if (segManual && segAuto) {
      if (mode === 'auto') {
        segManual.classList.remove('active');
        segAuto.classList.add('active');
      } else {
        segAuto.classList.remove('active');
        segManual.classList.add('active');
      }
    }

    // 2. Update pill text
    const pillText = document.getElementById('apple-compare-pill-text');
    if (pillText) {
      pillText.textContent = (mode === 'auto') ? '자동화 테스트 도입 (2시간 완주)' : '기존 수동 QA (8시간+)';
    }

    // 3. Update popover active item and checkmarks
    const itemManual = document.getElementById('popover-item-manual');
    const itemAuto = document.getElementById('popover-item-auto');
    if (itemManual && itemAuto) {
      const checkManual = itemManual.querySelector('.check-icon');
      const checkAuto = itemAuto.querySelector('.check-icon');
      if (mode === 'auto') {
        itemManual.classList.remove('active');
        itemAuto.classList.add('active');
        if (checkManual) checkManual.style.display = 'none';
        if (checkAuto) checkAuto.style.display = 'block';
      } else {
        itemAuto.classList.remove('active');
        itemManual.classList.add('active');
        if (checkAuto) checkAuto.style.display = 'none';
        if (checkManual) checkManual.style.display = 'block';
      }
    }

    // 4. Trigger Laser Scanline Sweep on Grid
    const grid = document.getElementById('apple-compare-grid');
    if (grid) {
      grid.classList.toggle('mode-manual', mode === 'manual');
      grid.classList.toggle('mode-auto', mode === 'auto');
      grid.classList.toggle('mode-manual-scan', mode === 'manual');
      grid.classList.remove('scanline-sweep');
      void grid.offsetWidth; // trigger reflow
      grid.classList.add('scanline-sweep');
      setTimeout(() => grid.classList.remove('scanline-sweep'), 800);
    }

    // 5. Staggered Cascade Morph for the 6 Bento Tiles
    const tileRenders = [
      { id: 'bento-tile-1', fn: updateTile1DOM },
      { id: 'bento-tile-2', fn: updateTile2DOM },
      { id: 'bento-tile-3', fn: updateTile3DOM },
      { id: 'bento-tile-4', fn: updateTile4DOM },
      { id: 'bento-tile-5', fn: updateTile5DOM },
      { id: 'bento-tile-6', fn: updateTile6DOM },
    ];

    tileRenders.forEach((item, idx) => {
      const tile = document.getElementById(item.id);
      if (!tile) return;

      const staggerDelay = idx * 60; // 0, 60, 120, 180, 240, 300 ms

      // Phase A: Morph Out (Shrink & Blur)
      setTimeout(() => {
        tile.classList.remove('tile-morphing-in', 'tile-flash-green', 'tile-flash-orange');
        tile.classList.add('tile-morphing-out');
      }, staggerDelay);

      // Phase B: Swap Data & Morph In (Spring & Neon Flash)
      setTimeout(() => {
        item.fn(mode);
        tile.classList.remove('tile-morphing-out');
        tile.classList.add('tile-morphing-in');
        tile.classList.add(mode === 'auto' ? 'tile-flash-green' : 'tile-flash-orange');
      }, staggerDelay + 170);

      // Phase C: Settle
      setTimeout(() => {
        tile.classList.remove('tile-morphing-in', 'tile-flash-green', 'tile-flash-orange');
      }, staggerDelay + 700);
    });

    setTimeout(() => {
      isCompareTransitioning = false;
    }, 300 + 700);

    window.closeAppleCompareMenu();
  };

  /* Toggle Apple Compare Details Drawer */
  window.toggleAppleCompareDetails = function () {
    const drawer = document.getElementById('apple-compare-details-drawer');
    const toggleBtn = document.getElementById('apple-drawer-toggle-btn');
    const topBtn = document.getElementById('apple-top-compare-btn');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('show');
    if (isOpen) {
      drawer.classList.remove('show');
      if (toggleBtn) toggleBtn.classList.remove('open');
      if (topBtn) topBtn.classList.remove('active');
    } else {
      drawer.classList.add('show');
      if (toggleBtn) toggleBtn.classList.add('open');
      if (topBtn) topBtn.classList.add('active');
      setTimeout(() => {
        drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80);
    }
  };

  // Close Apple comparison popover when clicking anywhere outside
  window.addEventListener('click', function (e) {
    const popover = document.getElementById('apple-compare-popover');
    const selectorWrap = document.getElementById('apple-compare-selector-wrap');
    if (popover && popover.classList.contains('show')) {
      if (!selectorWrap || !selectorWrap.contains(e.target)) {
        window.closeAppleCompareMenu();
      }
    }
  });


  // ========================================================================
  // Detailed Comparison Carousel Navigation (6 Cards Single Page Flip)
  // ========================================================================
  window.currentCompareCardIdx = 0;
  const compareCardTitles = [
    "01. 리그레션 테스트 커버리지 (Coverage) 상세 비교",
    "02. 테스트 안정성 및 신뢰도 (AITA AI Defensive Engine) 상세 비교",
    "03. 리그레션 수행 소요 시간 (Execution Time) 상세 비교",
    "04. QA 엔지니어 리소스 및 생산성 (Resource & Productivity) 상세 비교",
    "05. 13개 도메인 전체 스코프 및 체계성 (Domain Scope) 상세 비교",
    "06. TestRail 테스트 관리 도구 연동 (TestRail Real-time Sync) 상세 비교"
  ];

  window.goToCompareCard = function (idx, e) {
    if (e && e.preventDefault) e.preventDefault();
    const total = 6;
    if (idx < 0) idx = total - 1;
    if (idx >= total) idx = 0;
    window.currentCompareCardIdx = idx;

    // 1. Toggle cards in stage
    const cards = document.querySelectorAll('.apple-detailed-stage .detailed-compare-card, .detailed-cards-stack .detailed-compare-card');
    cards.forEach((card, i) => {
      if (i === idx) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    // 2. Toggle Left GNB items (.apple-gnb-item) & bubble expansion
    const gnbItems = document.querySelectorAll('.apple-gnb-items-list .apple-gnb-item');
    gnbItems.forEach((item, i) => {
      if (i === idx) {
        item.classList.add('active');
        const badgeIcon = item.querySelector('.badge-icon');
        if (badgeIcon) badgeIcon.textContent = '✓';
      } else {
        item.classList.remove('active');
        const badgeIcon = item.querySelector('.badge-icon');
        if (badgeIcon) badgeIcon.textContent = '+';
      }
    });

    // 3. Update GNB page counter & footer page counter
    const gnbNum = document.getElementById('gnb-current-num');
    if (gnbNum) {
      gnbNum.textContent = String(idx + 1).padStart(2, '0');
    }
    const pageNumEl = document.getElementById('detailed-page-num');
    if (pageNumEl) {
      pageNumEl.textContent = String(idx + 1).padStart(2, '0');
    }

    // 4. Update title indicator
    const titleEl = document.getElementById('detailed-card-title-indicator');
    if (titleEl && compareCardTitles[idx]) {
      titleEl.textContent = compareCardTitles[idx];
    }
  };

  window.navigateCompareCard = function (direction, e) {
    if (e && e.preventDefault) e.preventDefault();
    window.goToCompareCard(window.currentCompareCardIdx + direction);
  };

  // Enhanced smoothScrollToCompareCard to support both element scrolling and card switching
  window.smoothScrollToCompareCard = function (targetId, e) {
    if (e && e.preventDefault) e.preventDefault();

    // If target is one of detail-card-1 ~ 6, switch to that card page first
    if (targetId && targetId.startsWith('detail-card-')) {
      const cardNum = parseInt(targetId.replace('detail-card-', ''), 10);
      if (!isNaN(cardNum) && cardNum >= 1 && cardNum <= 6) {
        window.goToCompareCard(cardNum - 1);
      }
    }

    let el = document.getElementById(targetId);
    if (!el || targetId.startsWith('detail-card-')) {
      el = document.getElementById('apple-detailed-comparison') || el;
    }

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.add('card-highlight-pulse');
      setTimeout(function () {
        el.classList.remove('card-highlight-pulse');
      }, 1200);
    }
  };


  /* ========================================================================
     ThingsBook QA Step Switcher & Progressive YAML Typing Engine (Category 03)
     ======================================================================== */
  const manualYamlSnippets = {
    step0: [
      "#C12253244",
      "# [OTT 글감 검색 확인]",
      "# 0. 로그인 상태로 앱 진입",
      "- launchApp:",
      "    appId: com.navercorp.article.ios"
    ],
    step1: [
      "",
      '# 1. GNB "+" Create 버튼 선택',
      '- tapOn: "tabPlus"',
      "",
      "- waitForAnimationToEnd:",
      "    timeout: 3000"
    ],
    step2: [
      "",
      '# 2. 컬렉션 리스트에서 "NamAuto_Movie" 선택 (하단 탭바 겹침 방지 스와이프)',
      "- scrollUntilVisible:",
      "    element:",
      '      text: "NamAuto_Movie"',
      "    direction: DOWN",
      "    timeout: 15000",
      "",
      "- swipe:",
      '    start: "50%, 65%"',
      '    end: "50%, 50%"',
      "",
      "- waitForAnimationToEnd:",
      "    timeout: 1500",
      "",
      "- extendedWaitUntil:",
      '    visible: "NamAuto_Movie"',
      "    timeout: 5000",
      "",
      '- tapOn: "NamAuto_Movie"',
      "",
      "- waitForAnimationToEnd:",
      "    timeout: 3000",
      "",
      "- extendedWaitUntil:",
      '    visible: "iconCollectionFold"',
      "    timeout: 15000"
    ],
    step3: [
      "",
      '# 3. 글쓰기 에디터 글감 추가 [+] 버튼 클릭',
      '- tapOn: "plus"',
      "",
      "- waitForAnimationToEnd:",
      "    timeout: 3000"
    ],
    step4: [
      "",
      '# 4. OTT 글감 검색 화면 진입 및 "The Shawshank Redemption" 검색',
      "- extendedWaitUntil:",
      '    visible: "Search movie or TV show"',
      "    timeout: 15000",
      "",
      '- inputText: "The Shawshank Redemption"',
      "",
      "- extendedWaitUntil:",
      '    visible: ".*(Reviewed|1994).*"',
      "    timeout: 15000"
    ]
  };

  const manualStepImages = {
    0: './media/sample_manual_step1.PNG',
    1: './media/sample_manual_step1.PNG',
    2: './media/sample_manual_step2.PNG',
    3: './media/sample_manual_step3.PNG',
    4: './media/sample_manual_step4.PNG'
  };

  let manualYamlCurrentStep = 0;
  let manualYamlTypingTimer = null;

  function escapeHtmlManualYaml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightYamlLineHtml(line) {
    if (line === undefined || line === null) return '';
    const trimmed = line.trim();
    if (!trimmed) return '&nbsp;';
    if (trimmed.startsWith('#')) {
      return `<span style="color: #6a9955;">${escapeHtmlManualYaml(line)}</span>`;
    }
    // Command line: - command: or - command: "value"
    const cmdMatch = line.match(/^(\s*-\s*)([a-zA-Z0-9_]+):(\s*)(.*)$/);
    if (cmdMatch) {
      const prefix = escapeHtmlManualYaml(cmdMatch[1]);
      const cmd = escapeHtmlManualYaml(cmdMatch[2]);
      const sp = escapeHtmlManualYaml(cmdMatch[3]);
      let rest = cmdMatch[4];
      let restHtml = '';
      if (rest.startsWith('"') && rest.endsWith('"')) {
        restHtml = `<span style="color: #ce9178;">${escapeHtmlManualYaml(rest)}</span>`;
      } else if (/^\d+$/.test(rest)) {
        restHtml = `<span style="color: #b5cea8;">${escapeHtmlManualYaml(rest)}</span>`;
      } else if (['DOWN', 'UP', 'LEFT', 'RIGHT', 'true', 'false'].includes(rest)) {
        restHtml = `<span style="color: #4ec9b0;">${escapeHtmlManualYaml(rest)}</span>`;
      } else if (rest) {
        restHtml = `<span style="color: #ce9178;">${escapeHtmlManualYaml(rest)}</span>`;
      }
      return `${prefix}<span style="color: #4ec9b0;">${cmd}</span>:${sp}${restHtml}`;
    }
    // Subkey line: key: value
    const keyMatch = line.match(/^(\s*)([a-zA-Z0-9_]+):(\s*)(.*)$/);
    if (keyMatch) {
      const indent = escapeHtmlManualYaml(keyMatch[1]);
      const key = escapeHtmlManualYaml(keyMatch[2]);
      const sp = escapeHtmlManualYaml(keyMatch[3]);
      let rest = keyMatch[4];
      let restHtml = '';
      if (rest.startsWith('"') && rest.endsWith('"')) {
        restHtml = `<span style="color: #ce9178;">${escapeHtmlManualYaml(rest)}</span>`;
      } else if (/^\d+$/.test(rest)) {
        restHtml = `<span style="color: #b5cea8;">${escapeHtmlManualYaml(rest)}</span>`;
      } else if (['DOWN', 'UP', 'LEFT', 'RIGHT', 'true', 'false'].includes(rest)) {
        restHtml = `<span style="color: #4ec9b0;">${escapeHtmlManualYaml(rest)}</span>`;
      } else if (rest) {
        restHtml = `<span style="color: #ce9178;">${escapeHtmlManualYaml(rest)}</span>`;
      }
      return `${indent}<span style="color: #9cdcfe;">${key}</span>:${sp}${restHtml}`;
    }
    return escapeHtmlManualYaml(line);
  }

  function getCumulativeLinesUpTo(stepNum) {
    let lines = [...manualYamlSnippets.step0];
    for (let s = 1; s <= stepNum; s++) {
      if (manualYamlSnippets['step' + s]) {
        lines = lines.concat(manualYamlSnippets['step' + s]);
      }
    }
    return lines;
  }

  function renderManualYamlLinesInstant(preEl, lines) {
    if (!preEl) return;
    preEl.innerHTML = lines.map(line => {
      const html = highlightYamlLineHtml(line);
      return `<div class="yaml-code-row" style="min-height: 1.4em;">${html}</div>`;
    }).join('');
  }

  window.renderManualYamlDefault = function () {
    if (manualYamlTypingTimer) {
      clearTimeout(manualYamlTypingTimer);
      manualYamlTypingTimer = null;
    }
    manualYamlCurrentStep = 0;
    const preEl = document.getElementById('manual-yaml-code-pre');
    if (preEl) {
      renderManualYamlLinesInstant(preEl, manualYamlSnippets.step0);
    }
    const badgeEl = document.getElementById('yaml-sync-badge');
    if (badgeEl) {
      badgeEl.textContent = '● Ready';
      badgeEl.style.color = '#30d158';
    }
    const slotImg = document.getElementById('yaml-mockup-slot-img');
    if (slotImg) {
      slotImg.src = manualStepImages[0];
      slotImg.style.display = 'block';
      slotImg.style.opacity = '1';
    }
    // Update button states
    const resetBtn = document.getElementById('yaml-step-btn-reset');
    if (resetBtn) resetBtn.classList.add('active');
    for (let s = 1; s <= 4; s++) {
      const btn = document.getElementById(`yaml-step-btn-${s}`);
      if (btn) btn.classList.remove('active');
    }
    const scrollEl = document.getElementById('manual-yaml-code-scroll');
    if (scrollEl) scrollEl.scrollTop = 0;
  };

  window.switchYamlStep = function (stepIdx) {
    if (manualYamlTypingTimer) {
      clearTimeout(manualYamlTypingTimer);
      manualYamlTypingTimer = null;
    }

    if (stepIdx === 0) {
      window.renderManualYamlDefault();
      return;
    }

    // Update buttons
    const resetBtn = document.getElementById('yaml-step-btn-reset');
    if (resetBtn) resetBtn.classList.remove('active');
    for (let s = 1; s <= 4; s++) {
      const btn = document.getElementById(`yaml-step-btn-${s}`);
      if (btn) btn.classList.toggle('active', s === stepIdx);
    }

    // Update iPhone screenshot with smooth fade
    const slotImg = document.getElementById('yaml-mockup-slot-img');
    if (slotImg) {
      const targetSrc = manualStepImages[stepIdx] || manualStepImages[1];
      slotImg.style.opacity = '0.4';
      setTimeout(() => {
        slotImg.src = targetSrc;
        slotImg.style.opacity = '1';
      }, 100);
    }

    const preEl = document.getElementById('manual-yaml-code-pre');
    const scrollEl = document.getElementById('manual-yaml-code-scroll');
    const badgeEl = document.getElementById('yaml-sync-badge');
    if (!preEl) return;

    // Base lines to keep immediately (everything up to stepIdx - 1)
    const baseLines = getCumulativeLinesUpTo(stepIdx - 1);
    renderManualYamlLinesInstant(preEl, baseLines);

    // Lines to type for this step
    const typingLines = manualYamlSnippets['step' + stepIdx] || [];
    if (typingLines.length === 0) {
      manualYamlCurrentStep = stepIdx;
      return;
    }

    if (badgeEl) {
      badgeEl.textContent = '⚡ Typing...';
      badgeEl.style.color = '#ff9f0a';
    }

    let lineIdx = 0;
    let charIdx = 0;
    let activeLineEl = document.createElement('div');
    activeLineEl.className = 'yaml-code-row typing-active';
    activeLineEl.style.minHeight = '1.4em';
    preEl.appendChild(activeLineEl);

    function typeNextKeystroke() {
      if (lineIdx >= typingLines.length) {
        // Typing finished
        if (badgeEl) {
          badgeEl.textContent = '● Maestro (PASS)';
          badgeEl.style.color = '#30d158';
        }
        manualYamlCurrentStep = stepIdx;
        if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
        return;
      }

      const curLine = typingLines[lineIdx];

      // Empty line check
      if (!curLine.trim()) {
        activeLineEl.innerHTML = '&nbsp;';
        lineIdx++;
        charIdx = 0;
        activeLineEl = document.createElement('div');
        activeLineEl.className = 'yaml-code-row';
        activeLineEl.style.minHeight = '1.4em';
        preEl.appendChild(activeLineEl);
        manualYamlTypingTimer = setTimeout(typeNextKeystroke, 10);
        return;
      }

      if (charIdx < curLine.length) {
        charIdx++;
        activeLineEl.textContent = curLine.substring(0, charIdx);
        const cursor = document.createElement('span');
        cursor.textContent = '▋';
        cursor.style.color = '#0071e3';
        cursor.style.marginLeft = '2px';
        activeLineEl.appendChild(cursor);

        if (scrollEl) {
          scrollEl.scrollTop = scrollEl.scrollHeight;
        }

        // Snappy typing speed: 8ms per char
        manualYamlTypingTimer = setTimeout(typeNextKeystroke, 8);
      } else {
        // Line complete -> apply syntax highlighting
        activeLineEl.innerHTML = highlightYamlLineHtml(curLine);
        lineIdx++;
        charIdx = 0;

        if (lineIdx < typingLines.length) {
          activeLineEl = document.createElement('div');
          activeLineEl.className = 'yaml-code-row';
          activeLineEl.style.minHeight = '1.4em';
          preEl.appendChild(activeLineEl);
          manualYamlTypingTimer = setTimeout(typeNextKeystroke, 20);
        } else {
          // All lines completed!
          if (badgeEl) {
            badgeEl.textContent = '● Maestro (PASS)';
            badgeEl.style.color = '#30d158';
          }
          manualYamlCurrentStep = stepIdx;
          if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
        }
      }
    }

    typeNextKeystroke();
  };

  window.switchYamlCodeTab = function (tabType) {
    const tabs = document.querySelectorAll('.yaml-tab-btn');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === tabType));
  };

  // Initialize Category 03 default state when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(window.renderManualYamlDefault, 100);
    });
  } else {
    setTimeout(window.renderManualYamlDefault, 100);
  }

  // ========================================================================
  // ADR Specification Interactive Inspector (Category 04: AITA & AI)
  // ========================================================================
  const adrData = {
    1: {
      id: "ADR-0001",
      badge: "ADR-0001 : AITA Architecture Overview",
      title: "AITA 아키텍처 개요 및 4대 핵심 설계 원칙",
      status: "Status: Accepted (v1.0)",
      body: `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
          <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-weight: 700; color: #2997ff; margin-bottom: 6px;">PROJECT OBJECTIVE</div>
            <div style="font-size: 13px; line-height: 1.5; color: #e5e5ea;">
              QA Regression Test Case를 AI가 이해(Intent)하여 실제 iOS App 자동화 테스트까지 전주기 수행하는 지능형 자동화 플랫폼 구축.
            </div>
            <div style="font-size: 11px; color: #a1a1a6; margin-top: 8px; font-family: monospace;">
              TestRail TC → AI Intent → Semantic Matching → YAML 생성 → Runtime 실행 → TestNG → TestRail 결과 업데이트
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-weight: 700; color: #30d158; margin-bottom: 6px;">PROJECT SCOPE & EXPANSION</div>
            <div style="font-size: 13px; line-height: 1.5; color: #e5e5ea;">
              현재 ThingsBook iOS APP을 기준으로 67개 스위트 240개 테스트 100% 자동화를 완주하였으며, 향후 동일한 선언형 YAML 자산 기반으로 Android(AOS), Web, Multi-Platform으로 확장 가능하도록 유연하게 설계되었습니다.
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 6px; height: 6px; background: #2997ff; border-radius: 50%;"></span>
            AITA 4대 핵심 아키텍처 원칙 (Core Architectural Principles)
          </div>
          <ul style="margin: 0; padding-left: 18px; color: #d1d1d6; font-size: 12.5px; line-height: 1.7;">
            <li><strong style="color: #fff;">Principle 1 (AI와 Runtime의 완전 분리):</strong> AI는 실행하지 않는다. AI는 오직 Intent 추출과 YAML 생성만 담당하며, 실제 실행은 전용 엔진(Runtime)만 수행하여 결함을 원천 격리합니다.</li>
            <li><strong style="color: #fff;">Principle 2 (YAML 공통 자산화):</strong> YAML은 공통 자산이다. 신규 개발(Dev)과 운영 회귀(Regression) 모두 동일한 표준 YAML 자산을 재활용합니다.</li>
            <li><strong style="color: #fff;">Principle 3 (운영 코드와 개발 코드 분리):</strong> 개발(Dev_Regression)에서 단건 실기기 검증을 완벽히 통과한 코드만 운영(Regression) 코드로 승격(Promotion)하여 운영 안정성을 보장합니다.</li>
            <li><strong style="color: #fff;">Principle 4 (Runtime은 TestRail을 모른다):</strong> Runtime의 역할은 오직 YAML 실행 후 exitCode, stdout, timeout, PASS/FAIL을 반환하는 단일 책임만 가지며, TestRail 결과 업데이트는 상위 TestNG 리스너 레이어에서 독립적으로 처리합니다.</li>
          </ul>
        </div>

        <div style="display: flex; gap: 10px; font-size: 11px;">
          <span style="background: rgba(48,209,88,0.12); color: #30d158; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(48,209,88,0.3);">Capture & Semantic Layer ✅</span>
          <span style="background: rgba(48,209,88,0.12); color: #30d158; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(48,209,88,0.3);">Intent & YAML Generation ✅</span>
          <span style="background: rgba(48,209,88,0.12); color: #30d158; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(48,209,88,0.3);">Real Device Integration ✅</span>
          <span style="background: rgba(48,209,88,0.12); color: #30d158; padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(48,209,88,0.3);">TestRail Auto Update ✅</span>
        </div>
      `
    },
    2: {
      id: "ADR-0002",
      badge: "ADR-0002 : Maestro Runtime Selection",
      title: "Maestro Runtime (maestro-runner) 표준 채택 결정",
      status: "Status: Accepted",
      body: `
        <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #2997ff; margin-bottom: 6px;">배경 및 현황 (CONTEXT)</div>
          <p style="font-size: 13px; color: #e5e5ea; line-height: 1.6; margin: 0 0 10px 0;">
            기존 OpenTalk 프로젝트 등 타 프로젝트는 official maestro CLI 바이너리를 사용하였습니다. 그러나 ThingsBook은 실제 물리 단말(Real iPhone 12) 환경에서 장시간 배치 실행과 WDA(WebDriverAgent)의 정밀 제어가 필수적이었습니다.
          </p>
          <div style="font-size: 11px; font-weight: 700; color: #30d158; margin: 10px 0 6px 0;">의사결정 (DECISION)</div>
          <p style="font-size: 13px; color: #e5e5ea; line-height: 1.6; margin: 0;">
            ThingsBook iOS 자동화 플랫폼의 표준 런타임 엔진으로 <strong style="color: #64d2ff; font-family: monospace;">maestro-runner</strong>를 공식 채택합니다.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 4px;">1. Real iPhone 지원</div>
            <div style="font-size: 12px; color: #a1a1a6;">시뮬레이터가 아닌 USB 유선/Wi-Fi 연결 실제 물리 iPhone 12 하드웨어 완벽 제어</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 4px;">2. WDA 연동 최적화</div>
            <div style="font-size: 12px; color: #a1a1a6;">WebDriverAgent(포트 2226)와의 다이렉트 소켓 통신으로 터치·스와이프 지연 0ms 실현</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 4px;">3. 외부 Driver 래핑</div>
            <div style="font-size: 12px; color: #a1a1a6;">Java MaestroExecutionManager에서 stdout, stderr, 타임아웃, exitCode를 프로세스 단위로 완벽 통제</div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 11px; font-weight: 700; color: #fff; margin-bottom: 4px;">4. 향후 확장성</div>
            <div style="font-size: 12px; color: #a1a1a6;">추후 Android UIAutomator 및 멀티 디바이스 병렬 실행 시 동일한 아키텍처 재활용 가능</div>
          </div>
        </div>
      `
    },
    3: {
      id: "ADR-0003",
      badge: "ADR-0003 : Dev / Regression Separation",
      title: "운영 코드(Regression)와 개발 코드(Dev_Regression) 분리",
      status: "Status: Accepted",
      body: `
        <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #2997ff; margin-bottom: 6px;">의사결정 및 원칙 (DECISION & PRINCIPLE)</div>
          <p style="font-size: 13px; color: #e5e5ea; line-height: 1.6; margin: 0 0 10px 0;">
            신규 자동화 시나리오 작성 및 AI가 생성한 초안 코드는 반드시 <strong style="color: #ffd60a; font-family: monospace;">Dev_Regression</strong> 패키지에서 먼저 실기기 단건 스모크 테스트로 동작을 검증합니다.
          </p>
          <div style="font-size: 11px; font-weight: 700; color: #30d158; margin: 10px 0 6px 0;">운영 코드 승격 원칙 (PROMOTION GATEWAY)</div>
          <p style="font-size: 13px; color: #e5e5ea; line-height: 1.6; margin: 0;">
            운영 <strong style="color: #30d158; font-family: monospace;">Regression</strong> 스위트에는 실제 iPhone 12에서 100% 정상 통과(PASS) 검증이 완료된 신뢰할 수 있는 코드만 승격하여 반영합니다.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: rgba(255,214,10,0.06); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,214,10,0.2);">
            <div style="font-size: 12px; font-weight: 700; color: #ffd60a; margin-bottom: 6px;">개발 레이어 (Dev_Regression)</div>
            <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #d1d1d6; line-height: 1.6;">
              <li>신규 YAML 작성 및 AITA 생성 코드 임포트</li>
              <li>단건 실행 디버깅 및 좌표/Wait 타이밍 미세 튜닝</li>
              <li>실패 발생 시 즉각 수정 및 안전한 샌드박스 보장</li>
            </ul>
          </div>
          <div style="background: rgba(48,209,88,0.06); padding: 14px; border-radius: 10px; border: 1px solid rgba(48,209,88,0.2);">
            <div style="font-size: 12px; font-weight: 700; color: #30d158; margin-bottom: 6px;">운영 레이어 (Regression)</div>
            <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #d1d1d6; line-height: 1.6;">
              <li>검증 완료된 67개 스위트 / 240개 테스트만 배치 수납</li>
              <li>매 배포 릴리즈 전수 자동화 실행 및 무결점 보장</li>
              <li>TestRail 실시간 100% Pass 동기화 대상 파이프라인</li>
            </ul>
          </div>
        </div>
      `
    },
    4: {
      id: "ADR-0004",
      badge: "ADR-0004 : TestRail Decoupling",
      title: "Runtime 엔진과 TestRail 리포팅 계층의 완전 분리",
      status: "Status: Accepted",
      body: `
        <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #2997ff; margin-bottom: 6px;">의사결정 (DECISION)</div>
          <p style="font-size: 13px; color: #e5e5ea; line-height: 1.6; margin: 0 0 10px 0;">
            실행 엔진(Runtime)은 TestRail의 존재를 전혀 알지 못하도록 아키텍처적으로 철저히 격리합니다.
          </p>
          <div style="font-size: 11px; font-weight: 700; color: #30d158; margin: 10px 0 6px 0;">단일 책임 원칙 (SINGLE RESPONSIBILITY)</div>
          <p style="font-size: 13px; color: #e5e5ea; line-height: 1.6; margin: 0;">
            Runtime의 임무는 오직 "YAML 실행 ➔ stdout/stderr 파싱 ➔ PASS/FAIL 반환"으로 종료됩니다. TestRail 연동 및 결과 업로드는 오직 상위 <strong style="color: #64d2ff; font-family: monospace;">Regression Layer</strong>(TestNG Listener)에서만 수행합니다.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 6px;">결합도 최소화 (Loose Coupling)</div>
            <div style="font-size: 12px; color: #a1a1a6; line-height: 1.6;">
              TestRail API 서버 지연이나 네트워크 끊김이 발생하더라도 단말의 실제 UI 테스트 실행 흐름에는 단 1초의 지연이나 간섭도 발생하지 않습니다.
            </div>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 6px;">독립적 리포팅 교체 용이성</div>
            <div style="font-size: 12px; color: #a1a1a6; line-height: 1.6;">
              향후 사내 Slack 봇 보고, Allure Report, Jira 연동 등 다른 리포팅 시스템이 추가되더라도 런타임 코드는 한 줄도 수정할 필요가 없습니다.
            </div>
          </div>
        </div>
      `
    },
    5: {
      id: "ADR-0005",
      badge: "ADR-0005 : AITA Platform Definition",
      title: "AI 기반 QA 자동화 플랫폼 (AITA) 전주기 역할 정의",
      status: "Status: Accepted",
      body: `
        <div style="background: rgba(255,255,255,0.03); padding: 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 14px;">
          <div style="font-size: 11px; font-weight: 700; color: #2997ff; margin-bottom: 6px;">플랫폼 정의 (PLATFORM DEFINITION)</div>
          <p style="font-size: 13.5px; color: #fff; line-height: 1.6; margin: 0 0 10px 0; font-weight: 600;">
            AITA는 단순한 "YAML 코드 생성 프롬프트"가 아닙니다. QA 자연어 테스트케이스 기획부터 실기기 자동 완주 및 TestRail 결과 기록까지 전 과정을 아우르는 차세대 AI QA 자동화 플랫폼(AI Test Automation Platform)입니다.
          </p>
          <div style="font-size: 11px; color: #a1a1a6; line-height: 1.6;">
            사람의 개입이 필요한 반복적인 요소 분석, 타이핑, 단건 실행 검증을 AI가 자동화하여 QA 엔지니어가 고부가가치 탐색적 테스트에 집중할 수 있도록 만듭니다.
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #fff;">1. TestRail TC 분석</span>
            <span style="font-size: 12px; color: #a1a1a6;">자연어 문장에서 동작(Action), 대상(Target), 기대결과(Expectation) Intent 추출</span>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #fff;">2. Semantic Matching & 방어 규칙</span>
            <span style="font-size: 12px; color: #a1a1a6;">실제 UI 요소 트리 매핑 + 오터치/애니메이션 지연 방지 26가지 실전 룰 자동 주입</span>
          </div>
          <div style="background: rgba(255,255,255,0.04); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #fff;">3. Dev Validation & 자가 치유</span>
            <span style="font-size: 12px; color: #a1a1a6;">Dev_Regression에서 실제 iPhone 12 구동 후 오류 발생 시 스스로 파라미터 보정</span>
          </div>
          <div style="background: rgba(48,209,88,0.08); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(48,209,88,0.25); display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12.5px; font-weight: 700; color: #30d158;">4. Regression & TestRail 연동</span>
            <span style="font-size: 12px; color: #30d158;">검증 완료 코드를 운영 승격하여 67개 스위트 배치 실행 및 TestRail 100% 자동 기록</span>
          </div>
        </div>
      `
    }
  };

  window.selectAdrSpec = function(specNum) {
    const data = adrData[specNum];
    if (!data) return;

    // Update buttons active class
    for (let i = 1; i <= 5; i++) {
      const btn = document.getElementById(`btn-adr-${i}`);
      if (btn) {
        if (i === specNum) {
          btn.classList.add('active');
          btn.style.borderColor = 'rgba(255,255,255,0.28)';
          btn.style.background = '#1e1e22';
        } else {
          btn.classList.remove('active');
          btn.style.borderColor = 'rgba(255,255,255,0.08)';
          btn.style.background = '#141416';
        }
      }
    }

    // Update spec display box
    const badgeEl = document.getElementById('adr-spec-badge');
    const headlineEl = document.getElementById('adr-spec-headline');
    const statusEl = document.getElementById('adr-spec-status');
    const contentBodyEl = document.getElementById('adr-spec-content-body');

    if (badgeEl) badgeEl.textContent = data.badge;
    if (headlineEl) headlineEl.textContent = data.title;
    if (statusEl) statusEl.textContent = data.status;
    if (contentBodyEl) contentBodyEl.innerHTML = data.body;
  };


/* ==========================================================================
   STEP 01: STEP 4 IPHONE 3-IMAGE CAROUSEL & LIGHTBOX
   ========================================================================== */
const stepIphoneImgs = [
  { src: './media/sample_iphone_developer.PNG', alt: '실제 iPhone 12 개발자 앱 신뢰(Trust) 승인 화면', caption: '▶ 1단계: 설정 > 일반 > VPN 및 기기 관리 > 개발자 앱 신뢰(Trust) 승인' },
  { src: './media/sample_realiphone_wda_accept2.PNG', alt: '실제 iPhone 12 WDA 인증서 신뢰 완료 화면', caption: '▶ 2단계: WDA 개발자 인증서 신뢰 승인 완료 및 개발자 모드 승인' },
  { src: './media/sample_realiphone_wda_install.PNG', alt: '실제 iPhone 12 홈 화면에 WDA 상주 에이전트 설치 확인', caption: '▶ 3단계: 실제 iPhone 12 홈 화면에 WebDriverAgentRunner 상주 에이전트 설치 완료' }
];
let currentStepIphoneIdx = 0;

window.switchStep4Iphone = function (idx) {
  currentStepIphoneIdx = idx;
  const target = stepIphoneImgs[idx];
  if (!target) return;
  const imgEl = document.getElementById('step4-iphone-img') || document.getElementById('step3-iphone-img');
  const capEl = document.getElementById('step4-iphone-caption') || document.getElementById('step3-iphone-caption');
  if (imgEl) {
    imgEl.src = target.src;
    imgEl.alt = target.alt;
  }
  if (capEl) {
    capEl.textContent = target.caption;
  }
  const btns = document.querySelectorAll('.step4-tab-btn, .step3-tab-btn');
  btns.forEach((b, i) => {
    if (i % 3 === idx) b.classList.add('active');
    else b.classList.remove('active');
  });
  const dots = document.querySelectorAll('.step4-dot, .step3-dot');
  dots.forEach((d, i) => {
    if (i % 3 === idx) d.classList.add('active');
    else d.classList.remove('active');
  });
  const counterEl = document.getElementById('step4-iphone-counter') || document.getElementById('step3-iphone-counter');
  if (counterEl) {
    counterEl.textContent = (idx + 1) + ' / ' + stepIphoneImgs.length;
  }
};
window.switchStep3Iphone = window.switchStep4Iphone;

window.step4Prev = function (e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  let prev = currentStepIphoneIdx - 1;
  if (prev < 0) prev = stepIphoneImgs.length - 1;
  window.switchStep4Iphone(prev);
};
window.step3Prev = window.step4Prev;

window.step4Next = function (e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  let next = currentStepIphoneIdx + 1;
  if (next >= stepIphoneImgs.length) next = 0;
  window.switchStep4Iphone(next);
};
window.step3Next = window.step4Next;

window.openCurrentStep4IphoneLightbox = function () {
  const target = stepIphoneImgs[currentStepIphoneIdx] || stepIphoneImgs[0];
  if (typeof window.openImageInLightbox === 'function') {
    window.openImageInLightbox(target.src);
  }
};
window.openCurrentStep3IphoneLightbox = window.openCurrentStep4IphoneLightbox;


/* ==========================================================================
   STEP 01: REAL DEVICE SETUP SLIDER / PAGER CONTROLLER
   ========================================================================== */
var currentSetupStep = 0;
var totalSetupSteps = 7;

function setSetupStep(idx) {
  if (idx < 0) idx = 0;
  if (idx >= totalSetupSteps) idx = totalSetupSteps - 1;
  currentSetupStep = idx;

  for (var i = 0; i < totalSetupSteps; i++) {
    var slide = document.getElementById("setup-slide-" + i);
    if (slide) {
      if (i === currentSetupStep) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }
    }
  }

  var tabs = document.querySelectorAll(".setup-pager-tab");
  tabs.forEach(function(tab, index) {
    if (index === currentSetupStep) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  var counter = document.getElementById("setup-step-counter");
  if (counter) {
    counter.textContent = "STEP " + (currentSetupStep + 1) + " / " + totalSetupSteps;
  }

  var prevBtn = document.querySelector(".setup-pager-btn.prev");
  var nextBtn = document.querySelector(".setup-pager-btn.next");
  if (prevBtn) prevBtn.disabled = (currentSetupStep === 0);
  if (nextBtn) nextBtn.disabled = (currentSetupStep === totalSetupSteps - 1);
}

function prevSetupStep() {
  if (currentSetupStep > 0) {
    setSetupStep(currentSetupStep - 1);
  }
}

function nextSetupStep() {
  if (currentSetupStep < totalSetupSteps - 1) {
    setSetupStep(currentSetupStep + 1);
  }
}

window.setSetupStep = setSetupStep;
window.prevSetupStep = prevSetupStep;
window.nextSetupStep = nextSetupStep;


/* ==========================================================================
   STEP 02: APPIUM INSPECTOR 2-SCREEN CAROUSEL CONTROLLER
   ========================================================================== */
var currentInspectIdx = 0;
var inspectScreens = [
  {
    src: "./media/sample_appiuminspector_elements.png",
    title: "화면 1: ThingsBook 글 상세 & 본문 계층 구조 (XML Hierarchy)",
    caption: "<strong>XML Hierarchy 트리:</strong> 화면의 뷰 계층에서 대상 뷰를 선택하면 고유 접근성 식별자(Accessibility ID)와 XPath, Bounds 좌표를 실시간으로 탐색",
    badge: "1 / 2"
  },
  {
    src: "./media/sample_appiuminspector_movie2.png",
    title: "화면 2: OTT 영화 탐색 및 복합 글감 카드 계층 구조",
    caption: "<strong>복합 글감 카드 탐색:</strong> IMDb 평점, 좋아요, Keep 버튼 등 복합 카드 내의 자식 요소(containsChild) 및 좌표 앵커를 정밀하게 추출",
    badge: "2 / 2"
  }
];

function switchInspectScreen(idx) {
  if (idx < 0) idx = 0;
  if (idx >= inspectScreens.length) idx = inspectScreens.length - 1;
  currentInspectIdx = idx;

  var item = inspectScreens[currentInspectIdx];
  var img = document.getElementById("inspect-carousel-img");
  var title = document.getElementById("inspect-carousel-title");
  var caption = document.getElementById("inspect-carousel-caption");
  var counter = document.getElementById("inspect-carousel-counter");

  if (img) img.src = item.src;
  if (title) title.textContent = item.title;
  if (caption) caption.innerHTML = item.caption;
  if (counter) counter.textContent = item.badge;

  var activeDesc = document.getElementById("inspect-active-analysis-desc");
  if (activeDesc) activeDesc.innerHTML = item.caption;
  var tagEl = document.getElementById("inspect-screen-tag");
  if (tagEl) tagEl.textContent = "화면 " + item.badge;

  var tabs = document.querySelectorAll(".inspect-tab-btn");
  tabs.forEach(function(tab, i) {
    tab.classList.toggle("active", i === currentInspectIdx);
  });

  var dots = document.querySelectorAll(".inspect-dot");
  dots.forEach(function(dot, i) {
    dot.classList.toggle("active", i === currentInspectIdx);
  });
}

function inspectPrev(e) {
  if (e) e.stopPropagation();
  switchInspectScreen((currentInspectIdx - 1 + inspectScreens.length) % inspectScreens.length);
}

function inspectNext(e) {
  if (e) e.stopPropagation();
  switchInspectScreen((currentInspectIdx + 1) % inspectScreens.length);
}

function openCurrentInspectLightbox() {
  var item = inspectScreens[currentInspectIdx];
  if (typeof window.openImageInLightbox === "function") {
    window.openImageInLightbox(item.src);
  }
}

window.switchInspectScreen = switchInspectScreen;
window.inspectPrev = inspectPrev;
window.inspectNext = inspectNext;
window.openCurrentInspectLightbox = openCurrentInspectLightbox;


  /* Start presentation: close splash & navigate directly to STEP 01 setup */
  window.startMainPresentation = function () {
    if (typeof window.closeHeroSplash === 'function') {
      window.closeHeroSplash();
    }
    setTimeout(() => {
      if (typeof window.showCategoryTab === 'function') {
        window.showCategoryTab('sec-setup');
      }
      const secSetup = document.getElementById('sec-setup');
      if (secSetup) {
        secSetup.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 240);
  };

  /* Open Web F12 screenshot in modal lightbox */
  window.openWebF12Lightbox = function (e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const modal = document.getElementById('lightbox-modal');
    const activeImg = document.getElementById('lightbox-active-img');
    const cap = document.getElementById('lightbox-caption');
    if (!modal || !activeImg) return;

    activeImg.src = './media/sample_thingsbookwebF12.png';
    activeImg.style.display = 'block';

    const activeVid = document.getElementById('lightbox-active-video');
    if (activeVid) {
      activeVid.pause();
      activeVid.style.display = 'none';
    }

    if (cap) {
      cap.textContent = 'ThingsBook 웹 자동화 브라우저 F12 개발자 도구 — Elements DOM 계층 트리 및 XPath 확인 (Web vs iOS 과제 비교)';
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };


  /* ==========================================================================
     Page 4: Challenge Combined Showcase (Web F12 <-> Locked iOS iPhone)
     ========================================================================== */
  window.currentChallengeSlide = 1;

  window.switchChallengeSlide = function (slideNum, e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    window.currentChallengeSlide = slideNum;

    const slide1 = document.getElementById('challenge-slide-1');
    const slide2 = document.getElementById('challenge-slide-2');
    const tab1 = document.getElementById('ch-tab-1');
    const tab2 = document.getElementById('ch-tab-2');
    const dot1 = document.getElementById('ch-dot-1');
    const dot2 = document.getElementById('ch-dot-2');
    const navNum = document.getElementById('ch-nav-num');
    const zoomBtn = document.getElementById('ch-zoom-btn');

    if (slideNum === 1) {
      if (slide1) slide1.style.display = 'flex';
      if (slide2) slide2.style.display = 'none';
      if (tab1) tab1.classList.add('active');
      if (tab2) tab2.classList.remove('active');
      if (dot1) dot1.classList.add('active');
      if (dot2) dot2.classList.remove('active');
      if (navNum) navNum.textContent = '1 / 2';
      if (zoomBtn) {
        zoomBtn.style.display = 'inline-block';
        zoomBtn.textContent = '🔍 F12 원본 확대';
      }
    } else {
      if (slide1) slide1.style.display = 'none';
      if (slide2) slide2.style.display = 'flex';
      if (tab1) tab1.classList.remove('active');
      if (tab2) tab2.classList.add('active');
      if (dot1) dot1.classList.remove('active');
      if (dot2) dot2.classList.add('active');
      if (navNum) navNum.textContent = '2 / 2';
      if (zoomBtn) {
        zoomBtn.style.display = 'none';
      }
    }
  };

  window.nextChallengeSlide = function (e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const next = window.currentChallengeSlide === 1 ? 2 : 1;
    window.switchChallengeSlide(next, e);
  };

  window.prevChallengeSlide = function (e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const prev = window.currentChallengeSlide === 2 ? 1 : 2;
    window.switchChallengeSlide(prev, e);
  };

  window.openChallengeLightbox = function (e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (window.currentChallengeSlide === 1) {
      window.openWebF12Lightbox(e);
    }
  };


    /* ========================================================================
     SLIDE 05: APPLE-STYLE 4-STEP BATCH PIPELINE CONTROLLER
     ======================================================================== */
  const BATCH_REAL_REGRESSION_XML = `<?xml version="1.0" encoding="UTF-8"?>
<suite name="Thingsbook iOS APP Real Regression All Suites" verbose="1">
    <test name="Real Regression All Suites">
        <classes>
            <class name="Thingsbook.iOS_APP.Regression.Test_01_Sign_up_Login_Onboarding.Suite_001_회원가입"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_01_Sign_up_Login_Onboarding.Suite_002_연령_확인"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_01_Sign_up_Login_Onboarding.Suite_003_이메일_수집_인증"/>

            <class name="Thingsbook.iOS_APP.Regression.Test_01_Sign_up_Login_Onboarding.Suite_005_프로필_입력"/>

            <class name="Thingsbook.iOS_APP.Regression.Test_01_Sign_up_Login_Onboarding.Suite_007_Login"/>



            <class name="Thingsbook.iOS_APP.Regression.Test_02_Service_Home.Suite_001_포스트_피드"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_02_Service_Home.Suite_002_팔로우_추천_유저_리스트"/>

            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_001_Collection_생성"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_002_Collection_선택"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_003_생성된_Collection_없는_경우"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_004_생성된_Collection_있는_경우"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_005_Collection_변경"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_006_OTT"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_007_Book"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_008_Check_in"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_009_Webtoon"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_010_날짜_무드"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_011_Spotify"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_012_본문_영역"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_03_Editor.Suite_013_글_수정하기"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_04_End.Suite_001_인터렉션_및_헤더"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_04_End.Suite_002_기본_정보"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_04_End.Suite_003_본문"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_04_End.Suite_004_피드백"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_04_End.Suite_005_댓글_페이지"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_04_End.Suite_006_View_Post_원문보기_버튼"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_05_글감_엔드.Suite_001_글감_엔드"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_001_My_Home"/>

            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_003_Profile"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_004_본인_Home_공개설정_필터"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_005_Posts"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_006_뷰모드_타임라인뷰_Default"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_007_뷰모드_그리드뷰"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_008_Empty_Case"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_009_Collection_탭"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_010_뷰모드별_팝업노트_확인"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_011_본인_Home_Create"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_012_Empty_Case"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_013_타인_Home_Add_버튼"/>



            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_017_프로필_정보_변경_화면"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_06_My_Home.Suite_018_테마_변경"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_07_Collections_상세.Suite_001_본인_Collections"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_07_Collections_상세.Suite_002_타인_Collections"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_08_Notifications.Suite_001_Notification_Tab"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_08_Notifications.Suite_002_Notification_Tab"/>

            <class name="Thingsbook.iOS_APP.Regression.Test_09_Settings.Suite_001_Settings"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_09_Settings.Suite_002_Account"/>

            <class name="Thingsbook.iOS_APP.Regression.Test_09_Settings.Suite_004_Find_Friends"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_09_Settings.Suite_005_Notifications"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_09_Settings.Suite_006_Privacy_and_Permissions_Media_Help_About_Log_out"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_09_Settings.Suite_007_서비스_소개_페이지"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_10_Search.Suite_001_Search"/>
            <class name="Thingsbook.iOS_APP.Regression.Test_11_Keep.Suite_001_Keep"/>


        </classes>
    </test>
</suite>`;

  const BATCH_TESTRAIL_JAVA = "package Thingsbook.iOS.Common_Setup;\n\nimport java.io.ByteArrayOutputStream;\nimport java.io.OutputStream;\nimport java.io.PrintStream;\nimport java.io.PrintWriter;\nimport java.io.StringWriter;\nimport java.lang.reflect.Method;\nimport java.nio.charset.StandardCharsets;\nimport java.text.SimpleDateFormat;\nimport java.util.ArrayList;\nimport java.util.Date;\nimport java.util.List;\nimport java.util.logging.Level;\nimport java.util.logging.Logger;\n\nimport org.testng.ITestResult;\nimport org.testng.Reporter;\nimport org.testng.annotations.AfterMethod;\nimport org.testng.annotations.AfterSuite;\nimport org.testng.annotations.BeforeClass;\nimport org.testng.annotations.BeforeMethod;\nimport org.testng.annotations.BeforeSuite;\nimport org.testng.annotations.Listeners;\n\nimport com.codepine.api.testrail.TestRail;\nimport com.codepine.api.testrail.model.Plan;\nimport com.codepine.api.testrail.model.Project;\nimport com.codepine.api.testrail.model.Suite;\nimport com.nts.sqa.support.api.TestRailAPI;\n\nimport Thingsbook.iOS.Execution.MaestroRuntimeTestNgListener;\nimport Thingsbook.iOS.Execution.MaestroSuiteBatchExecutor;\nimport Thingsbook.iOS.Execution.annotation.TestRailCase;\n\n/**\n * Real Regression base setup class for Thingsbook iOS APP with TestRail API integration.\n *\n * <p>Modeled after OpenTalk's proven TestRail setup ({@code Opentalk_React_TR_Setup})\n * and adapted for native iOS mobile automation (headless / browser dependencies removed):\n * <ul>\n *   <li><b>Project:</b> {@code ThingsBook}</li>\n *   <li><b>Suite:</b> {@code [App] ThingsBook Regression}</li>\n *   <li><b>Run:</b> {@code 20261027_AutoTest_iOS_Regression} (override with {@code thingsbook.tr.runName})</li>\n *   <li><b>Manual Blank Cases:</b> Maintained as {@code Untested} in TestRail (no result submitted)</li>\n *   <li><b>Detailed Comments:</b> Extracted Maestro steps, console output, device info, and timings</li>\n * </ul>\n * </p>\n */\n@Listeners(MaestroRuntimeTestNgListener.class)\npublic abstract class Thingsbook_iOS_APP_Real_Regression_Setup extends Setup {\n\n    private static final Logger LOG = Logger.getLogger(Thingsbook_iOS_APP_Real_Regression_Setup.class.getName());\n\n    private static final String DEFAULT_TESTRAIL_PLAN_NAME = \"20261106_AutoTest_iOS_Regression\";\n    private static final String DEFAULT_TESTRAIL_RUN_NAME = \"20261106_ThingsBook_iOS_Regression\";\n    private static final String DEFAULT_PROJECT_NAME = \"ThingsBook\";\n    private static final String DEFAULT_SUITE_NAME = \"[App] ThingsBook Regression\";\n    private static final String TESTRAIL_BASE_URL = \"https://sqa.navercorp.com/testrail\";\n    private static final String TESTRAIL_USER = \"xxxxxx\";\n    private static final String TESTRAIL_PASSWORD = \"xxxxxx\";\n    private static final String FALLBACK_TESTRAIL_USER = \"xxxxxx\";\n    private static final String FALLBACK_TESTRAIL_PASSWORD = \"xxxxxx\";\n\n    private static final Object TR_LOCK = new Object();\n    private static final Object SYS_STREAM_LOCK = new Object();\n\n    private static final ThreadLocal<ByteArrayOutputStream> THREAD_LOCAL_OUTPUT_CAPTURE = new ThreadLocal<>();\n    private static final ThreadLocal<Long> THREAD_LOCAL_START_TIME = new ThreadLocal<>();\n\n    private static volatile boolean streamsInstalled = false;\n    private static volatile PrintStream originalSysOut;\n    private static volatile PrintStream originalSysErr;\n\n    public static TestRailAPI tr;\n    public String message = null;\n\n    public String planName = DEFAULT_TESTRAIL_PLAN_NAME;\n    public String projectName = DEFAULT_PROJECT_NAME;\n    public String suiteName = DEFAULT_SUITE_NAME;\n    public String runName = DEFAULT_TESTRAIL_RUN_NAME;\n\n    private static volatile int sharedPlanId = -1;\n    private static volatile int sharedRunId = -1;\n    private static volatile TestRailRunCaseResolver.RunCaseIndex sharedTestRailRunIndex;\n    private static volatile TestRail sharedTestRailClient;\n    private static volatile boolean trInitialized = false;\n\n    // -----------------------------------------------------------------------\n    // Suite Lifecycle (TestRail Connection & Plan/Run Resolution)\n    // -----------------------------------------------------------------------\n}";

  const batchSteps = [
    {
      type: 'video',
      video: 'media/sample_iDE_Run_Test_03_iOS_Suite_006_OTT.mov',
      pill: 'STEP 01',
      title: '01. YAML 단건 실기기 정상 실행 검증 (OTT Suite 006)',
      sub: 'AITA로 생성한 YAML 테스트 코드가 실제 실기기에서 정상으로 PASS까지 도달하는지 즉각 확인',
      desc: 'AITA 에이전트가 완성한 선언형 YAML 스크립트가 실제 iPhone 환경에서 예외나 타임아웃 없이 100% 정상 PASS 동작을 완료하는지 단건 실행으로 확인합니다. 요소 탐색 속성, 스크롤 보정, 애니메이션 대기 등 실기기 방어 룰이 안정적으로 적용되었는지 운영 승격 전 단건으로 즉각 피드백을 확보합니다.',
      chips: [
        'AITA 생성 YAML 100% 동작 검증',
        'sample_iDE_Run 실기기 단건 스모크 피드백',
        '실기기 정상 PASS 완주 확인'
      ]
    },
    {
      type: 'image',
      image: 'media/sample_eclipse_dev_regression2.png',
      pill: 'STEP 02',
      title: '02. Dev_Regression 사전 검증',
      sub: '동작 확인된 YAML 코드를 Dev_Regression 사전 검증용 Suite에서 검증 · 승격 프로세스',
      desc: 'Dev_Regression에서 단건 스모크 테스트로 실기기 동작을 100% 검증한 후 운영 코드로 승격합니다. 안정성이 입증되지 않은 스크립트가 운영 배치에 진입하는 것을 원천 차단하여 리그레션 스위트의 신뢰도를 최고 수준으로 유지합니다.',
      chips: [
        'Dev_Regression 샌드박스 검증',
        '단건 스모크 100% 검증 후 운영 승격',
        '리그레션 운영 스위트 오염 원천 차단'
      ]
    },
    {
      type: 'code',
      codeTab: 'xml',
      pill: 'STEP 03',
      title: '03. Real_Regression Suite에 배치 적용',
      sub: 'Thingsbook iOS APP Real Regression All Suites XML 구성 및 전체 44개 클래스 유기적 배치 융합',
      desc: '실제 운영 회귀 테스트를 위해 TestNG XML 스위트(Thingsbook iOS APP Real Regression All Suites)로 전체 44개 Suite 클래스를 일괄 편성합니다. 회원가입/온보딩부터 에디터(OTT, 도서, Spotify), 마이홈, 알림, 설정까지 전 도메인을 공통 기본 클래스 ThingsbookRegressionSetup 및 MaestroRuntimeTestNgListener 기반으로 통합 제어합니다.',
      chips: [
        'ThingsbookRegressionSetup 상속',
        '44개 Suite 클래스 XML 마스터 배치',
        'Java TestNG Suite 엔드투엔드 일괄 완주'
      ]
    },
    {
      type: 'code',
      codeTab: 'java',
      pill: 'STEP 04',
      title: '04. TestRail 실시간 양방향 API 자동 업데이트',
      sub: 'Thingsbook_iOS_APP_Real_Regression_Setup.java 기반 실시간 매핑 및 Passed_Auto 100% 자동 기록',
      desc: 'Thingsbook_iOS_APP_Real_Regression_Setup.java가 TestNG 실행 이벤트를 가로채어, YAML 상단에 각인된 Case ID와 매핑합니다. 실시간으로 TestRail Run #1204에 Passed_Auto 상태, 소요 시간, 스텝별 Maestro Flow 로그를 100% 자동 기록합니다 (QA 수기 입력 0분).',
      chips: [
        'Case ID (#C번호) 실시간 매핑',
        'TestRail Run #1204 실시간 Passed_Auto 기록',
        '스텝별 로그 자동 업로드 · QA 수기 0분'
      ]
    }
  ];

  let currentBatchStepIdx = 0;

  window.switchBatchStep = function (stepIdx) {
    if (stepIdx < 0 || stepIdx >= batchSteps.length) return;
    currentBatchStepIdx = stepIdx;
    const data = batchSteps[stepIdx];

    // 1. Update buttons
    const btns = document.querySelectorAll('.batch-seg-btn');
    btns.forEach((btn, idx) => {
      const active = (idx === stepIdx);
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // 2. Manage Media Containers (Video / Image / IDE Code)
    const videoContainer = document.getElementById('batch-media-video');
    const imageContainer = document.getElementById('batch-media-image');
    const codeContainer = document.getElementById('batch-media-code');
    const videoEl = document.getElementById('batch-main-video');
    const imgEl = document.getElementById('batch-main-img');

    if (data.type === 'video') {
      if (videoContainer) videoContainer.style.display = 'flex';
      if (imageContainer) imageContainer.style.display = 'none';
      if (codeContainer) codeContainer.style.display = 'none';

      if (videoEl) {
        if (!videoEl.src.endsWith(data.video)) {
          videoEl.src = data.video;
        }
        videoEl.play().catch(() => {});
      }
    } else if (data.type === 'code') {
      if (videoEl) videoEl.pause();
      if (videoContainer) videoContainer.style.display = 'none';
      if (imageContainer) imageContainer.style.display = 'none';
      if (codeContainer) {
        codeContainer.style.display = 'flex';
        codeContainer.style.opacity = '0.4';
        setTimeout(() => { codeContainer.style.opacity = '1'; }, 50);
      }

      const xmlTab = document.getElementById('batch-ide-tab-xml');
      const javaTab = document.getElementById('batch-ide-tab-java');
      const xmlScroll = document.getElementById('batch-ide-scroll-xml');
      const javaScroll = document.getElementById('batch-ide-scroll-java');
      const metaBadge = document.getElementById('batch-ide-meta-badge');
      const copyText = document.getElementById('batch-copy-text');

      if (data.codeTab === 'java') {
        if (xmlTab) xmlTab.classList.remove('active');
        if (javaTab) javaTab.classList.add('active');
        if (xmlScroll) xmlScroll.style.display = 'none';
        if (javaScroll) javaScroll.style.display = 'block';
        if (metaBadge) metaBadge.textContent = 'Java 17 · TestNG + TestRail API';
        if (copyText) copyText.textContent = 'Copy Java';
      } else {
        if (javaTab) javaTab.classList.remove('active');
        if (xmlTab) xmlTab.classList.add('active');
        if (javaScroll) javaScroll.style.display = 'none';
        if (xmlScroll) xmlScroll.style.display = 'block';
        if (metaBadge) metaBadge.textContent = 'XML 1.0 · UTF-8 · 44 SUITES';
        if (copyText) copyText.textContent = 'Copy XML';
      }
    } else {
      // type === 'image'
      if (videoEl) videoEl.pause();
      if (videoContainer) videoContainer.style.display = 'none';
      if (codeContainer) codeContainer.style.display = 'none';
      if (imageContainer) {
        imageContainer.style.display = 'flex';
        if (imgEl) {
          imgEl.style.opacity = '0.35';
          imgEl.style.transform = 'scale(0.995)';
          setTimeout(() => {
            imgEl.src = data.image;
            imgEl.alt = data.title;
            imgEl.style.opacity = '1';
            imgEl.style.transform = 'scale(1)';
          }, 110);
        }
      }
    }

    // 3. Update Caption Card
    const pillEl = document.getElementById('batch-caption-pill');
    if (pillEl) pillEl.textContent = data.pill;

    const titleEl = document.getElementById('batch-caption-title');
    if (titleEl) titleEl.textContent = data.title;

    const subEl = document.getElementById('batch-caption-sub');
    if (subEl) subEl.textContent = data.sub;

    const descEl = document.getElementById('batch-caption-desc');
    if (descEl) descEl.textContent = data.desc;

    const indicatorEl = document.getElementById('batch-pager-indicator');
    if (indicatorEl) indicatorEl.textContent = `${stepIdx + 1} / ${batchSteps.length}`;

    // 4. Update Chips
    const chipsEl = document.getElementById('batch-caption-chips');
    if (chipsEl && data.chips) {
      chipsEl.innerHTML = data.chips.map(c => `
        <div class="batch-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#30d158" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${c}</span>
        </div>
      `).join('');
    }
  };

  window.prevBatchStep = function () {
    const nextIdx = (currentBatchStepIdx - 1 + batchSteps.length) % batchSteps.length;
    window.switchBatchStep(nextIdx);
  };

  window.nextBatchStep = function () {
    const nextIdx = (currentBatchStepIdx + 1) % batchSteps.length;
    window.switchBatchStep(nextIdx);
  };

  window.openBatchCurrentLightbox = function () {
    const data = batchSteps[currentBatchStepIdx];
    if (data && data.type === 'image' && typeof window.openImageInLightbox === 'function') {
      window.openImageInLightbox(data.image);
    }
  };

  window.copyBatchIdeCode = function () {
    const isJava = (currentBatchStepIdx === 3);
    const codeToCopy = isJava ? BATCH_TESTRAIL_JAVA : BATCH_REAL_REGRESSION_XML;
    const btn = document.getElementById('batch-copy-btn');
    const textEl = document.getElementById('batch-copy-text');
    const defaultLabel = isJava ? 'Copy Java' : 'Copy XML';

    if (!navigator.clipboard) {
      const textarea = document.createElement('textarea');
      textarea.value = codeToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } else {
      navigator.clipboard.writeText(codeToCopy);
    }

    if (textEl) textEl.textContent = 'Copied!';
    if (btn) btn.classList.add('copied');
    setTimeout(() => {
      if (textEl) textEl.textContent = defaultLabel;
      if (btn) btn.classList.remove('copied');
    }, 1800);
  };
  window.copyBatchXmlCode = window.copyBatchIdeCode;
