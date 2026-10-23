(() => {
  const ORDER = ['sudut-pnj','majalah','euphoria','3d','ruang-suci','chatime','ebook','lebaran-kamera','stop-harassment','pena','paskah','dirgahayu','monopoli','kenaikan','ardentia','food-waste','mono-life','kuliah-umum','waisak','gabut','idul-adha','bakulan','jumat-agung','risol','tahun-baru-islam','infografis','last-day','pasca-ramadhan','pesan-bisa','donasi','forum-kerohanian','ppdb','forum-koordinasi','mpls'];
  const POSTS = (window.WORKS || []).slice().sort((a, b) => (ORDER.indexOf(a.id) + 1 || 99) - (ORDER.indexOf(b.id) + 1 || 99));
  const EXTRA = [{ id: 'serti', t: 'Sertifikat Panitia', c: 'Kuliah Umum TRCG3D', cat: 'event', y: '2026', d: 'Sertifikat penghargaan sebagai panitia kuliah umum The Future of Printing.', f: [['serti', 720, 509]] }];
  const READ = new Set(['ebook']); // dibuka di reader atas-bawah, bukan carousel
  const byId = Object.fromEntries([...POSTS, ...EXTRA].map(p => [p.id, p]));
  const CATS = [
    ['all', 'Semua', null], ['social', 'Social Media', 'bem-65'], ['editorial', 'Editorial', 'majalh-p1'],
    ['poster', 'Poster', 'chatime-1'], ['event', 'Event', 'bem-callou'], ['3d', '3D', '3d-1']
  ];
  const CAT_NAME = { all: 'Semua', social: 'Social Media', editorial: 'Editorial', poster: 'Poster & Iklan', event: 'Event', '3d': '3D' };
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Device tier (decided in <head>) ---------- */
  const lite = !root.classList.contains('js');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const wide = () => innerWidth >= 900;
  root.classList.toggle('touch', !fine);
  const smooth = lite ? 'auto' : 'smooth';

  /* ---------- Images: 4 sizes per design, the browser picks ---------- */
  const src = (s, v = '') => `assets/work/${s}${v}.webp`;
  const srcset = (s, w, h) => {
    const m = Math.max(w, h) || 720, r = x => Math.round((w * x) / m);
    return `${src(s, '-xs')} ${r(220)}w, ${src(s, '-sm')} ${w}w, ${src(s, '-md')} ${r(1080)}w, ${src(s)} ${r(1800)}w`;
  };


  /* ---------- Slider helpers ---------- */
  const slideIndex = t => Math.round(t.scrollLeft / Math.max(t.clientWidth, 1));
  const goTo = (t, i, behavior = smooth) => t.scrollTo({ left: Math.max(0, Math.min(i, t.children.length - 1)) * t.clientWidth, behavior });
  function draggable(track) {
    let down = false, x0 = 0, s0 = 0, moved = false;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
    });
    const move = e => {
      if (!down) return;
      const dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
      if (moved) track.scrollLeft = s0 - dx;
    };
    const up = e => {
      if (!down) return; down = false;
      if (!moved) return;
      const dx = e.clientX - x0, w = track.clientWidth, start = Math.round(s0 / w);
      track.classList.remove('dragging');
      goTo(track, Math.abs(dx) > w * 0.15 ? start + (dx < 0 ? 1 : -1) : start);
      setTimeout(() => (moved = false), 0);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    track.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
  }

  /* ---------- Post component (feed + viewer) ---------- */
  const heartSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.2 3.4 4.5 7 4.5c2.1 0 3.6 1.1 5 2.9 1.4-1.8 2.9-2.9 5-2.9 3.6 0 5.5 3.7 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>';
  const chev = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`;
  const bookSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5m0-13c2-1.5 5-2 9-1.5v13c-4-.5-7 0-9 1.5m0-13v13" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  function postHTML(p, { eager = false, thumbs = false } = {}) {
    const book = READ.has(p.id), pages = p.f.length;
    const f = book ? p.f.slice(0, 1) : p.f; // e-book: cover saja, halaman dibaca di reader
    const [, w, h] = f[0], n = f.length;
    const slides = f.map(([s, sw, sh], k) =>
      `<div class="post-slide"><img src="${src(s, '-sm')}" srcset="${srcset(s, sw, sh)}" sizes="(max-width: 899px) 100vw, 62vw" alt="${esc(p.t)}, ${k + 1} dari ${n}" ${eager && k === 0 ? '' : 'loading="lazy"'} decoding="async" draggable="false"></div>`).join('');
    const dots = n > 1 && n <= 12 ? `<div class="dots">${f.map((_, k) => `<i${k ? '' : ' class="on"'}></i>`).join('')}</div>` : '<div class="dots"></div>';
    const th = thumbs && n > 1 ? `<div class="pv-thumbs">${f.map(([s], k) => `<button aria-label="Slide ${k + 1}"${k ? '' : ' class="on"'}><img src="${src(s, '-xs')}" alt="" loading="lazy"></button>`).join('')}</div>` : '';
    return `<article class="post" data-id="${p.id}">
      <header class="post-head">
        <span class="post-avatar"><img src="assets/foto-sm.webp" alt="" loading="lazy"></span>
        <span class="post-who"><b>Fathir Anafi</b><span>${esc(p.c)}</span></span>
        <span class="post-cat">${CAT_NAME[p.cat]}</span>
      </header>
      <div class="post-media" style="--ar:${w}/${h}">
        <div class="post-track">${slides}</div>
        ${n > 1 ? `<span class="post-count"><b>1</b>/${n}</span>
        <button class="pm-arrow prev" aria-label="Slide sebelumnya" hidden>${chev('M15 5l-7 7 7 7')}</button>
        <button class="pm-arrow next" aria-label="Slide berikutnya">${chev('M9 5l7 7-7 7')}</button>` : ''}
        ${book ? `<button class="post-read" data-read="${p.id}">${bookSvg}Baca e-book · ${pages} halaman</button>` : ''}
        <span class="heart" aria-hidden="true">${heartSvg.replace('<path', '<path fill="currentColor"')}</span>
      </div>
      <div class="post-actions">
        <button class="like" aria-pressed="false" aria-label="Suka">${heartSvg}</button>
        ${dots}
        <span class="post-year">${p.y}</span>
      </div>
      <div class="post-caption"><b>${esc(p.t)}</b><span>${esc(p.d)}</span>${th}</div>
    </article>`;
  }
  function bindPost(el, start = 0) {
    const track = el.querySelector('.post-track'), n = track.children.length;
    const like = el.querySelector('.like'), heart = el.querySelector('.heart');
    const setLike = on => like.setAttribute('aria-pressed', on);
    like.addEventListener('click', () => setLike(like.getAttribute('aria-pressed') !== 'true'));
    // double tap / double click to like, like Instagram
    let lastTap = 0;
    const burst = () => { setLike(true); heart.classList.remove('pop'); void heart.offsetWidth; heart.classList.add('pop'); };
    track.addEventListener('dblclick', burst);
    track.addEventListener('touchend', e => {
      const now = Date.now();
      if (now - lastTap < 300 && e.changedTouches.length === 1) { burst(); lastTap = 0; } else lastTap = now;
    }, { passive: true });
    if (n < 2) return { track, go: () => {}, idx: () => 0 };

    const count = el.querySelector('.post-count b'), dots = [...el.querySelectorAll('.dots i')];
    const prev = el.querySelector('.pm-arrow.prev'), next = el.querySelector('.pm-arrow.next');
    const thumbs = [...el.querySelectorAll('.pv-thumbs button')];
    let cur = -1;
    const update = () => {
      const i = slideIndex(track); if (i === cur) return; cur = i;
      count.textContent = i + 1;
      dots.forEach((d, k) => d.classList.toggle('on', k === i));
      thumbs.forEach((t, k) => t.classList.toggle('on', k === i));
      prev.hidden = i === 0; next.hidden = i === n - 1;
    };
    track.addEventListener('scroll', update, { passive: true });
    prev.addEventListener('click', () => goTo(track, slideIndex(track) - 1));
    next.addEventListener('click', () => goTo(track, slideIndex(track) + 1));
    thumbs.forEach((t, k) => t.addEventListener('click', () => goTo(track, k)));
    if (fine) draggable(track);
    if (start) requestAnimationFrame(() => { goTo(track, start, 'auto'); update(); });
    return { track, go: d => goTo(track, slideIndex(track) + d), idx: () => slideIndex(track) };
  }

  /* ---------- Profile: highlights, grid, feed ---------- */
  const grid = $('grid'), feed = $('feed'), hls = $('highlights');
  let filter = 'all', view = 'grid';
  const list = () => (filter === 'all' ? POSTS : POSTS.filter(p => p.cat === filter));

  hls.innerHTML = CATS.map(([k, label, cover]) => {
    const img = cover ? src(cover, '-xs') : 'assets/foto-sm.webp';
    return `<button class="hl" role="tab" data-filter="${k}" aria-selected="${k === 'all'}"><span class="hl-ring"><img src="${img}" alt="" loading="lazy"></span><span>${label}</span></button>`;
  }).join('');
  hls.addEventListener('click', e => {
    const b = e.target.closest('.hl'); if (!b) return;
    filter = b.dataset.filter;
    hls.querySelectorAll('.hl').forEach(h => h.setAttribute('aria-selected', h === b));
    render();
  });

  const multiIcon = '<svg class="tile-multi" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h11a3 3 0 0 1 3 3v11a1 1 0 0 1-2 0V6a1 1 0 0 0-1-1H7a1 1 0 0 1 0-2zm-2 4h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/></svg>';
  let io = null;
  function renderGrid() {
    const L = list();
    grid.innerHTML = L.map((p, i) => {
      const [s, w, h] = p.f[0], n = p.f.length;
      const unit = p.cat === 'editorial' ? 'halaman' : p.cat === '3d' ? 'render' : 'slide';
      return `<button class="tile" data-post="${p.id}"${READ.has(p.id) ? ' data-cursor="Baca"' : ''} style="--i:${i % 9}" aria-label="${esc(p.t)}, ${n} ${unit}">
        <img src="${src(s, '-sm')}" srcset="${srcset(s, w, h)}" sizes="(max-width: 600px) 34vw, 330px" alt="" loading="lazy" decoding="async">
        ${n > 1 ? multiIcon : ''}
        <span class="tile-hover"><b>${esc(p.t)}</b><span>${n > 1 ? `${n} ${unit} · ` : ''}${p.y}</span></span>
      </button>`;
    }).join('');
    if (lite) return;
    // tiles slide in as they reach the viewport
    io && io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px' });
    grid.querySelectorAll('.tile').forEach(t => io.observe(t));
  }
  function renderFeed() {
    feed.innerHTML = list().map(p => postHTML(p)).join('');
    feed.querySelectorAll('.post').forEach(el => bindPost(el));
  }
  function render() {
    if (view === 'grid') renderGrid(); else renderFeed();
  }
  document.querySelectorAll('.ig-tab').forEach(t => t.addEventListener('click', () => {
    view = t.dataset.view;
    document.querySelectorAll('.ig-tab').forEach(x => x.setAttribute('aria-selected', x === t));
    grid.hidden = view !== 'grid'; feed.hidden = view !== 'feed';
    render();
  }));
  renderGrid();

  /* ---------- Post viewer ----------
     desktop: one post at a time (← → slides, ↑ ↓ posts); phones: a scrolling feed */
  const pv = $('pv'), body = $('pvBody');
  let pvList = [], pvAt = 0, single = null, lastFocus = null, pushed = false;

  function showSingle(i, start = 0) {
    pvAt = (i + pvList.length) % pvList.length;
    body.innerHTML = postHTML(pvList[pvAt], { eager: true, thumbs: true });
    single = bindPost(body.firstElementChild, start);
    $('pvPrev').hidden = $('pvNext').hidden = pvList.length < 2;
  }
  function openPost(id, start = 0) {
    const p = byId[id]; if (!p) return;
    const L = list();
    pvList = L.includes(p) ? L : POSTS.includes(p) ? POSTS : [p];
    const at = pvList.indexOf(p);
    lastFocus = document.activeElement;
    pv.hidden = false; document.body.classList.add('lock');
    if (wide()) {
      showSingle(at, start);
    } else {
      single = null;
      $('pvBarTitle').textContent = filter === 'all' || !L.includes(p) ? 'Postingan' : CAT_NAME[filter];
      body.innerHTML = `<div class="pv-feed">${pvList.map((q, k) => postHTML(q, { eager: Math.abs(k - at) < 2 })).join('')}</div>`;
      const posts = body.querySelectorAll('.post');
      posts.forEach((el, k) => bindPost(el, k === at ? start : 0));
      body.scrollTop = posts[at].offsetTop;
    }
    if (!pushed) { history.pushState({ pv: 1 }, ''); pushed = true; }
    pv.querySelector(wide() ? '.pv-close' : '.pv-back').focus({ preventScroll: true });
  }
  function closePost(fromPop) {
    if (pv.hidden) return;
    const fin = () => { pv.hidden = true; body.innerHTML = ''; document.body.classList.remove('lock'); lastFocus && lastFocus.focus({ preventScroll: true }); };
    fin();
    if (pushed) { pushed = false; if (!fromPop) history.back(); }
  }
  // the reader stacks its own history entry on top of the viewer's: only close when we've left both
  addEventListener('popstate', e => { if (pushed && !(e.state && e.state.pv)) { pushed = false; closePost(true); } });
  document.addEventListener('click', e => {
    const r = e.target.closest('[data-read]');
    if (r) { e.preventDefault(); return openReader(r.dataset.read); }
    const t = e.target.closest('[data-post]');
    if (!t || pv.contains(t)) return;
    e.preventDefault();
    READ.has(t.dataset.post) ? openReader(t.dataset.post) : openPost(t.dataset.post, +t.dataset.index || 0);
  });
  pv.addEventListener('click', e => { if (e.target.closest('[data-close]')) closePost(); });
  $('pvPrev').addEventListener('click', () => showSingle(pvAt - 1));
  $('pvNext').addEventListener('click', () => showSingle(pvAt + 1));
  document.addEventListener('keydown', e => {
    if (pv.hidden || !rd.hidden) return;
    if (e.key === 'Escape') return closePost();
    if (!single) return;
    const k = { ArrowRight: () => single.go(1), ArrowLeft: () => single.go(-1), ArrowDown: () => showSingle(pvAt + 1), ArrowUp: () => showSingle(pvAt - 1) }[e.key];
    if (k) { e.preventDefault(); k(); }
    if (e.key === 'Tab') {
      const f = [...pv.querySelectorAll('button')].filter(b => b.offsetParent);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  let lastWide = wide();
  addEventListener('resize', () => {
    if (pv.hidden || wide() === lastWide) { lastWide = wide(); return; }
    lastWide = wide();
    const p = pvList[pvAt]; closePost(); if (p) setTimeout(() => openPost(p.id), 250);
  });

  /* ---------- E-book reader ----------
     halaman ditumpuk; tiap satu langkah scroll, halaman teratas terangkat lalu hilang */
  const rd = $('rd'), rdScroll = $('rdScroll'), rdTrack = $('rdTrack'), rdPages = $('rdPages'), rdEnd = $('rdEnd');
  let book = null, pages = [], stepH = 1, cur = -1, rdPushed = false, rdFocus = null, rdRaf = 0;
  const clamp01 = x => Math.max(0, Math.min(1, x));

  function rdLayout() {
    stepH = Math.round(rdScroll.clientHeight * 0.8);
    rdTrack.style.height = pages.length * stepH + rdScroll.clientHeight + 'px';
    rdTrack.querySelectorAll('.rd-snap').forEach((m, k) => (m.style.top = k * stepH + 'px'));
  }
  function openReader(id) {
    const p = byId[id]; if (!p) return;
    book = p; rdFocus = document.activeElement;
    const n = p.f.length;
    $('rdTitle').textContent = p.t;
    $('rdSub').textContent = `${p.c} · ${n} halaman`;
    $('rdTotal').textContent = n;
    $('rdEndT').textContent = p.t;
    // gambar baru dimuat saat halaman hampir sampai di atas tumpukan
    rdPages.innerHTML = p.f.map(([s, w, h], k) =>
      `<figure class="rd-page" style="z-index:${n - k}"><img data-src="${src(s, '-md')}" data-srcset="${srcset(s, w, h)}" sizes="(max-width: 600px) 100vw, 640px" alt="${esc(p.t)}, halaman ${k + 1}" decoding="async" draggable="false"></figure>`).join('');
    pages = [...rdPages.children]; cur = -1;
    rdTrack.querySelectorAll('.rd-snap').forEach(m => m.remove());
    rdTrack.insertAdjacentHTML('afterbegin', Array.from({ length: n + 1 }, () => '<span class="rd-snap"></span>').join(''));

    rd.hidden = false; rd.classList.remove('closing', 'done');
    if (!lite) { rd.classList.remove('opening'); void rd.offsetWidth; rd.classList.add('opening'); }
    $('rdHint').classList.remove('gone');
    document.body.classList.add('lock');
    rdLayout();
    rdScroll.scrollTop = 0;
    rdUpdate();
    if (!lite && rdPages.animate) rdPages.animate([{ opacity: 0, transform: 'translateY(80px) rotate(-3deg) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 80, easing: EASE_OUT, fill: 'backwards' });

    history.pushState({ rd: 1 }, ''); rdPushed = true;
    rdScroll.focus({ preventScroll: true });
  }
  function closeReader(fromPop) {
    if (rd.hidden) return;
    const fin = () => {
      rd.hidden = true; rd.classList.remove('closing', 'opening'); rdPages.innerHTML = ''; pages = [];
      if (pv.hidden) document.body.classList.remove('lock');
      rdFocus && rdFocus.focus({ preventScroll: true });
    };
    if (lite) fin(); else { rd.classList.add('closing'); setTimeout(fin, 280); }
    if (rdPushed) { rdPushed = false; if (!fromPop) history.back(); }
  }
  addEventListener('popstate', e => { if (rdPushed && !(e.state && e.state.rd)) { rdPushed = false; closeReader(true); } });

  function rdUpdate() {
    rdRaf = 0;
    const n = pages.length; if (!n) return;
    const s = rdScroll.scrollTop / stepH; // 0 = halaman 1 di atas, n = semua sudah terbalik
    pages.forEach((el, k) => {
      const out = clamp01(s - k), depth = Math.max(0, k - s);
      if (depth < 3.2) { const img = el.firstElementChild; if (img.dataset.src) { img.srcset = img.dataset.srcset; img.src = img.dataset.src; delete img.dataset.src; } }
      if (out >= 1 || depth > 3) { el.style.visibility = 'hidden'; return; }
      el.style.visibility = '';
      let t, o = 1;
      if (out > 0) {
        // terangkat ke atas sambil miring, bergantian kiri dan kanan, lalu memudar
        const dir = k % 2 ? 1 : -1, e = out * out * (3 - 2 * out);
        t = `translate(${(dir * e * 28).toFixed(2)}%, ${(-e * 115).toFixed(2)}%) rotate(${(dir * e * 14).toFixed(2)}deg) rotateX(${(e * 18).toFixed(2)}deg)`;
        o = 1 - clamp01((out - 0.35) / 0.65);
      } else {
        // di belakang: sedikit lebih kecil dan turun, maju saat halaman di atasnya pergi
        const d = Math.min(depth, 3);
        t = `translateY(${(d * 16).toFixed(1)}px) scale(${(1 - d * 0.045).toFixed(4)})`;
        if (depth > 2) o = clamp01(3 - depth);
      }
      el.style.transform = t; el.style.opacity = o;
      el.style.setProperty('--shade', (Math.min(depth, 3) * 0.12).toFixed(3));
    });
    const endO = clamp01((s - (n - 0.6)) / 0.6);
    rdEnd.style.opacity = endO; rdEnd.classList.toggle('on', endO > 0.05);
    rd.classList.toggle('done', endO > 0.5);
    $('rdProg').style.transform = `scaleX(${clamp01(s / n)})`;
    if (s > 0.15) $('rdHint').classList.add('gone');
    const now = Math.min(n, Math.round(s) + 1);
    if (now !== cur) { cur = now; $('rdNow').textContent = now; }
  }
  rdScroll.addEventListener('scroll', () => { if (!rdRaf) rdRaf = requestAnimationFrame(rdUpdate); }, { passive: true });
  addEventListener('resize', () => { if (rd.hidden) return; const s = rdScroll.scrollTop / stepH; rdLayout(); rdScroll.scrollTop = s * stepH; rdUpdate(); });

  const flip = d => rdScroll.scrollTo({ top: Math.max(0, Math.min(pages.length, Math.round(rdScroll.scrollTop / stepH) + d)) * stepH, behavior: smooth });
  rdPages.addEventListener('click', e => { if (e.target.closest('.rd-page')) flip(1); }); // ketuk halaman = balik
  $('rdAgain').addEventListener('click', () => rdScroll.scrollTo({ top: 0, behavior: smooth }));
  rd.addEventListener('click', e => { if (e.target.closest('[data-rd-close]')) closeReader(); });
  document.addEventListener('keydown', e => {
    if (rd.hidden) return;
    if (e.key === 'Escape') return closeReader();
    const k = { ArrowDown: 1, PageDown: 1, ArrowRight: 1, ArrowUp: -1, PageUp: -1, ArrowLeft: -1, ' ': e.shiftKey ? -1 : 1 }[e.key];
    if (k && !(e.key === ' ' && e.target.closest('button'))) { e.preventDefault(); flip(k); }
    if (e.key === 'Home') { e.preventDefault(); rdScroll.scrollTo({ top: 0, behavior: smooth }); }
    if (e.key === 'End') { e.preventDefault(); flip(pages.length); }
    if (e.key === 'Tab') {
      const f = [...rd.querySelectorAll('button')].filter(b => b.offsetParent && getComputedStyle(b).visibility !== 'hidden');
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Smooth anchor scrolling (navbar, "kembali ke atas", buttons) ---------- */
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let scrollAnim = 0;
  function smoothTo(y) {
    cancelAnimationFrame(scrollAnim);
    const from = scrollY, dist = y - from;
    if (lite || Math.abs(dist) < 2) return scrollTo(0, y);
    const dur = Math.min(1400, 500 + Math.abs(dist) * 0.25), t0 = performance.now();
    const step = now => {
      const t = Math.min(1, (now - t0) / dur);
      scrollTo(0, from + dist * easeInOut(t));
      if (t < 1) scrollAnim = requestAnimationFrame(step);
    };
    scrollAnim = requestAnimationFrame(step);
  }
  // stop the animation as soon as the user scrolls by hand
  ['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, () => cancelAnimationFrame(scrollAnim), { passive: true }));
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute('href').slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el && id !== 'top') return;
    e.preventDefault();
    const navH = $('nav').offsetHeight;
    smoothTo(id === 'top' || !el ? 0 : Math.max(0, el.getBoundingClientRect().top + scrollY - (id === 'top' ? 0 : navH - 1)));
  });

  /* ---------- Perjalanan: animated + / − accordion ---------- */
  const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)', EASE_IN = 'cubic-bezier(.4, 0, .2, 1)';
  document.querySelectorAll('.job').forEach(d => {
    const body = d.querySelector('.job-body');
    d.querySelector('summary').addEventListener('click', e => {
      if (lite || !body.animate) return; // native toggle
      e.preventDefault();
      if (d.dataset.busy) return;
      d.dataset.busy = 1;
      const done = () => delete d.dataset.busy;
      if (!d.open) {
        d.open = true;
        const h = body.scrollHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 550, easing: EASE_OUT }).onfinish = done;
        body.querySelectorAll('li').forEach((li, i) =>
          li.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 120 + i * 70, easing: EASE_OUT, fill: 'backwards' }));
      } else {
        d.classList.add('closing');
        body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 380, easing: EASE_IN }).onfinish = () => {
          d.open = false; d.classList.remove('closing'); done();
        };
      }
    });
  });

  /* ---------- Hero index → filter the grid ---------- */
  document.querySelectorAll('[data-cat-link]').forEach(a => a.addEventListener('click', () => {
    const hl = hls.querySelector(`[data-filter="${a.dataset.catLink}"]`);
    if (hl) hl.click();
  }));

  /* ---------- Business card: tap to flip ---------- */
  const card = $('bizcard');
  if (card) card.addEventListener('click', () => card.classList.toggle('flip'));

  /* ---------- Copy ---------- */
  document.querySelectorAll('.copy').forEach(btn => btn.addEventListener('click', () => {
    const ok = () => { btn.textContent = 'Tersalin'; setTimeout(() => (btn.textContent = 'Salin'), 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(btn.dataset.copy).then(ok, () => {});
  }));

  /* ---------- Nav + progress ---------- */
  const nav = $('nav'), prog = $('progress');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY, h = root.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', y > 20);
      prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      ticking = false;
    });
  }, { passive: true });

  /* ---------- Cursor (desktop) ---------- */
  if (fine && !lite) {
    const c = $('cursor'), label = $('cursorLabel');
    let x = -100, y = -100, cx = x, cy = y, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
      c.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); }, { passive: true });
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('.tile, .post-track, [data-cursor]');
      const multi = t && t.classList.contains('post-track') && t.children.length > 1;
      const big = t && (!t.classList.contains('post-track') || multi);
      c.classList.toggle('big', !!big);
      c.classList.toggle('hide', !big && !!e.target.closest('a, button, summary'));
      if (big) label.textContent = t.dataset.cursor || (multi ? 'Geser' : 'Lihat');
    });
  }

  /* ---------- Lite: berhenti di sini, semua langsung terlihat ---------- */
  const loader = $('loader');
  if (lite) { loader.classList.add('gone'); return; }

  /* ---------- Gerak: CSS + IntersectionObserver, tanpa library ----------
     JS cuma menambah kelas; animasinya (transform & opacity) dikerjakan browser di GPU */
  let ci = 0;
  document.querySelectorAll('[data-split]').forEach(w => (w.innerHTML = [...w.textContent].map(ch => `<span class="char" style="--ci:${ci++}">${ch}</span>`).join('')));
  document.querySelectorAll('[data-reveal]').forEach(el => (el.innerHTML = `<span class="rv">${el.innerHTML}</span>`));
  // urutan muncul (stagger) untuk anak-anak dalam satu grup
  const groups = ['.highlights', '.ticket dl', '.jobs', '.pubs', '.big-cta', '.hero-index ol'];
  groups.forEach(g => document.querySelectorAll(g).forEach(el => { el.classList.add('stg'); [...el.children].forEach((c, i) => c.style.setProperty('--i', i)); }));
  document.querySelectorAll('.hero [data-fade]').forEach((el, i) => el.style.setProperty('--d', (0.35 + i * 0.08).toFixed(2) + 's'));

  function start() {
    root.classList.add('ready');
    try { sessionStorage.setItem('fa:seen', '1'); } catch {}
    const seenIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); seenIO.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-fade], [data-reveal], .stg, .bizcard-wrap').forEach(el => seenIO.observe(el));
  }

  /* ---------- Loader: hanya kunjungan pertama, sesingkat mungkin ---------- */
  if (root.classList.contains('seen')) { loader.classList.add('gone'); start(); return; }
  const bar = $('loaderBar'), num = $('loaderCount');
  const heroImg = document.querySelector('.hero-photo img');
  let imgOk = heroImg.complete, fontOk = !document.fonts, shown = 0;
  if (!imgOk) ['load', 'error'].forEach(ev => heroImg.addEventListener(ev, () => (imgOk = true), { once: true }));
  if (document.fonts) document.fonts.ready.then(() => (fontOk = true));
  const t0 = performance.now(), minT = wide() ? 650 : 350, maxT = 1400;
  (function tick(now) {
    const el = now - t0;
    const real = (imgOk ? 60 : 20) + (fontOk ? 40 : 0);
    const goal = el > maxT ? 100 : Math.min(real, (el / minT) * 100);
    shown += (goal - shown) * 0.2;
    if (goal >= 100 && shown > 99.3) shown = 100;
    num.textContent = Math.round(shown);
    bar.style.transform = `scaleX(${shown / 100})`;
    if (shown >= 100) {
      loader.classList.add('done');
      setTimeout(() => loader.classList.add('gone'), 650);
      return start();
    }
    requestAnimationFrame(tick);
  })(t0);
})();
