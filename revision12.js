(()=>{
  const galleries=JSON.parse(document.querySelector('#gallery-data').textContent);
  const dlg=document.querySelector('#gallery-dialog'),stage=document.querySelector('#gallery-stage'),frame=document.querySelector('#gallery-frame'),img=document.querySelector('#gallery-image'),mark=document.querySelector('#gallery-highlight');
  const title=document.querySelector('#gallery-title'),caption=document.querySelector('#gallery-caption'),count=document.querySelector('#gallery-count'),thumbs=document.querySelector('#gallery-thumbs'),zoomButton=document.querySelector('#gallery-zoom');
  let current=null,index=0,zoom=false,opener=null,loadId=0;
  function fit(){
    if(!dlg.open||!img.naturalWidth||!current)return;
    const item=galleries[current].items[index];
    const [x,y,x1,y1,iw,ih]=item.crop||[0,0,img.naturalWidth,img.naturalHeight,img.naturalWidth,img.naturalHeight];
    const cw=x1-x,ch=y1-y,aw=stage.clientWidth-32,ah=stage.clientHeight-32;
    const scale=zoom?Math.max(1200/cw,1):Math.min(aw/cw,ah/ch,1.8);
    Object.assign(frame.style,{width:cw*scale+'px',height:ch*scale+'px'});
    Object.assign(img.style,{width:iw*scale+'px',height:ih*scale+'px',left:-x*scale+'px',top:-y*scale+'px'});
    mark.hidden=!item.highlight;
    if(item.highlight){const [top,height,total]=item.highlight;Object.assign(mark.style,{top:(top/total*ih-y)*scale+'px',height:height/total*ih*scale+'px'});}
  }
  function show(next){
    const g=galleries[current];index=Math.max(0,Math.min(g.items.length-1,next));zoom=false;zoomButton.textContent='放大阅读';
    const item=g.items[index];caption.textContent=item.caption;count.textContent=`${index+1} / ${g.items.length}`;img.alt=item.caption;
    document.querySelector('#gallery-original').href=item.src;
    document.querySelector('#gallery-prev').disabled=index===0;document.querySelector('#gallery-next').disabled=index===g.items.length-1;
    [...thumbs.children].forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-current',i===index?'true':'false')});
    const id=++loadId;img.onload=()=>{if(id===loadId){fit();stage.scrollTo(0,0)}};img.src=item.preview||item.src;
    if(item.preview){
      const original=new Image();original.decoding='async';
      original.onload=()=>{if(id===loadId&&dlg.open)img.src=item.src;};original.src=item.src;
    }
    if(img.complete)requestAnimationFrame(fit);
  }
  function open(key,page,button){
    current=key;opener=button;const g=galleries[key];title.textContent=g.title;thumbs.replaceChildren();
    g.items.forEach((item,i)=>{const b=document.createElement('button');b.type='button';b.textContent=i+1;b.title=item.caption;b.setAttribute('aria-label',`第 ${i+1} 页：${item.caption}`);b.addEventListener('click',()=>show(i));thumbs.append(b)});
    dlg.showModal();document.body.classList.add('dialog-open');show(page);requestAnimationFrame(fit);
  }
  document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.gallery,Number(button.dataset.index||0),button)));
  document.querySelector('#gallery-prev').addEventListener('click',()=>show(index-1));document.querySelector('#gallery-next').addEventListener('click',()=>show(index+1));
  zoomButton.addEventListener('click',()=>{zoom=!zoom;zoomButton.textContent=zoom?'适合窗口':'放大阅读';fit();stage.scrollTo(0,0)});
  dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}});
  window.addEventListener('resize',()=>requestAnimationFrame(fit));
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close()});
    dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');opener?.focus({preventScroll:true})});
  });
  const resume=document.querySelector('#resume-dialog');
  document.querySelectorAll('[data-resume]').forEach(button=>button.addEventListener('click',()=>{opener=button;resume.showModal();document.body.classList.add('dialog-open')}));
})();
