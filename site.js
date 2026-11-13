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

/* Let's talk 表單：檢查必填欄位後，透過 Web3Forms 直接寄到 Jade 的 Gmail
   （網站是靜態網頁，沒有自己的伺服器，所以用 Web3Forms 代寄。金鑰只能用來寄信到 Jade 的信箱，放在網頁上是正常的） */
(function(){
  var f=document.getElementById('inquiry');if(!f)return;
  var TO='jiesmc1938@gmail.com',KEY='5c86ddab-67ae-4f37-9f02-f7ffe59c913f';
  var btn=f.querySelector('button[type="submit"]'),label=btn.querySelector('span'),st=document.getElementById('f-status');
  var rules=[['f-name','e-name',function(v){return v?'':'請填寫您的名字'}],
             ['f-email','e-email',function(v){return !v?'請填寫 Email':(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?'':'Email 格式不正確，請再確認')}],
             ['f-msg','e-msg',function(v){return v?'':'請簡單說明您的需求'}]];
  function check(r){var el=document.getElementById(r[0]),er=document.getElementById(r[1]),m=r[2](el.value.trim());er.textContent=m;el.classList.toggle('is-invalid',!!m);el.setAttribute('aria-invalid',m?'true':'false');if(m)el.setAttribute('aria-describedby',r[1]);return !m}
  rules.forEach(function(r){var el=document.getElementById(r[0]);el.addEventListener('input',function(){if(el.classList.contains('is-invalid'))check(r)})});
  function v(id){return document.getElementById(id).value.trim()}
  function busy(on){btn.disabled=on;btn.setAttribute('aria-busy',on?'true':'false');label.textContent=on?'送出中…':'送出需求'}
  function fail(){
    st.className='ct-status-msg is-error';
    st.innerHTML='';st.appendChild(document.createTextNode('送出失敗，可能是網路不穩。請稍後再試，或直接寄信到 '));
    var a=document.createElement('a');a.href='mailto:'+TO;a.textContent=TO;st.appendChild(a);st.appendChild(document.createTextNode('。'));
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(document.getElementById('f-bot').checked)return;
    var ok=rules.map(check).every(Boolean);
    if(!ok){var first=f.querySelector('.is-invalid');if(first)first.focus();st.textContent='';return}
    busy(true);st.className='ct-status-msg';st.textContent='';
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({access_key:KEY,subject:'作品集合作需求｜'+v('f-type')+'｜'+v('f-name'),from_name:'Jade Shih 作品集',
        replyto:v('f-email'),'名字':v('f-name'),'Email':v('f-email'),'公司 / 品牌':v('f-company')||'—','需求類型':v('f-type'),'預算範圍':v('f-budget'),'需求說明':v('f-msg')})})
    .then(function(r){return r.json().then(function(d){return r.ok&&d.success})})
    .then(function(sent){
      busy(false);
      if(!sent){fail();return}
      f.reset();st.className='ct-status-msg is-done';st.textContent='已送出，謝謝您！我會盡快回覆到您留下的 Email。';
    })
    .catch(function(){busy(false);fail()});
  });
})();

/* Works 頁：依類別篩選作品，並顯示數量 */
(function(){
  var bar=document.querySelector('.wk-filters');if(!bar)return;
  var cards=[].slice.call(document.querySelectorAll('.wk-card')),btns=[].slice.call(bar.querySelectorAll('.wk-filter')),out=document.getElementById('wkCount');
  btns.forEach(function(b){var k=b.getAttribute('data-filter');b.querySelector('.wk-filter__n').textContent=k==='all'?cards.length:cards.filter(function(c){return c.getAttribute('data-cat')===k}).length});
  function apply(k,label){
    var n=0;
    cards.forEach(function(c){var on=k==='all'||c.getAttribute('data-cat')===k;c.hidden=!on;c.classList.remove('is-in');if(on){n++;void c.offsetWidth;c.classList.add('is-in')}});
    btns.forEach(function(b){b.setAttribute('aria-pressed',b.getAttribute('data-filter')===k?'true':'false')});
    out.textContent=(k==='all'?'全部作品':label)+'・共 '+n+' 件';
  }
  btns.forEach(function(b){b.addEventListener('click',function(){apply(b.getAttribute('data-filter'),b.firstChild.textContent)})});
  apply('all');
})();

/* 作品詳細頁：點擊照片放大檢視（可用左右鍵切換、Esc 關閉） */
(function(){
  var items=[].slice.call(document.querySelectorAll('.cs-stack__item'));if(!items.length)return;
  var ic=function(d){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>'};
  var lb=document.createElement('dialog');lb.className='lb';lb.setAttribute('aria-label','作品圖片檢視');
  lb.innerHTML='<img class="lb__img" alt=""><button type="button" class="lb__btn lb__close" aria-label="關閉">'+ic('M6 6l12 12M18 6 6 18')+'</button><button type="button" class="lb__btn lb__prev" aria-label="上一張">'+ic('M15 6l-6 6 6 6')+'</button><button type="button" class="lb__btn lb__next" aria-label="下一張">'+ic('M9 6l6 6-6 6')+'</button><p class="lb__count" aria-live="polite"></p>';
  document.body.appendChild(lb);
  var img=lb.querySelector('.lb__img'),count=lb.querySelector('.lb__count'),cur=0,opener=null;
  if(items.length<2)lb.setAttribute('data-single','');
  function show(i){
    cur=(i+items.length)%items.length;var s=items[cur].querySelector('img');
    img.src=s.currentSrc||s.src;img.alt=s.alt;count.textContent=(cur+1)+' / '+items.length;
    img.style.animation='none';void img.offsetWidth;img.style.animation='';
  }
  function open(i){opener=items[i];show(i);if(lb.showModal)lb.showModal();else lb.setAttribute('open','');document.documentElement.style.overflow='hidden'}
  function close(){if(lb.open){lb.close?lb.close():lb.removeAttribute('open')}}
  lb.addEventListener('close',function(){document.documentElement.style.overflow='';if(opener)opener.focus()});
  items.forEach(function(b,i){b.addEventListener('click',function(){open(i)})});
  lb.querySelector('.lb__close').addEventListener('click',close);
  lb.querySelector('.lb__prev').addEventListener('click',function(){show(cur-1)});
  lb.querySelector('.lb__next').addEventListener('click',function(){show(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  lb.addEventListener('keydown',function(e){if(items.length>1&&e.key==='ArrowLeft')show(cur-1);else if(items.length>1&&e.key==='ArrowRight')show(cur+1)});
})();
