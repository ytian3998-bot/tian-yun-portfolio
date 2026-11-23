(() => {
  // Warm only nearby previews; full-resolution evidence loads in the viewer.
  if (!('IntersectionObserver' in window)) return;
  const warm = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      target.loading='eager';
      warm.unobserve(target);
    }
  }, {rootMargin:'1200px 0px',threshold:0});
  document.querySelectorAll('main img[loading="lazy"]').forEach(img=>warm.observe(img));
})();
