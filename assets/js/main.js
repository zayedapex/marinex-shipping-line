  document.getElementById('navToggle').addEventListener('click', function(){
    document.getElementById('siteNav').classList.toggle('open');
  });

  // Hero slideshow — staggered vertical tile reveal
  // Directions rotate between slides (and tile speed/stagger vary each time):
  //   ltr  : tiles drop in left -> right
  //   rtl  : tiles drop in right -> left
  //   down : tiles drop in from the centre outwards
  //   up   : tiles rise from the bottom, edges inwards
  (function(){
    var stage = document.querySelector('.hero-slides');
    var slides = document.querySelectorAll('.hero-slide');
    var texts = document.querySelectorAll('.hero-text');
    var dots = document.querySelectorAll('.hero-dot');
    var prevBtn = document.querySelector('.hero-prev');
    var nextBtn = document.querySelector('.hero-next');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var total = slides.length;
    var timer, busy = false, finishNow = null, lastDir = null;

    var DIRS = {
      ltr:  { fromBottom:false, rank:function(i,n){ return i; } },
      rtl:  { fromBottom:false, rank:function(i,n){ return n-1-i; } },
      down: { fromBottom:false, rank:function(i,n){ return Math.abs(i-(n-1)/2); } },
      up:   { fromBottom:true,  rank:function(i,n){ return Math.min(i, n-1-i); } }
    };
    var NAMES = Object.keys(DIRS);

    function rand(min, max){ return min + Math.random()*(max-min); }
    function pickDir(){
      if(lastDir === null) return 'ltr';              // first change is always left-to-right
      var pool = NAMES.filter(function(d){ return d !== lastDir; });
      return pool[Math.floor(Math.random()*pool.length)];
    }
    function showText(i){
      texts.forEach(function(t, k){ t.classList.toggle('is-active', k === i); });
    }
    function showDot(i){
      dots.forEach(function(d, k){ d.classList.toggle('is-active', k === i); });
    }
    function activate(i){
      slides.forEach(function(s, k){ s.classList.toggle('is-active', k === i); });
    }

    function goTo(index, dir){
      index = (index + total) % total;
      if(index === current) return;
      if(busy && finishNow) finishNow();

      var from = current;
      current = index;
      showDot(index);

      if(reduceMotion){ activate(index); showText(index); return; }

      dir = dir || pickDir();
      lastDir = dir;
      var cfg = DIRS[dir];

      var W = stage.clientWidth, H = stage.clientHeight;
      var n = W < 640 ? 6 : (W < 1100 ? 8 : 10);
      var tileW = W / n;
      var dur = rand(0.8, 1.35);                       // per-tile time
      var step = rand(0.05, 0.085);                    // delay between tiles
      var src = slides[index].querySelector('img').currentSrc || slides[index].querySelector('img').src;

      var wrap = document.createElement('div');
      wrap.className = 'hero-tiles';
      wrap.style.setProperty('--tile-dur', dur.toFixed(2) + 's');
      var maxRank = 0, tiles = [];
      for(var i = 0; i < n; i++){
        var rank = cfg.rank(i, n);
        if(rank > maxRank) maxRank = rank;
        var tile = document.createElement('div');
        tile.className = 'hero-tile' + (cfg.fromBottom ? ' from-bottom' : '');
        tile.style.left = (i*tileW) + 'px';
        tile.style.width = (tileW + 1) + 'px';         // 1px overlap hides sub-pixel seams
        var img = document.createElement('img');
        img.alt = ''; img.src = src;
        img.style.left = (-i*tileW) + 'px';
        img.style.width = W + 'px';
        img.style.height = H + 'px';
        tile.appendChild(img);
        tile._rank = rank;
        wrap.appendChild(tile);
        tiles.push(tile);
      }
      stage.appendChild(wrap);
      busy = true;

      var textTimer = setTimeout(function(){ showText(index); }, 380);
      var endTimer;
      finishNow = function(){
        clearTimeout(textTimer); clearTimeout(endTimer);
        activate(index); showText(index);
        if(wrap.parentNode) wrap.parentNode.removeChild(wrap);
        busy = false; finishNow = null;
      };

      // texts of the outgoing slide leave right away
      texts[from].classList.remove('is-active');

      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          tiles.forEach(function(t){
            t.style.transitionDelay = (t._rank*step).toFixed(3) + 's';
            t.classList.add('go');
          });
        });
      });
      endTimer = setTimeout(finishNow, (dur + maxRank*step)*1000 + 120);
    }
    function next(){ goTo(current + 1); }
    function prev(){ goTo(current - 1, 'rtl'); }
    function restartAutoplay(){
      clearInterval(timer);
      timer = setInterval(next, 6500);
    }

    if(total > 1){
      dots.forEach(function(dot, i){
        dot.addEventListener('click', function(){ goTo(i, i < current ? 'rtl' : null); restartAutoplay(); });
      });
      nextBtn.addEventListener('click', function(){ next(); restartAutoplay(); });
      prevBtn.addEventListener('click', function(){ prev(); restartAutoplay(); });
      restartAutoplay();
    }
  })();

  // Scroll progress bar
  var progressBar = document.getElementById('progressBar');
  window.addEventListener('scroll', function(){
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });

  // Scroll-reveal for content blocks (including staggered groups)
  var revealEls = document.querySelectorAll('.reveal, .reveal-group');
  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        revealObs.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealEls.forEach(function(el){ revealObs.observe(el); });
  // Simple counter animation for stats (animates only the leading number)
  document.querySelectorAll('.stat .num').forEach(function(el){
    var node = el.childNodes[0];
    if(!node || node.nodeType !== 3) return;
    var target = parseInt(node.textContent.replace(/,/g, ''), 10);
    if(isNaN(target)) return;
    var useComma = node.textContent.indexOf(',') !== -1;
    var step = Math.max(1, Math.round(target/40));
    var current = 0;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var tick = setInterval(function(){
            current += step;
            if(current >= target){ current = target; clearInterval(tick); }
            node.textContent = useComma ? current.toLocaleString('en-US') : String(current);
          }, 25);
          obs.unobserve(el);
        }
      });
    }, {threshold:0.4});
    obs.observe(el);
  });

  // Quote form submission (works automatically once hosted on Netlify;
  // see the comment at the bottom of this file for other hosts)
  var quoteForm = document.getElementById('quoteForm');
  if(quoteForm){
    quoteForm.addEventListener('submit', function(e){
      e.preventDefault();
      var formEl = quoteForm;
      var confirmEl = formEl.querySelector('.confirm');
      var errorEl = formEl.querySelector('.form-error');
      var submitBtn = formEl.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var data = new FormData(formEl);
      var encoded = new URLSearchParams(data).toString();

      fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: encoded
      })
      .then(function(response){
        if(response.ok){
          confirmEl.style.display = 'block';
          errorEl.style.display = 'none';
          formEl.reset();
        } else {
          throw new Error('Submission failed');
        }
      })
      .catch(function(){
        errorEl.style.display = 'block';
        confirmEl.style.display = 'none';
      })
      .finally(function(){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Request';
      });
    });
  }
