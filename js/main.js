(function () {
  'use strict';

  var hero = document.getElementById('hero');
  var canvas = document.getElementById('hero-bg');
  if (!hero || !canvas) return;

  var ctx = canvas.getContext('2d');
  var width = 0;
  var height = 0;
  var mouseX = -1000;
  var mouseY = -1000;
  var time = 0;

  var ACCENT_COLORS = [
    'rgba(235, 0, 255, 0.28)',
    'rgba(0, 41, 255, 0.28)',
    'rgba(0, 133, 255, 0.28)',
    'rgba(0, 255, 255, 0.28)'
  ];

  // Blob size: viewport-relative so display is consistent (radius ~12–22% of smaller hero dimension, clamped)
  var MIN_RADIUS_PX = 80;
  var MAX_RADIUS_PX = 240;
  var MIN_RADIUS_FRAC = 0.12;
  var MAX_RADIUS_FRAC = 0.22;
  var WAYPOINT_DURATION_MIN = 2500;
  var WAYPOINT_DURATION_MAX = 5500;
  var BLOB_WOBBLE = 10;
  var BLOB_WOBBLE_FREQ = 5;
  var BLOB_WOBBLE_SPEED = 0.0018;
  var HOVER_SCALE = 1.04;
  var HOVER_LERP = 0.08;

  var BLOB_SVG_SIZE = 100;
  var blobPath2Ds = [];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function blobRadiusForViewport(w, h) {
    if (!w || !h) return 120;
    var side = Math.min(w, h);
    var rFrac = MIN_RADIUS_FRAC + Math.random() * (MAX_RADIUS_FRAC - MIN_RADIUS_FRAC);
    var r = side * rFrac;
    return Math.max(MIN_RADIUS_PX, Math.min(MAX_RADIUS_PX, r));
  }

  function pickNextWaypoint(blob) {
    var w = width || 800;
    var h = height || 600;
    var r = blob.radius;
    blob.waypointStartX = blob.x;
    blob.waypointStartY = blob.y;
    blob.waypointTargetX = rand(r, w - r);
    blob.waypointTargetY = rand(r, h - r);
    blob.waypointStartTime = Date.now();
    blob.waypointDuration = rand(WAYPOINT_DURATION_MIN, WAYPOINT_DURATION_MAX);
  }

  function initBlobs() {
    var out = [];
    var w = width || 800;
    var h = height || 600;
    for (var i = 0; i < 4; i++) {
      var r = blobRadiusForViewport(w, h);
      var x = rand(r, Math.max(r, w - r));
      var y = rand(r, Math.max(r, h - r));
      var blob = {
        x: x,
        y: y,
        color: ACCENT_COLORS[i],
        radius: r,
        svgIndex: i,
        hoverAmount: 0
      };
      blob.waypointStartX = x;
      blob.waypointStartY = y;
      blob.waypointTargetX = rand(r, Math.max(r, w - r));
      blob.waypointTargetY = rand(r, Math.max(r, h - r));
      blob.waypointStartTime = Date.now();
      blob.waypointDuration = rand(WAYPOINT_DURATION_MIN, WAYPOINT_DURATION_MAX);
      out.push(blob);
    }
    return out;
  }

  var blobs = [];

  function loadBlobSvgs(callback) {
    var base = 'images/blobs/blob-';
    var pending = 4;
    blobPath2Ds.length = 0;
    function onLoad() {
      pending--;
      if (pending === 0 && callback) callback();
    }
    for (var i = 1; i <= 4; i++) {
      (function (index) {
        var url = base + index + '.svg';
        fetch(url)
          .then(function (r) { return r.text(); })
          .then(function (svgText) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(svgText, 'image/svg+xml');
            var pathEl = doc.querySelector('path');
            var d = pathEl ? pathEl.getAttribute('d') : '';
            blobPath2Ds[index - 1] = d ? new Path2D(d) : null;
          })
          .catch(function () { blobPath2Ds[index - 1] = null; })
          .then(onLoad);
      })(i);
    }
  }

  function resize() {
    var rect = hero.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    blobs = initBlobs();
  }

  function updateBlob(blob) {
    var targetHover = hitTest(blob) ? 1 : 0;
    blob.hoverAmount += (targetHover - blob.hoverAmount) * HOVER_LERP;

    var now = Date.now();
    var elapsed = now - blob.waypointStartTime;
    var t = Math.min(1, elapsed / blob.waypointDuration);
    t = t * t * (3 - 2 * t);
    blob.x = blob.waypointStartX + (blob.waypointTargetX - blob.waypointStartX) * t;
    blob.y = blob.waypointStartY + (blob.waypointTargetY - blob.waypointStartY) * t;
    if (t >= 1) pickNextWaypoint(blob);
  }

  function hitTest(blob) {
    var dx = mouseX - blob.x;
    var dy = mouseY - blob.y;
    return dx * dx + dy * dy <= blob.radius * blob.radius;
  }

  function drawBlobFromPath(blob) {
    var path2d = blobPath2Ds[blob.svgIndex];
    if (!path2d) {
      drawBlobFallback(blob.x, blob.y, blob.radius, blob.color);
      return;
    }
    var scale = (blob.radius * 2) / BLOB_SVG_SIZE;
    var hoverScale = 1 + (HOVER_SCALE - 1) * blob.hoverAmount;
    ctx.save();
    ctx.translate(blob.x, blob.y);
    ctx.scale(scale * hoverScale, scale * hoverScale);
    ctx.translate(-BLOB_SVG_SIZE / 2, -BLOB_SVG_SIZE / 2);
    ctx.fillStyle = blob.color;
    ctx.fill(path2d);
    ctx.restore();
  }

  function drawBlobFallback(cx, cy, baseRadius, color) {
    var segments = 64;
    ctx.beginPath();
    for (var i = 0; i <= segments; i++) {
      var angle = (i / segments) * Math.PI * 2;
      var wobble = Math.sin(angle * BLOB_WOBBLE_FREQ + time * BLOB_WOBBLE_SPEED) * BLOB_WOBBLE;
      var r = baseRadius + wobble;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function draw() {
    time = Date.now();
    ctx.clearRect(0, 0, width, height);

    blobs.forEach(function (blob) {
      updateBlob(blob);
      drawBlobFromPath(blob);
    });

    requestAnimationFrame(draw);
  }

  function onMouseMove(e) {
    var rect = hero.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  }

  hero.addEventListener('mousemove', onMouseMove);
  hero.addEventListener('mouseleave', function () { mouseX = -1000; mouseY = -1000; });

  window.addEventListener('resize', resize);
  resize();
  loadBlobSvgs(function () {});
  requestAnimationFrame(draw);
})();

(function () {
  'use strict';
  var sections = document.querySelectorAll('main > section:not(.hero)');
  if (!sections.length) return;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('section--in-view');
          var grid = entry.target.querySelector('.bento__grid');
          if (grid) grid.classList.add('bento__grid--in-view');
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  );
  sections.forEach(function (el) { observer.observe(el); });
})();

