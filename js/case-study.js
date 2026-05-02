(function () {
  // Scroll-into-view: fade in each section when it enters the viewport
  var sections = document.querySelectorAll('.page-case-study main > section');
  if (sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('cs-section--in-view');
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  var footerActions = document.querySelector('.page-case-study .site-footer-actions');
  if (footerActions) {
    /* Use full viewport: -10% bottom (like main sections) can miss short blocks that
       only appear in the last strip of the screen — CTA stayed opacity: 0 forever. */
    var footerObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('site-footer-actions--in-view');
          }
        });
      },
      { rootMargin: '0px', threshold: 0 }
    );
    footerObserver.observe(footerActions);
  }

  // Problem section: model-mix bars animate from 0% when the stats block enters view
  var statsBars = document.querySelector('.page-case-study .cs-context__stats--bars');
  if (statsBars) {
    var fills = statsBars.querySelectorAll('.cs-progress-item__fill[data-progress]');
    var barObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          fills.forEach(function (fill) {
            var p = fill.getAttribute('data-progress');
            if (p !== '' && p != null) fill.style.width = p + '%';
          });
          barObserver.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    barObserver.observe(statsBars);
  }

  // Design Challenges accordion (expandable boxes)
  document.querySelectorAll('[data-accordion]').forEach(function (block) {
    var head = block.querySelector('.cs-challenge__head');
    var body = block.querySelector('.cs-challenge__body');
    if (!head || !body) return;

    head.addEventListener('click', function () {
      var isOpen = block.hasAttribute('data-open');
      if (isOpen) {
        block.removeAttribute('data-open');
        head.setAttribute('aria-expanded', 'false');
      } else {
        block.setAttribute('data-open', '');
        head.setAttribute('aria-expanded', 'true');
      }
    });
    head.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        head.click();
      }
    });
  });
})();
