(() => {
  const story = document.querySelector('.scroll-story');
  if (!story) return;
  const pages = [...story.querySelectorAll('.story-page')];
  const links = [...story.querySelectorAll('.story-index a')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 651px)');
  let scheduled = false;
  function update() {
    scheduled = false;
    let active = 0;
    pages.forEach((page, index) => {
      const rect = page.getBoundingClientRect();
      if (rect.top < innerHeight * .47) active = index;
      if (reduced.matches || !wide.matches) {
        page.style.removeProperty('transform');
        page.style.removeProperty('--turn-shade');
        return;
      }
      // The incoming page visibly straightens as it reaches the reading position.
      const progress = Math.max(0, Math.min(1, (rect.top - 110) / (innerHeight * .72)));
      page.style.transform = `perspective(1400px) rotateY(${progress * 18}deg) rotateZ(${progress * 1.6}deg) translateX(${progress * 5}px)`;
      page.style.setProperty('--turn-shade', String(progress * .65));
    });
    links.forEach((link, index) => {
      link.classList.toggle('current', index === active);
      if (index === active) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduced.addEventListener('change', update);
  document.fonts?.ready.then(update);
  update();
})();
