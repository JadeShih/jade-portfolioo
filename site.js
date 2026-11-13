/* Jade Shih 作品集：全站共用程式；每段都會先檢查頁面上有沒有對應元素 */
(function(){
  var f=document.getElementById('heroFrame'),l=document.getElementById('frameSize');
  if(!f||!l||!('ResizeObserver' in window))return;
  new ResizeObserver(function(){l.textContent='Size '+Math.round(f.offsetWidth)+' × '+Math.round(f.offsetHeight)}).observe(f);
})();
/* 整頁 YOU 游標：只在有滑鼠、且沒開「減少動態效果」時啟用 */
(function(){
  var c=document.getElementById('ycur');
  if(!c||!window.matchMedia)return;
  var fine=matchMedia('(hover:hover) and (pointer:fine)'),calm=matchMedia('(prefers-reduced-motion: reduce)');
  if(!fine.matches||calm.matches)return;
  document.documentElement.classList.add('has-ycur');
  var x=-100,y=-100,queued=false;
  function draw(){queued=false;c.style.transform='translate3d('+(x-5)+'px,'+(y-3)+'px,0)'}
  document.addEventListener('mousemove',function(e){
    x=e.clientX;y=e.clientY;c.classList.add('is-on');
    c.classList.toggle('is-link',!!(e.target.closest&&e.target.closest('a,button,[role="button"],label,summary')));
    if(!queued){queued=true;requestAnimationFrame(draw)}
  },{passive:true});
  document.addEventListener('mouseleave',function(){c.classList.remove('is-on')});
  document.addEventListener('mousedown',function(){c.classList.add('is-down')});
  document.addEventListener('mouseup',function(){c.classList.remove('is-down')});
})();

/* 抵達提示：點貼紙或導覽捲到區塊後，標題做一次「關卡開始」動畫 */
(function(){
  function arrive(id){
    var t=document.getElementById(id);if(!t)return;
    var h=t.querySelector('.sec__title');if(!h)return;
    h.classList.remove('is-arriving');void h.offsetWidth;h.classList.add('is-arriving');
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
    var id=a.getAttribute('href').slice(1);if(!id||id==='top'||id==='main')return;
    var done=false;function go(){if(done)return;done=true;arrive(id)}
    if('onscrollend' in window){window.addEventListener('scrollend',go,{once:true});setTimeout(go,1600)}else setTimeout(go,800);
  });
  document.querySelectorAll('.sec__title').forEach(function(h){h.addEventListener('animationend',function(){h.classList.remove('is-arriving')})});
})();

