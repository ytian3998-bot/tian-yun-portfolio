(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 650px)');
  const lightBook = matchMedia('(max-width: 650px), (hover: none) and (pointer: coarse)');
  const hero = document.querySelector('.closing-book');
  const stage = hero.querySelector('.book-stage');
  const book = stage.querySelector('.field-book');
  const upper = book.querySelector('.book-upper');
  const front = upper.querySelector('.book-front');
  const back = upper.querySelector('.book-back');
  const nav = document.querySelector('.chapter-nav');
  const bar = document.querySelector('.progress');
  const sections = [...document.querySelectorAll('section.section')];
  const navLinks = [...nav.querySelectorAll('a')];
  const story = document.querySelector('.story-layout');
  const pages = [...story.querySelectorAll('.story-page')];
  const storyLinks = [...story.querySelectorAll('.story-index a')];
  const mini = document.createElement('nav');
  mini.className = 'mobile-story-nav';
  mini.setAttribute('aria-label', 'AI 网站案例步骤');
  ['01 业务流程','02 报价核对','03 导游匹配'].forEach((label,i) => {
    const a=document.createElement('a');a.href='#'+pages[i].id;a.textContent=label;mini.append(a);
  });
  story.insertBefore(mini,story.querySelector('.story-pages'));
  const miniLinks=[...mini.children];
  const anchors=pages.map(page=>{
    const anchor=document.createElement('span');anchor.className='story-anchor';anchor.setAttribute('aria-hidden','true');page.before(anchor);return anchor;
  });
  const clamp = n => Math.max(0,Math.min(1,n));
  let frame=0,measureFrame=0,layout=null,lastProgress=-1,lastSection=-1,lastStep=-1,nearBook=false;
  const pageProgress=pages.map(()=>-1);
  const absoluteTop=el=>el.getBoundingClientRect().top+scrollY;
  const hingeTrigger=document.createElement('span');
  hingeTrigger.className='book-hinge-trigger';hingeTrigger.setAttribute('aria-hidden','true');stage.prepend(hingeTrigger);
  let hingeObserver=null,hingeAnimations=[],hingeKey='',hingeClosed=false;
  function setHinge(closed,instant=false){
    if(!instant&&closed===hingeClosed)return;
    hingeClosed=closed;stage.dataset.closed=String(closed);
    hingeAnimations.forEach(animation=>{
      if(instant){animation.pause();animation.currentTime=closed?560:0;}
      else {animation.playbackRate=closed?1:-1;animation.play();}
    });
  }
  function setupHinge(){
    const enabled=lightBook.matches&&!reduced.matches;
    const key=[enabled,layout.upperHeight,layout.top,layout.stageTop].join(':');
    if(key===hingeKey)return;
    hingeKey=key;hingeObserver?.disconnect();hingeAnimations.forEach(a=>a.cancel());hingeAnimations=[];
    hero.classList.toggle('touch-hinge',enabled);
    [book,upper,front,back].forEach(el=>el.style.removeProperty('transform'));
    if(!enabled)return;
    // One compositor animation per fold, rather than changing three large
    // surfaces on every touch-scroll frame. Reverse the same animation on return.
    const settings={duration:560,fill:'both',easing:'cubic-bezier(.25,.65,.3,1)'};
    hingeAnimations=[
      book.animate([{transform:'translate3d(0,0,0)'},{transform:`translate3d(0,${-layout.upperHeight}px,0)`}],settings),
      front.animate([{transform:'scaleY(1)',offset:0},{transform:'scaleY(0)',offset:.5},{transform:'scaleY(0)',offset:1}],settings),
      back.animate([{transform:'scaleY(0)',offset:0},{transform:'scaleY(0)',offset:.5},{transform:'scaleY(1)',offset:1}],settings)
    ];
    const triggerTop=150-layout.top;
    hingeTrigger.style.top=triggerTop+'px';
    setHinge(scrollY>layout.stageTop+triggerTop,true);
    hingeObserver=new IntersectionObserver(entries=>{
      const entry=entries[0];
      const outside=scrollY>layout.heroEnd+layout.viewport;
      setHinge(entry.boundingClientRect.top<0,outside);
    },{threshold:0});
    hingeObserver.observe(hingeTrigger);
  }

  function measure(){
    measureFrame=0;
    // Geometry is sampled only after a size/content change, never in a scroll frame.
    const height=book.offsetHeight, upperHeight=upper.offsetHeight, viewport=innerHeight;
    const top=Math.min(24,(viewport-height)/2), distance=lightBook.matches?340:450;
    stage.style.setProperty('--book-height',height+'px');
    stage.style.setProperty('--book-collapse-space',Math.min(upperHeight*.6,320)+'px');
    stage.style.setProperty('--close-distance',distance+'px');
    stage.style.setProperty('--book-top',top+'px');
    pages.forEach(page=>{
      page.dataset.tall=String(small.matches&&page.offsetHeight>viewport-160);
      page.style.setProperty('--story-top','78px');
    });
    layout={viewport,height,upperHeight,top,distance,stageTop:absoluteTop(stage),heroEnd:absoluteTop(hero)+hero.offsetHeight,
      sectionTops:sections.map(absoluteTop),pageTops:anchors.map(absoluteTop),pageHeights:pages.map(p=>p.offsetHeight),
      storyStart:absoluteTop(story),storyEnd:absoluteTop(story)+story.offsetHeight,
      max:Math.max(1,document.documentElement.scrollHeight-viewport)};
    setupHinge();
    lastProgress=-1;pageProgress.fill(-1);schedule();
  }
  function requestMeasure(){if(!measureFrame)measureFrame=requestAnimationFrame(measure);}
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function update(){
    frame=0;if(!layout)return;
    const y=scrollY,l=layout;
    const near=y>l.stageTop-l.viewport&&y<l.heroEnd+l.viewport*.2;
    if(near!==nearBook){nearBook=near;hero.classList.toggle('motion-near',near&&!reduced.matches);}
    const p=reduced.matches?0:clamp((y+l.top-l.stageTop)/l.distance);
    if(!lightBook.matches&&p!==lastProgress){
      lastProgress=p;
      const e=p*p*(3-2*p);
      book.style.transform=reduced.matches?'none':`translate3d(0,${(-l.upperHeight*e).toFixed(2)}px,0)${lightBook.matches?'':` scale(${1-.08*e})`}`;
      upper.style.transform=`rotateX(${-180*e}deg)`;
      stage.dataset.closed=String(p>.98);
    }
    nav.classList.toggle('cover-hidden',l.heroEnd-y>l.viewport*.55);
    bar.style.transform=`scaleX(${clamp(y/l.max).toFixed(5)})`;
    let section=0;
    l.sectionTops.forEach((top,i)=>{if(top-y<l.viewport*.4)section=i;});
    if(section!==lastSection){
      lastSection=section;
      navLinks.forEach((a,i)=>{a.classList.toggle('active',i===section);if(i===section)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    }
    if(y+l.viewport<l.storyStart||y>l.storyEnd)return;
    let active=0;
    pages.forEach((page,i)=>{
      const naturalTop=l.pageTops[i]-y;
      if(naturalTop<l.viewport*.47)active=i;
      const progress=reduced.matches?0:clamp((naturalTop-100)/(l.viewport*.8));
      if(progress===pageProgress[i])return;
      pageProgress[i]=progress;
      page.classList.toggle('motion-near',progress>0&&progress<1&&!reduced.matches);
      page.style.transform=reduced.matches?'none':small.matches
        ?`translate3d(0,${(progress*26).toFixed(2)}px,0) rotate(${(progress*1.2).toFixed(2)}deg)`
        :`perspective(1400px) rotateY(${(progress*18).toFixed(2)}deg) rotateZ(${(progress*1.6).toFixed(2)}deg)`;
    });
    if(active!==lastStep){
      lastStep=active;
      [storyLinks,miniLinks].forEach(links=>links.forEach((a,i)=>{a.classList.toggle('current',i===active);if(i===active)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');}));
    }
  }
  addEventListener('scroll',schedule,{passive:true});
  // Mobile browser chrome resizes visual height on every scroll. Ignore those
  // tiny changes; do remeasure an orientation or actual window-size change.
  let width=innerWidth,height=innerHeight;
  addEventListener('resize',()=>{if(innerWidth!==width||Math.abs(innerHeight-height)>140){width=innerWidth;height=innerHeight;requestMeasure();}});
  small.addEventListener('change',requestMeasure);lightBook.addEventListener('change',requestMeasure);reduced.addEventListener('change',requestMeasure);
  const observer=new ResizeObserver(requestMeasure);
  [front,...pages,document.querySelector('main')].forEach(e=>observer.observe(e));
  document.fonts?.ready.then(requestMeasure);
  addEventListener('load',requestMeasure,{once:true});
  measure();
})();