(function () {
  'use strict';
  var progressTrack = document.querySelector('.reading-progress');
  var progressBar = document.querySelector('.reading-progress__bar');
  if (!progressTrack || !progressBar) return;
  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
    progressBar.style.width = pct + '%';
    progressTrack.setAttribute('aria-valuenow', Math.round(pct));
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

(function () {
  'use strict';
  var burstBox = document.querySelector('.about__specialty-box--accent-2');
  if (!burstBox) return;

  var PARTICLE_COUNT = 60;
  var baseStagger = 0.07;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function configureParticle(particle, index) {
    var angle = rand(0, Math.PI * 2);
    var distance = rand(26, 108);
    var dx = Math.cos(angle) * distance;
    var dy = Math.sin(angle) * distance;
    var delay = index * baseStagger + rand(0, 0.2);

    particle.style.setProperty('--dx', dx.toFixed(2) + 'px');
    particle.style.setProperty('--dy', dy.toFixed(2) + 'px');
    particle.style.setProperty('--size', rand(2, 24).toFixed(2) + 'px');
    particle.style.setProperty('--dur', rand(2.4, 3.4).toFixed(2) + 's');
    particle.style.setProperty('--delay', delay.toFixed(2) + 's');
    particle.style.setProperty('--tone', rand(56, 92).toFixed(0) + '%');
    particle.style.setProperty('--scale-end', rand(0.7, 1.45).toFixed(2));
  }

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    var particle = document.createElement('span');
    particle.className = 'about__burst-particle';
    configureParticle(particle, i);
    particle.addEventListener('animationiteration', (function (el, idx) {
      return function () {
        configureParticle(el, idx);
      };
    })(particle, i));
    burstBox.appendChild(particle);
  }
})();

(function () {
  'use strict';
  var footer = document.querySelector('footer.site-footer');
  var tagline = footer && footer.querySelector('h5.site-footer__tagline');
  if (!footer || !tagline) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  tagline.classList.add('site-footer__tagline--animate-ready');

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tagline.classList.add('site-footer__tagline--in-view');
        observer.disconnect();
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  observer.observe(footer);
})();