/* 第一屏一定看得到完整的 Hero 框（含按鈕與下緣虛線）：字型載入後量實際位置，太低就把大標題縮小 */
(function(){
  var t=document.querySelector('.hero__title'),a=document.getElementById('heroFrame');
  if(!t||!a)return;
  function absBottom(el){var y=el.offsetHeight;while(el){y+=el.offsetTop;el=el.offsetParent}return y}
  var box=document.querySelector('.badges'),
      badges=box?[].slice.call(box.querySelectorAll('.badge')):[],
      btns=[].slice.call(document.querySelectorAll('.hero__actions a'));
  /* 以實際幾何檢查：含旋轉後的外框、上下漂浮的幅度；位置以頁面座標計算 */
  function geo(el){
    var f=a.getBoundingClientRect(),x=f.left+window.scrollX,y=f.top+window.scrollY,
        w=el.offsetWidth,h=el.offsetHeight,cx=x+el.offsetLeft+w/2,cy=y+el.offsetTop+h/2,
        deg=parseFloat(getComputedStyle(el).getPropertyValue('--r'))||0,rad=Math.abs(deg)*Math.PI/180,
        hw=(w*Math.cos(rad)+h*Math.sin(rad))/2,hh=(w*Math.sin(rad)+h*Math.cos(rad))/2+6;
    return {l:cx-hw,t:cy-hh,r:cx+hw,b:cy+hh};
  }
  function btnGeo(el){var r=el.getBoundingClientRect();return {l:r.left+window.scrollX,t:r.top+window.scrollY-24,r:r.right+window.scrollX,b:r.bottom+window.scrollY}}
  function hit(p,q,m){return p.l<q.r+m&&q.l<p.r+m&&p.t<q.b+m&&q.t<p.b+m}
  function problems(){
    var R=badges.map(geo),B=btns.map(btnGeo),W=document.documentElement.clientWidth,H=window.innerHeight,i,j;
    for(i=0;i<R.length;i++){
      if(R[i].l<4||R[i].r>W-4||R[i].t<4||R[i].b>H-4)return true;
      for(j=i+1;j<R.length;j++)if(hit(R[i],R[j],12))return true;
      for(j=0;j<B.length;j++)if(hit(R[i],B[j],16))return true;
    }
    return false;
  }
  /* 徽章不可互相重疊、不可蓋到按鈕、要完整在第一屏：有問題就一起縮小，直到解決 */
  function separate(){
    if(!box||getComputedStyle(box).position!=='absolute')return;
    var w=badges[0].offsetWidth;
    while(problems()&&w>120){w-=4;box.style.setProperty('--bw',w+'px')}
  }
  function fit(){
    t.style.fontSize='';
    if(box)box.style.removeProperty('--bw');
    var fs=parseFloat(getComputedStyle(t).fontSize),
        bottom=Math.max.apply(null,[absBottom(a)].concat([].map.call(document.querySelectorAll('.badges .badge'),absBottom))),
        over=bottom+32-window.innerHeight;
    if(over>0){
      var perPx=t.offsetHeight/fs;
      t.style.fontSize=Math.max(52,Math.floor(fs-over/perPx))+'px';
    }
    separate();
  }
  var raf;function q(){cancelAnimationFrame(raf);raf=requestAnimationFrame(fit)}
  fit();
  if(document.fonts){if(document.fonts.ready)document.fonts.ready.then(q);if(document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',q)}
  window.addEventListener('load',q);window.addEventListener('resize',q);
})();

/* 經歷、合作品牌與 Playground 插圖：捲到畫面中才跳出；不支援或要求減少動態時直接顯示 */
(function(){
  var arts=document.querySelectorAll('.exp-art,.brands-art,.pg-art,.skill-cards');
  if(!arts.length||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');e.target.classList.remove('is-armed');io.unobserve(e.target)}})},{threshold:.35});
  [].forEach.call(arts,function(a){a.classList.add('is-armed');io.observe(a)});
})();

/* 複製 Email：剪貼簿被擋時改成選取文字，讓使用者自己按 Ctrl+C */
(function(){
  document.querySelectorAll('.contact__copy').forEach(function(b){
    var label=b.textContent;
    function done(t){b.textContent=t;b.classList.add('is-done');setTimeout(function(){b.textContent=label;b.classList.remove('is-done')},1800)}
    b.addEventListener('click',function(){
      var v=b.getAttribute('data-copy'),mail=b.parentNode.querySelector('.contact__mail');
      function fallback(){var r=document.createRange();r.selectNodeContents(mail);var sel=getSelection();sel.removeAllRanges();sel.addRange(r);done('已選取，按 Ctrl+C')}
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(function(){done('已複製')},fallback)}else fallback();
    });
  });
})();

/* About 頁：網址帶 #exp-2024 這類錨點時，自動展開對應的經歷並捲過去 */
(function(){
  function openFromHash(){
    var id=location.hash.slice(1);if(!id)return;
    var el=document.getElementById(id);
    if(el&&el.tagName==='DETAILS'){el.open=true;setTimeout(function(){el.scrollIntoView({block:'start'})},60)}
  }
  openFromHash();window.addEventListener('hashchange',openFromHash);
})();
