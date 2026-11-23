(() => {
  const stage=document.querySelector('.book-stage');
  const book=stage?.querySelector('.field-book');
  const upper=book?.querySelector('.book-upper');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  if(!stage || !upper) return;
  let frame=0, height=0, upperHeight=0, distance=450, top=20;
  function measure(){
    height=book.offsetHeight;upperHeight=upper.offsetHeight;
    distance=innerWidth<651?320:450;
    top=Math.min(24,(innerHeight-height)/2);
    stage.style.setProperty('--book-height',height+'px');
    stage.style.setProperty('--book-collapse-space',Math.min(upperHeight*.6,320)+'px');
    stage.style.setProperty('--close-distance',distance+'px');
    stage.style.setProperty('--book-top',top+'px');
    update();
  }
  function update(){
    frame=0;
    const progress=reduced.matches?0:Math.max(0,Math.min(1,(top-stage.getBoundingClientRect().top)/distance));
    const eased=progress*progress*(3-2*progress);
    book.style.setProperty('--close-angle',(-180*eased)+'deg');
    // The hinged top becomes the closed cover; compensate its height so the
    // finished book stays in view instead of flipping below the viewport.
    book.style.setProperty('--book-lift',(-upperHeight*eased)+'px');
    book.style.setProperty('--book-scale',String(1-.08*eased));
    stage.dataset.closed=String(progress>.98);
  }
  addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(update)},{passive:true});
  addEventListener('resize',measure);
  reduced.addEventListener('change',measure);
  new ResizeObserver(measure).observe(upper);
  document.fonts?.ready.then(measure);
  measure();
})();
