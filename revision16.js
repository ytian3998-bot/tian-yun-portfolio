(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const hero = document.querySelector('.studio-hero');
  const upper = document.querySelector('.book-upper');
  const lower = document.querySelector('.book-lower');
  const animate = (el, frames, options) => {
    if (!reduced.matches && el?.animate) return el.animate(frames, options);
  };

  // Content is visible without JavaScript; motion is only added when it can run.
  if (scrollY < 100 && !hero?.classList.contains('closing-book')) {
    animate(upper, [{ transform: 'rotateX(-18deg)', opacity: .65 }, { transform: 'rotateX(0)', opacity: 1 }], { duration: 1000, easing: 'cubic-bezier(.2,.8,.2,1)' });
    animate(lower, [{ transform: 'rotateX(40deg)', opacity: .45 }, { transform: 'rotateX(-5deg)', opacity: 1 }], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' });
    document.querySelectorAll('.paper-note').forEach((el, i) => {
      const tilt = getComputedStyle(el).getPropertyValue('--tilt');
      animate(el, [{ transform: `translateY(25px) rotate(${tilt})`, opacity: 0 }, { transform: `translateY(0) rotate(${tilt})`, opacity: 1 }], { duration: 650, delay: 180 + i * 100, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
  }

  const revealItems = document.querySelectorAll('.section-head, .capabilities>article, .case-top, .proof, .footer-heading');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-read');
        if (target.getBoundingClientRect().top > 20 && !target.closest('.story-page') && ((innerWidth > 650 && finePointer.matches) || !target.matches('.proof'))) {
          const isPaper = target.matches('.proof');
          animate(target, [{ opacity: .12, transform: `translateY(${isPaper ? 21 : 16}px) ${isPaper ? 'rotateX(5deg)' : ''}` }, { opacity: 1, transform: 'none' }], { duration: innerWidth > 650 && finePointer.matches ? (isPaper ? 650 : 750) : 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
        observer.unobserve(target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -22px 0px' });
    revealItems.forEach(el => observer.observe(el));
  } else revealItems.forEach(el => el.classList.add('is-read'));

  document.querySelectorAll('.tactile').forEach(el => {
    let rect = null;
    const reset = () => {
      ['--rx', '--ry', '--tx', '--ty'].forEach(p => el.style.removeProperty(p));
      rect = null;
    };
    el.addEventListener('pointerenter', () => { rect = el.getBoundingClientRect(); });
    el.addEventListener('pointermove', e => {
      if (reduced.matches || !finePointer.matches || !rect) return;
      const x = (e.clientX - rect.left) / rect.width - .5;
      const y = (e.clientY - rect.top) / rect.height - .5;
      el.style.setProperty('--ry', `${x * 8}deg`);
      el.style.setProperty('--rx', `${-y * 8}deg`);
      el.style.setProperty('--tx', `${x * 3}px`);
      el.style.setProperty('--ty', `${-5 + y * 3}px`);
    });
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });

  const nav = document.querySelector('.chapter-nav');
  const marker = document.createElement('span');
  marker.className = 'nav-marker';
  marker.setAttribute('aria-hidden', 'true');
  nav.prepend(marker);
  nav.classList.add('motion-tabs');
  let navFrame = 0;
  function placeMarker() {
    navFrame = 0;
    const active = nav.querySelector('a.active');
    if (!active) return;
    marker.style.width = `${active.offsetWidth}px`;
    marker.style.transform = `translateX(${active.offsetLeft}px)`;
  }
  const updateMarker = () => { if (!navFrame) navFrame = requestAnimationFrame(placeMarker); };
  const navObserver = new MutationObserver(updateMarker);
  nav.querySelectorAll('a').forEach(a => navObserver.observe(a, { attributes: true, attributeFilter: ['class'] }));
  addEventListener('resize', updateMarker);
  document.fonts?.ready.then(() => { updateMarker(); });
  updateMarker();

  document.querySelector('#gallery-image').addEventListener('load', e => {
    if (document.querySelector('#gallery-dialog').open) animate(e.target, [{ opacity: .3 }, { opacity: 1 }], { duration: 220, easing: 'ease-out' });
  });

  const choices = [...document.querySelectorAll('.chat-checklist input')];
  const mail = document.querySelector('#chat-mail');
  const updateMail = () => {
    const selected = choices.filter(el => el.checked).map(el => el.value);
    mail.href = 'mailto:ytian3998@gmail.com' + (selected.length ? `?subject=${encodeURIComponent('想和田韵聊聊：' + selected.join('、'))}` : '');
    mail.textContent = selected.length ? `选好了，聊聊吧 ↗` : '那就聊聊吧 ↗';
  };
  choices.forEach(el => el.addEventListener('change', updateMail));

  const stub = document.querySelector('.ticket-stub');
  const status = document.querySelector('#ticket-status');
  let drag = null, ignoreClick = false;
  async function tear() {
    stub.classList.remove('dragging');
    stub.style.removeProperty('transform');
    stub.classList.add('torn');
    stub.setAttribute('aria-label', '再次复制田韵的邮箱');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText('ytian3998@gmail.com');
      status.textContent = '邮箱收好啦，期待你的消息 (｡•̀ᴗ-)✧';
    } catch {
      status.textContent = '我的邮箱：ytian3998@gmail.com，期待你的消息。';
    }
  }
  stub.addEventListener('pointerdown', e => {
    if (e.button !== 0 || stub.classList.contains('torn')) return;
    drag = { x: e.clientX, y: e.clientY, dx: 0, moved: false };
    stub.setPointerCapture(e.pointerId);
  });
  stub.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dy) > Math.abs(dx) + 8) { drag = null; return; }
    if (dx > 6) drag.moved = true;
    if (!drag.moved) return;
    drag.dx = Math.max(0, Math.min(80, dx));
    stub.classList.add('dragging');
    if (!reduced.matches) stub.style.transform = `translateX(${drag.dx}px) rotate(${drag.dx * .1}deg)`;
  });
  stub.addEventListener('pointerup', () => {
    if (!drag) return;
    const done = drag.dx > 34;
    ignoreClick = drag.moved;
    drag = null;
    stub.classList.remove('dragging');
    stub.style.removeProperty('transform');
    if (done) tear();
  });
  stub.addEventListener('pointercancel', () => {
    drag = null; ignoreClick = false;
    stub.classList.remove('dragging');
    stub.style.removeProperty('transform');
  });
  stub.addEventListener('click', () => {
    if (ignoreClick) { ignoreClick = false; return; }
    tear();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) document.getAnimations().forEach(animation => animation.cancel());
  });
})();
