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
  // 用 pointer 事件：刮刮樂等元件按下時會擋掉 mousemove，游標才不會卡住
  document.addEventListener('pointermove',function(e){
    if(e.pointerType&&e.pointerType!=='mouse')return;
    x=e.clientX;y=e.clientY;c.classList.add('is-on');
    c.classList.toggle('is-link',!!(e.target.closest&&e.target.closest('a,button,[role="button"],label,summary')));
    if(!queued){queued=true;requestAnimationFrame(draw)}
  },{passive:true});
  document.addEventListener('mouseleave',function(){c.classList.remove('is-on')});
  document.addEventListener('pointerdown',function(){c.classList.add('is-down')});
  document.addEventListener('pointerup',function(){c.classList.remove('is-down')});
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

/* 作品詳細頁：點擊照片放大檢視（可用左右鍵切換、Esc 關閉）
   - .cs-stack__item 與 [data-lb="群組"]：同群組的圖片可左右切換
   - [data-lb-set="圖1|圖2|..."]：點擊後瀏覽這組圖片（例如提案的每一頁） */
(function(){
  var triggers=[].slice.call(document.querySelectorAll('.cs-stack__item,[data-lb],[data-lb-set]'));if(!triggers.length)return;
  var ic=function(d){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d+'"/></svg>'};
  var lb=document.createElement('dialog');lb.className='lb';lb.setAttribute('aria-label','作品圖片檢視');
  lb.innerHTML='<img class="lb__img" alt=""><button type="button" class="lb__btn lb__close" aria-label="關閉">'+ic('M6 6l12 12M18 6 6 18')+'</button><button type="button" class="lb__btn lb__prev" aria-label="上一張">'+ic('M15 6l-6 6 6 6')+'</button><button type="button" class="lb__btn lb__next" aria-label="下一張">'+ic('M9 6l6 6-6 6')+'</button><p class="lb__count" aria-live="polite"></p>';
  document.body.appendChild(lb);
  var img=lb.querySelector('.lb__img'),count=lb.querySelector('.lb__count'),list=[],cur=0,opener=null;
  var yc=document.getElementById('ycur'),ycHome=yc&&yc.parentNode;
  function srcOf(el){var i=el.querySelector('img[alt]:not([alt=""])')||el.querySelector('img');return {src:el.getAttribute('data-full')||(i&&(i.currentSrc||i.src)),alt:i?i.alt:'',long:el.hasAttribute('data-long')}}
  function show(i){
    cur=(i+list.length)%list.length;img.src=list[cur].src;img.alt=list[cur].alt||'';count.textContent=(cur+1)+' / '+list.length;
    if(list.length<2)lb.setAttribute('data-single','');else lb.removeAttribute('data-single');
    if(list[cur].long)lb.setAttribute('data-long','');else lb.removeAttribute('data-long');lb.scrollTop=0;
    img.style.animation='none';void img.offsetWidth;img.style.animation='';
  }
  function open(l,i,el){list=l;opener=el;show(i);if(yc)lb.appendChild(yc);if(lb.showModal)lb.showModal();else lb.setAttribute('open','');document.documentElement.style.overflow='hidden'}
  function close(){if(lb.open){lb.close?lb.close():lb.removeAttribute('open')}}
  lb.addEventListener('close',function(){if(yc&&ycHome)ycHome.appendChild(yc);document.documentElement.style.overflow='';if(opener)opener.focus()});
  triggers.forEach(function(el){
    el.addEventListener('click',function(){
      var set=el.getAttribute('data-lb-set');
      if(set){var alt=el.getAttribute('data-lb-alt')||'';open(set.split('|').map(function(s,k){return {src:s,alt:alt+' '+(k+1)}}),0,el);return}
      var g=el.classList.contains('cs-stack__item')?'.cs-stack__item':'[data-lb="'+el.getAttribute('data-lb')+'"]';
      var group=[].slice.call(document.querySelectorAll(g));
      open(group.map(srcOf),group.indexOf(el),el);
    });
  });
  lb.querySelector('.lb__close').addEventListener('click',close);
  lb.querySelector('.lb__prev').addEventListener('click',function(){show(cur-1)});
  lb.querySelector('.lb__next').addEventListener('click',function(){show(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  lb.addEventListener('keydown',function(e){if(list.length>1&&e.key==='ArrowLeft')show(cur-1);else if(list.length>1&&e.key==='ArrowRight')show(cur+1)});
})();

/* 作品詳細頁：橫向輪播（一次一組，按鈕切換） */
(function(){
  [].forEach.call(document.querySelectorAll('.kl-car'),function(car){
    var track=car.querySelector('.kl-onb'),btns=car.querySelectorAll('.kl-car__btn'),count=car.querySelector('.kl-car__count');
    if(!track)return;
    function pages(){return Math.max(1,Math.round(track.scrollWidth/track.clientWidth))}
    function page(){return Math.min(pages(),Math.round(track.scrollLeft/track.clientWidth)+1)}
    function sync(){var p=page(),n=pages();count.textContent=p+' / '+n;btns[0].disabled=p<=1;btns[1].disabled=p>=n;car.toggleAttribute('data-single',n<2)}
    [].forEach.call(btns,function(b){b.addEventListener('click',function(){var gap=parseFloat(getComputedStyle(track).columnGap)||0;track.scrollBy({left:(+b.getAttribute('data-dir'))*(track.clientWidth+gap),behavior:'smooth'})})});
    var t;track.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(sync,80)});
    window.addEventListener('resize',sync);sync();
  });
})();

/* 新手導覽：左字右圖輪播（露出下一張、可點 Dot、滑鼠拖曳、DRAG 游標、進場示範晃動） */
(function(){
  [].forEach.call(document.querySelectorAll('.kl-onb2'),function(box){
    var track=box.querySelector('.kl-onb2__track'),items=track.children,steps=box.querySelectorAll('.kl-steps li'),dotsEl=box.querySelector('.kl-dots');
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function iw(){return items[0].getBoundingClientRect().width}
    function step(){return iw()+(parseFloat(getComputedStyle(track).columnGap)||0)}
    function per(){return Math.max(1,Math.floor((track.clientWidth+1)/step()+0.05))}
    function pages(){return Math.ceil(items.length/per())}
    function first(){return Math.round(track.scrollLeft/step())}
    function cur(){var p=per(),n=pages();if(track.scrollLeft+track.clientWidth>=track.scrollWidth-4)return n-1;return Math.min(n-1,Math.round(first()/p))}
    function go(pg){var p=per();track.scrollTo({left:Math.min(items.length-p,pg*p)*step(),behavior:reduce?'auto':'smooth'})}
    function build(){
      var n=pages();dotsEl.innerHTML='';
      for(var j=0;j<n;j++){var d=document.createElement('button');d.type='button';d.className='kl-dot';d.setAttribute('role','tab');d.setAttribute('aria-label','第 '+(j+1)+' 組，共 '+n+' 組');(function(j){d.addEventListener('click',function(){go(j)})})(j);dotsEl.appendChild(d)}
      dotsEl.hidden=n<2;sync();
    }
    function sync(){
      var p=per(),c=cur(),f=c===pages()-1?items.length-p:c*p;
      [].forEach.call(dotsEl.children,function(d,j){d.classList.toggle('is-on',j===c);d.setAttribute('aria-selected',j===c)});
      [].forEach.call(steps,function(li,i){li.classList.toggle('is-on',i>=f&&i<f+p)});
    }
    [].forEach.call(steps,function(li,i){li.querySelector('button').addEventListener('click',function(){go(Math.floor(i/per()))})});
    var t;track.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(sync,80)});
    window.addEventListener('resize',build);build();

    /* 滑鼠拖曳 */
    var down=false,moved=false,sx=0,sl=0;
    track.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;sx=e.clientX;sl=track.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(!moved&&Math.abs(dx)>4){moved=true;track.classList.add('is-drag')}if(moved)track.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(e){if(!down)return;down=false;track.classList.remove('is-drag');if(moved){var dx=e.clientX-sx,c=Math.round(sl/step()/per());go(Math.abs(dx)>40?c+(dx<0?1:-1):c)}});
    track.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
    track.addEventListener('dragstart',function(e){e.preventDefault()});

    /* YOU 游標變成 DRAG */
    var tag=document.querySelector('#ycur .ycur__tag');
    if(tag){track.addEventListener('mouseenter',function(){tag.textContent='DRAG ↔';document.getElementById('ycur').classList.add('is-drag')});
      track.addEventListener('mouseleave',function(){tag.textContent='YOU';document.getElementById('ycur').classList.remove('is-drag')})}

    /* 第一次進到畫面：輕輕示範往左滑再彈回 */
    if(!reduce&&'IntersectionObserver' in window){
      var io=new IntersectionObserver(function(en){if(en[0].isIntersecting&&en[0].intersectionRatio>.6){io.disconnect();
        setTimeout(function(){if(track.scrollLeft>2)return;track.scrollTo({left:step()*.45,behavior:'smooth'});setTimeout(function(){track.scrollTo({left:0,behavior:'smooth'})},650)},500)}},{threshold:[.6]});
      io.observe(track);
    }
  });
})();

/* 通用橫向展示牆：Dot＋滑鼠拖曳＋DRAG 游標 */
(function(){
  [].forEach.call(document.querySelectorAll('.hcar'),function(box){
    var track=box.querySelector('.hcar__track'),items=track.children,dotsEl=box.querySelector('.hcar__dots');
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step(){return items[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(track).columnGap)||0)}
    function per(){return Math.max(1,Math.floor(track.clientWidth/step()))}
    function pages(){return Math.ceil((items.length-per())/per())+1}
    function cur(){if(track.scrollLeft+track.clientWidth>=track.scrollWidth-4)return pages()-1;return Math.round(track.scrollLeft/step()/per())}
    function go(pg){pg=Math.max(0,Math.min(pages()-1,pg));track.scrollTo({left:pg*per()*step(),behavior:reduce?'auto':'smooth'})}
    function build(){var n=pages();dotsEl.innerHTML='';for(var j=0;j<n;j++){var d=document.createElement('button');d.type='button';d.className='kl-dot';d.setAttribute('aria-label','第 '+(j+1)+' 組，共 '+n+' 組');(function(j){d.addEventListener('click',function(){go(j)})})(j);dotsEl.appendChild(d)}dotsEl.hidden=n<2;sync()}
    function sync(){var c=cur();[].forEach.call(dotsEl.children,function(d,j){d.classList.toggle('is-on',j===c)})}
    var t;track.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(sync,80)});
    window.addEventListener('resize',build);build();
    var down=false,moved=false,sx=0,sl=0;
    track.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;sx=e.clientX;sl=track.scrollLeft});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(!moved&&Math.abs(dx)>4){moved=true;track.classList.add('is-drag')}if(moved)track.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(e){if(!down)return;down=false;track.classList.remove('is-drag');if(moved){var dx=e.clientX-sx,c=Math.round(sl/step()/per());go(Math.abs(dx)>40?c+(dx<0?1:-1):c)}});
    track.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
    track.addEventListener('dragstart',function(e){e.preventDefault()});
    var y=document.getElementById('ycur'),tag=y&&y.querySelector('.ycur__tag');
    if(tag){track.addEventListener('mouseenter',function(){tag.textContent='DRAG ↔';y.classList.add('is-drag')});track.addEventListener('mouseleave',function(){tag.textContent='YOU';y.classList.remove('is-drag')})}
  });
})();

/* 09 扭蛋互動：點「馬上前往」→ 扭蛋動畫 → 結果頁；「再玩一次」重來
   結果頁先在動畫底下換好，再讓動畫淡出，過場不會露出活動頁 */
(function(){
  [].forEach.call(document.querySelectorAll('.gc-demo'),function(demo){
    var phone=demo.querySelector('.gc-phone'),scr=demo.querySelector('.gc-screen'),anim=demo.querySelector('.gc-anim'),
        steps=demo.querySelectorAll('.gc-step'),timers=[],reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function step(s){[].forEach.call(steps,function(li){li.classList.toggle('is-on',li.getAttribute('data-step')===s)})}
    function page(p){phone.setAttribute('data-page',p);scr.scrollTop=0}
    function clear(){timers.forEach(clearTimeout);timers=[]}
    function at(ms,fn){timers.push(setTimeout(fn,ms))}
    function play(){
      clear();anim.className='gc-anim';
      if(reduce){page('result');step('result');return}
      phone.classList.add('is-anim');step('anim');void anim.offsetWidth;anim.classList.add('is-shake');
      at(700,function(){anim.classList.add('is-drop')});
      at(1650,function(){anim.classList.add('is-pop')});
      at(2800,function(){page('result');step('result')});
      at(2850,function(){phone.classList.remove('is-anim')});
      at(3400,function(){anim.className='gc-anim'});
    }
    function reset(){clear();phone.classList.remove('is-anim');anim.className='gc-anim';page('landing');step('landing')}
    demo.querySelector('.gc-hot').addEventListener('click',play);
    var rp=demo.querySelector('.gc-replay');if(rp)rp.addEventListener('click',function(){reset();
      /* 手機版手機在步驟卡片上方，按「再玩一次」後捲回手機區（扣掉導覽列高度），才看得到「馬上前往」 */
      if(matchMedia('(max-width:760px)').matches){var nb=document.querySelector('.jade-navigation-bar'),off=(nb?nb.getBoundingClientRect().bottom:64)+12;
        window.scrollTo({top:phone.getBoundingClientRect().top+scrollY-off,behavior:reduce?'auto':'smooth'})}});
    reset();
  });
})();

/* 手機示意（07／08／09）：除了滾輪，也可以用滑鼠拖拉上下看；游標顯示 DRAG ↕ */
(function(){
  [].forEach.call(document.querySelectorAll('.pdp-phone__screen'),function(scr){
    var down=false,moved=false,y0=0,top0=0,v=0,lastY=0,lastT=0,raf=0;
    scr.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0)return;
      cancelAnimationFrame(raf);down=true;moved=false;y0=lastY=e.clientY;top0=scr.scrollTop;v=0;lastT=performance.now();
    });
    window.addEventListener('pointermove',function(e){
      if(!down)return;var dy=e.clientY-y0;
      if(!moved&&Math.abs(dy)>4){moved=true;scr.classList.add('is-dragging');try{scr.setPointerCapture(e.pointerId)}catch(_){}}
      if(moved){e.preventDefault();scr.scrollTop=top0-dy;var t=performance.now();v=(lastY-e.clientY)/Math.max(1,t-lastT);lastY=e.clientY;lastT=t}
    });
    window.addEventListener('pointerup',function(){
      if(!down)return;down=false;scr.classList.remove('is-dragging');
      if(moved){ /* 放開後帶一點慣性 */
        (function glide(){v*=0.94;if(Math.abs(v)<0.02)return;scr.scrollTop+=v*16;raf=requestAnimationFrame(glide)})();
      }
    });
    /* 拖拉後放開不要觸發點擊（例如 09 的「馬上前往」） */
    scr.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
    scr.addEventListener('dragstart',function(e){e.preventDefault()});
    var y=document.getElementById('ycur'),tag=y&&y.querySelector('.ycur__tag');
    if(tag){scr.addEventListener('mouseenter',function(){tag.textContent='DRAG ↕';y.classList.add('is-drag')});scr.addEventListener('mouseleave',function(){tag.textContent='YOU';y.classList.remove('is-drag')})}
  });
})();

/* 14 Prompt Skill 試玩：選 Persona → 顯示固定元素；按「重新抽選構圖」→ 換到另一張產出，Rolled 條件同步顯示該圖的構圖描述 */
(function(){
  [].forEach.call(document.querySelectorAll('.sk-demo'),function(demo){
    var P;try{P=JSON.parse(demo.getAttribute('data-personas'))}catch(e){return}
    var tabs=demo.querySelectorAll('.sk-tab'),sw=demo.querySelector('.sk-sw'),fx=demo.querySelector('.sk-fixed'),
        dl=demo.querySelector('.sk-var'),pics=demo.querySelectorAll('.sk-out__img'),cur=0,imgI=0;
    function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
    function show(){
      var p=P[cur],k=imgI%p.imgs.length,t=p.tpls[k],html='';
      Object.keys(t).forEach(function(d){html+='<dt>'+esc(d)+'</dt><dd class="is-new">'+esc(t[d])+'</dd>'});
      dl.innerHTML=html;
      [].forEach.call(pics,function(el){el.hidden=el.getAttribute('data-src')!==p.imgs[k]});
    }
    function select(i){
      cur=i;imgI=0;
      [].forEach.call(tabs,function(t,j){t.setAttribute('aria-pressed',j===i?'true':'false')});
      var p=P[i];sw.innerHTML=p.colors.map(function(c){return '<span style="--c:'+c+'">'+c+'</span>'}).join('');
      fx.innerHTML=p.fixed.map(function(f){return '<li>'+esc(f)+'</li>'}).join('');
      show();
    }
    [].forEach.call(tabs,function(t,j){t.addEventListener('click',function(){select(j)})});
    demo.querySelector('.sk-roll').addEventListener('click',function(){imgI++;show()});
    select(0);
  });
})();
/* 15 可操作原型：等比縮放、頁籤切換、首頁 → 事件頁、篩選與展開、滑鼠拖曳捲動 */
(function(){
  [].forEach.call(document.querySelectorAll('.clp'),function(root){
    var fit=root.querySelector('.clp-fit'),app=root.querySelector('.clp-app'),
        home=app.querySelector('[data-view="home"]'),ev=app.querySelector('[data-view="ev"]'),seg='eco';
    function size(){app.style.setProperty('--s',fit.clientWidth/390)}
    ev.inert=true;
    size();if('ResizeObserver' in window)new ResizeObserver(size).observe(fit);else window.addEventListener('resize',size);
    function pick(btns,attr,v,aria){[].forEach.call(btns,function(b){b.setAttribute(aria,b.getAttribute(attr)===v?'true':'false')})}
    function setSeg(v){seg=v;pick(home.querySelectorAll('[data-seg]'),'data-seg',v,'aria-selected');
      [].forEach.call(home.querySelectorAll('[data-pane]'),function(p){p.hidden=p.getAttribute('data-pane')!==v})}
    function setTab(v){pick(ev.querySelectorAll('[data-tab]'),'data-tab',v,'aria-selected');
      [].forEach.call(ev.querySelectorAll('[data-tpane]'),function(p){p.hidden=p.getAttribute('data-tpane')!==v;p.scrollTop=0})}
    function open(v){setTab(v);app.classList.add('is-ev');ev.removeAttribute('aria-hidden');ev.inert=false;home.setAttribute('aria-hidden','true');home.inert=true}
    function back(){app.classList.remove('is-ev');home.removeAttribute('aria-hidden');home.inert=false;ev.setAttribute('aria-hidden','true');ev.inert=true;ev.querySelector('.clp-sheet').hidden=true}
    var suppress=false;
    app.addEventListener('click',function(e){
      if(suppress){e.preventDefault();e.stopPropagation();suppress=false;return}
      var t=e.target.closest('button');if(!t||!app.contains(t))return;
      if(t.hasAttribute('data-seg'))return setSeg(t.getAttribute('data-seg'));
      if(t.hasAttribute('data-go')){var g=t.getAttribute('data-go');return open(g==='cur'?seg:g)}
      if(t.classList.contains('clp-back'))return back();
      if(t.classList.contains('clp-info')){ev.querySelector('.clp-sheet').hidden=false;return}
      if(t.classList.contains('clp-sheet__x'))return void(ev.querySelector('.clp-sheet').hidden=true);
      if(t.hasAttribute('data-tab'))return setTab(t.getAttribute('data-tab'));
      if(t.hasAttribute('data-f')){var f=t.getAttribute('data-f');pick(ev.querySelectorAll('[data-f]'),'data-f',f,'aria-pressed');
        [].forEach.call(ev.querySelectorAll('[data-g]'),function(g){g.hidden=g.getAttribute('data-g')!==f});return}
      if(t.classList.contains('clp-acc__h')||t.classList.contains('clp-tk__more')){var a=t.closest('.clp-acc'),o=!a.classList.contains('is-open');
        if(t.classList.contains('clp-tk__more'))o=true;a.classList.toggle('is-open',o);a.querySelector('.clp-acc__h').setAttribute('aria-expanded',o?'true':'false')}
    },true);
    ev.querySelector('.clp-sheet').addEventListener('click',function(e){if(e.target===this)this.hidden=true});
    /* 滑鼠拖曳：data-dx 橫向、data-dy 縱向；拖過就不觸發點擊 */
    var drag=null;
    app.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0)return;
      var x=e.target.closest('[data-dx]'),y=e.target.closest('[data-dy]');if(!x&&!y)return;
      drag={x:x,y:y,sx:e.clientX,sy:e.clientY,l:x?x.scrollLeft:0,t:y?y.scrollTop:0,axis:null,s:parseFloat(getComputedStyle(app).getPropertyValue('--s'))||1};
    });
    window.addEventListener('pointermove',function(e){
      if(!drag)return;var dx=(e.clientX-drag.sx)/drag.s,dy=(e.clientY-drag.sy)/drag.s;
      if(!drag.axis){if(Math.max(Math.abs(dx),Math.abs(dy))<5)return;drag.axis=(drag.x&&Math.abs(dx)>Math.abs(dy))||!drag.y?'x':'y';app.classList.add('is-drag')}
      if(drag.axis==='x'&&drag.x)drag.x.scrollLeft=drag.l-dx;if(drag.axis==='y'&&drag.y)drag.y.scrollTop=drag.t-dy;
      e.preventDefault();
    });
    window.addEventListener('pointerup',function(){if(drag&&drag.axis)suppress=true;setTimeout(function(){suppress=false},0);drag=null;app.classList.remove('is-drag')});
  });
})();
/* 21 ORBIS 互動結構圖：點擊（觸控）開關說明，點空白或 Esc 關閉 */
(function(){
  var hs=document.querySelectorAll('.ob-hs');if(!hs.length)return;
  function close(ex){[].forEach.call(hs,function(h){if(h!==ex){h.classList.remove('is-open');h.querySelector('.ob-hs__dot').setAttribute('aria-expanded','false')}})}
  [].forEach.call(hs,function(h){var b=h.querySelector('.ob-hs__dot');
    b.addEventListener('click',function(e){e.stopPropagation();var o=!h.classList.contains('is-open');close(h);h.classList.toggle('is-open',o);b.setAttribute('aria-expanded',o?'true':'false')});
    var tp=h.querySelector('.ob-hs__tip');if(tp)tp.addEventListener('click',function(e){e.stopPropagation()})});
  function lbOpen(){var d=document.querySelector('dialog.lb');return d&&d.open}
  document.addEventListener('click',function(e){if(lbOpen()||(e.target.closest&&e.target.closest('dialog.lb')))return;close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!lbOpen())close()});
})();
/* 首頁精選作品：捲動疊卡 */
(function(){
  var deck=document.querySelector('.deck');if(!deck)return;
  var items=[].slice.call(deck.querySelectorAll('.deck__item')),N=items.length,cur=deck.querySelector('.deck__cur');
  var mq=matchMedia('(max-width:760px),(prefers-reduced-motion:reduce)');
  var cw=0,top0=0,span=1,ticking=false,last=-1,mid=0;
  function measure(){
    if(mq.matches){items.forEach(function(it){it.style.transform='';it.style.zIndex='';it.style.opacity=''});return}
    var head=deck.closest('.sec')&&deck.closest('.sec').querySelector('.sec__title'),stage=deck.querySelector('.deck__stage'),left=0;
    if(head&&stage){left=Math.max(0,Math.round(head.getBoundingClientRect().left-stage.getBoundingClientRect().left));deck.style.setProperty('--deck-left',left+'px')} // 卡片左緣對齊標題
    cw=items[0].offsetWidth;mid=stage?(stage.clientWidth-cw)/2-left:0; // 最後一張「看全部作品」滑到底時要移到的置中位置deck.style.setProperty('--ch',items[0].querySelector('.deck__card').offsetHeight+'px');
    var r=deck.getBoundingClientRect();top0=r.top+scrollY;span=Math.max(1,deck.offsetHeight-innerHeight);paint();
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function paint(){
    ticking=false;if(mq.matches)return;
    var p=clamp((scrollY-top0)/span,0,1)*(N-1);
    items.forEach(function(it,i){
      var d=i-p,x,s,r,o=1,z;
      if(d>=0){var a=Math.min(d,1);x=a*(cw*.96+32)+Math.max(0,d-1)*cw*.9;s=1-.08*a;r=2*a;if(d>2)o=0;if(i===N-1)x+=(1-a)*mid} // 最後一張滑進來時逐漸移到正中央
      else{var t=-d;x=-t*cw*.35;s=1-.12*Math.min(t,1.5);r=-2*Math.min(t,1);o=Math.max(0,1-t*1.1)} // 看過的卡片往左縮小、淡出（卡片靠左對齊，左邊沒有空間疊放）
      z=100-Math.round(Math.abs(d)*10);
      it.style.transform='translate3d('+x.toFixed(1)+'px,0,0) scale('+s.toFixed(3)+') rotate('+r.toFixed(2)+'deg)';
      it.style.zIndex=z;it.style.opacity=o;it.style.setProperty('--a',clamp(1-Math.abs(d)*1.6,0,1).toFixed(2));
    });
    var n=Math.round(p);if(n!==last&&cur){last=n;cur.textContent=String(n+1).padStart(2,'0')}
  }
  function goTo(i,smooth){window.scrollTo({top:top0+span*i/(N-1),behavior:smooth?'smooth':'instant'})}
  items.forEach(function(it,i){
    var a=it.querySelector(".deck__card,.deck__folder");
    a.addEventListener('click',function(e){if(mq.matches)return;var p=clamp((scrollY-top0)/span,0,1)*(N-1);if(Math.abs(i-p)>.5){e.preventDefault();goTo(i,true)}});
    a.addEventListener('focus',function(){if(!mq.matches)goTo(i,false)});
  });
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(paint)}},{passive:true});
  addEventListener('resize',measure);if(mq.addEventListener)mq.addEventListener('change',measure);
  addEventListener('load',measure);measure();
  if('ResizeObserver' in window)new ResizeObserver(function(){measure()}).observe(document.body); // 上方圖片載完會把這區往下推，位置要重量，否則卡片對不齊
  /* 左右拖曳、觸控板左右滑：改的是同一個頁面捲動位置，所以跟原本的捲動接得起來；放開後對齊到最近的一張 */
  function prog(){return clamp((scrollY-top0)/span,0,1)*(N-1)}
  function toY(p){return top0+span*clamp(p,0,N-1)/(N-1)}
  var sx=null,sp=0,dragged=false,lastDrag=0;
  deck.addEventListener('dragstart',function(e){if(!mq.matches)e.preventDefault()});
  deck.addEventListener('pointerdown',function(e){if(mq.matches||e.button!==0||e.pointerType==='touch')return;sx=e.clientX;sp=prog();dragged=false});
  deck.addEventListener('pointermove',function(e){if(sx===null)return;var dx=e.clientX-sx;
    if(!dragged&&Math.abs(dx)>6){dragged=true;deck.classList.add('is-dragging');try{deck.setPointerCapture(e.pointerId)}catch(_){}}
    if(dragged)window.scrollTo({top:toY(sp-dx/(cw*.9)),behavior:'instant'})});
  function release(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(!dragged)return;deck.classList.remove('is-dragging');lastDrag=Date.now();
    var p=prog();goTo(clamp(dx<-40?Math.ceil(p-.15):dx>40?Math.floor(p+.15):Math.round(p),0,N-1),true)}
  deck.addEventListener('pointerup',release);deck.addEventListener('pointercancel',release);
  deck.addEventListener('click',function(e){if(Date.now()-lastDrag<350){e.preventDefault();e.stopPropagation()}},true); // 拖曳放開時不要誤點進作品頁
  var wt=0;
  deck.addEventListener('wheel',function(e){if(mq.matches||Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();
    window.scrollTo({top:toY(prog()+e.deltaX/400),behavior:'instant'});clearTimeout(wt);wt=setTimeout(function(){goTo(Math.round(prog()),true)},160)},{passive:false});
})();

/* 可橫向捲動的區塊：讓鍵盤也能聚焦後用方向鍵捲動 */
(function(){var n=0;[].forEach.call(document.querySelectorAll('.hcar__track,.clp-x'),function(el){if(!el.hasAttribute('tabindex'))el.tabIndex=0;if(!el.hasAttribute('aria-label')&&!el.hasAttribute('aria-labelledby')){n++;el.setAttribute('role','region');el.setAttribute('aria-label','可左右捲動的內容 '+n)}})})();
/* 22 信用卡：拖曳 360° 旋轉 */
(function(){
  [].forEach.call(document.querySelectorAll('[data-cc]'),function(root){
    var st=root.querySelector('.cc__stage'),card=root.querySelector('.cc__card'),flip=root.querySelector('[data-cc-flip]');
    var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
    var vis=true,ry=-18,rx=6,vy=0,drag=false,lx=0,ly=0,lt=0,raf=0,target=null,touched=false,t0=performance.now();
    function apply(){
      card.style.setProperty('--ry',ry.toFixed(2)+'deg');card.style.setProperty('--rx',rx.toFixed(2)+'deg');
      var a=ry*Math.PI/180,s=Math.sin(a);
      root.style.setProperty('--gx',(50+s*70+rx*1.2).toFixed(1)+'%');
      root.style.setProperty('--go',(.25+Math.abs(s)*.6).toFixed(2));
      var back=Math.cos(a)<0;if(flip)flip.textContent=back?'翻回正面':'翻面看背面';
    }
    function loop(now){
      raf=0;
      if(!touched&&!reduce){if(!vis)return;ry=-18+Math.sin((now-t0)/1400)*22;rx=6+Math.sin((now-t0)/1900)*3;apply();raf=requestAnimationFrame(loop);return}
      if(target!==null){var d=target-ry;ry+=d*.14;rx+=(4-rx)*.12;if(Math.abs(d)<.2){ry=target;target=null}apply();raf=requestAnimationFrame(loop);return}
      if(!drag&&Math.abs(vy)>.05){ry+=vy;vy*=.93;rx+=(4-rx)*.08;apply();raf=requestAnimationFrame(loop)}
    }
    function kick(){if(!raf)raf=requestAnimationFrame(loop)}
    function wake(){touched=true}
    st.addEventListener('pointerdown',function(e){if(e.button>0)return;wake();drag=true;target=null;vy=0;lx=e.clientX;ly=e.clientY;lt=performance.now();st.classList.add('is-drag');try{st.setPointerCapture(e.pointerId)}catch(_){} });
    st.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx,dy=e.clientY-ly,now=performance.now();ry+=dx*.55;if(e.pointerType==='mouse'){rx=Math.max(-25,Math.min(25,rx-dy*.3))}vy=dx*.55*Math.min(1,16/Math.max(1,now-lt));lx=e.clientX;ly=e.clientY;lt=now;apply()});
    function end(){if(!drag)return;drag=false;st.classList.remove('is-drag');if(reduce)vy=0;kick()}
    st.addEventListener('pointerup',end);st.addEventListener('pointercancel',end);st.addEventListener('lostpointercapture',end);
    st.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();wake();vy=0;target=(target===null?ry:target)+(e.key==='ArrowRight'?30:-30);if(reduce){ry=target;target=null;apply()}else kick()}});
    if(flip)flip.addEventListener('click',function(){wake();vy=0;var base=target===null?ry:target;target=(Math.floor((base+20)/180)+1)*180;if(reduce){ry=target;target=null;rx=4;apply()}else kick()});
    apply();
    if(!reduce&&'IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(en){vis=en.isIntersecting;if(vis&&!touched)kick()})}).observe(root)}
  });
})();
/* 23 展會：情境篩選、正反翻面、小冊翻頁 */
(function(){
  var chips=document.querySelectorAll('[data-ex-scene]'),tiles=document.querySelectorAll('.ex-tile');
  [].forEach.call(chips,function(c){c.addEventListener('click',function(){var k=c.getAttribute('data-ex-scene');
    [].forEach.call(chips,function(x){x.setAttribute('aria-pressed',x===c?'true':'false')});
    [].forEach.call(tiles,function(t){t.classList.toggle('is-dim',k!=='all'&&t.getAttribute('data-scene')!==k)})})});
  [].forEach.call(document.querySelectorAll('[data-ex-flip]'),function(b){var f=b.previousElementSibling;b.addEventListener('click',function(){var on=!f.classList.contains('is-flipped');f.classList.toggle('is-flipped',on);b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'看正面':'看背面'})});
  [].forEach.call(document.querySelectorAll('[data-ex-book]'),function(bk){
    var st=bk.querySelector('.ex-book__stage'),lv=[].slice.call(bk.querySelectorAll('.ex-leaf')),n=lv.length,i=0,
        pg=bk.querySelector('.ex-book__pg'),pv=bk.querySelector('[data-ex-prev]'),nx=bk.querySelector('[data-ex-next]');
    function lab(){if(i===0)return '封面';if(i===n)return '封底';return '第 '+(2*i)+'–'+(2*i+1)+' 頁'}
    function upd(){lv.forEach(function(l,k){var t=k<i;l.classList.toggle('is-turned',t);l.style.zIndex=t?(k+1):(n-k)});
      bk.setAttribute('data-at',i===0?'start':(i===n?'end':'mid'));pg.textContent=lab()+'　'+(i+1)+' / '+(n+1);pv.disabled=i===0||busy;nx.disabled=busy;nx.textContent=i===n?'↺':'→';nx.setAttribute('aria-label',i===n?'從封面重新翻閱':'下一頁')}
    var busy=false;
    function restart(){if(busy)return;busy=true;var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;(function step(){if(i>0){i--;upd();if(rm){step();return}setTimeout(step,110)}else{busy=false;upd()}})()}
    function go(d){if(busy)return;if(d>0&&i===n){restart();return}var j=Math.max(0,Math.min(n,i+d));if(j!==i){i=j;upd()}}
    pv.addEventListener('click',function(){go(-1)});nx.addEventListener('click',function(){go(1)});
    st.addEventListener('click',function(e){var r=st.getBoundingClientRect();var x=e.clientX-r.left;
      if(i===0){go(1);return}if(i===n){restart();return}go(x>r.width/2?1:-1)});
    st.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(-1)}});
    upd();
  });
})();
/* 23 展會：小卡「實際試翻」→ 收起小卡並捲到小冊 */
(function(){[].forEach.call(document.querySelectorAll('.ex-tip__go'),function(a){a.addEventListener('click',function(e){
  var t=document.querySelector(a.getAttribute('href'));if(!t)return;e.preventDefault();
  [].forEach.call(document.querySelectorAll('.ob-hs.is-open'),function(h){h.classList.remove('is-open');var b=h.querySelector('.ob-hs__dot');if(b)b.setAttribute('aria-expanded','false')});
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;t.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});
  var st=t.querySelector('.ex-book__stage');if(st)setTimeout(function(){st.focus({preventScroll:true})},rm?0:600)})})})();
/* 27 明台產險新春賀卡：刮刮樂（塗層形狀取自未刮開的印刷檔，籤運隨機） */
(function(){[].forEach.call(document.querySelectorAll('[data-sc]'),function(R){
  var cv=R.querySelector('.sc__coat'),ctx=cv.getContext('2d'),msg=R.querySelector('.sc__msg'),btn=R.querySelector('[data-sc-btn]'),img=R.querySelector('.sc__fortune'),
      F=JSON.parse(R.getAttribute('data-fortunes')),coat=new Image(),cur=0,done=false,last=null,moves=0,lw=0,cw=0,mask=null;
  var WORDS={'大吉':'大吉！一甲子的承諾與守護，祝新年萬事順心。','中吉':'中吉！明台與您齊心，迎接新年新氣象。','吉':'吉！平安就是福，新的一年穩穩前進。','小吉':'小吉！小小的好運，一點一滴累積成整年的幸福。'};
  function paint(pick){var d=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;if(!w||!coat.complete)return;cw=w;
    if(pick){var n=cur;while(F.length>1&&n===cur)n=Math.floor(Math.random()*F.length);cur=n;img.src=F[cur][0]}
    cv.width=Math.round(w*d);cv.height=Math.round(h*d);var W=cv.width,H=cv.height;
    ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);ctx.drawImage(coat,0,0,W,H);
    ctx.globalCompositeOperation='source-atop';var g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(.45,'rgba(255,255,255,0)');g.addColorStop(.55,'rgba(255,255,255,.4)');g.addColorStop(.7,'rgba(80,82,96,.12)');g.addColorStop(1,'rgba(255,255,255,.25)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(var i=0;i<W*H/120;i++){ctx.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'70,72,84')+','+(Math.random()*.16)+')';ctx.fillRect(Math.random()*W,Math.random()*H,1.2*d,1.2*d)}
    ctx.fillStyle='rgba(70,72,84,.7)';ctx.font='700 '+Math.round(H*.16)+'px "Noto Sans TC",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('刮 刮 看',W/2,H*.4);
    ctx.globalCompositeOperation='source-over';try{mask=ctx.getImageData(0,0,W,H).data}catch(_){mask=null}moves=0;
    lw=W*.1;done=false;cv.classList.remove('is-done');btn.textContent='直接揭曉';msg.textContent='✦ 用滑鼠或手指在銀色扇形上刮一刮'}
  function cleared(){if(!mask)return moves/70; // 本機開檔時畫布不能讀像素，改用刮的次數估算
    var W=cv.width,H=cv.height,data=ctx.getImageData(0,0,W,H).data,tot=0,clr=0,s=Math.max(4,Math.round(W/60));
    for(var y=0;y<H;y+=s)for(var x=0;x<W;x+=s){var k=(y*W+x)*4+3;if(mask[k]<128)continue;tot++;if(data[k]<40)clr++}return tot?clr/tot:0}
  function reveal(){done=true;cv.classList.add('is-done');btn.textContent='再刮一次';msg.textContent='✦ '+WORDS[F[cur][1]]}
  function pt(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*cv.width,y:(e.clientY-r.top)/r.height*cv.height}}
  function scratch(p){ctx.globalCompositeOperation='destination-out';ctx.lineCap=ctx.lineJoin='round';ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo((last||p).x,(last||p).y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;
    if(++moves%8===0&&cleared()>.55)reveal()}
  cv.addEventListener('pointerdown',function(e){if(done)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}last=null;scratch(pt(e))});
  cv.addEventListener('pointermove',function(e){if(done||!cv.hasPointerCapture||!cv.hasPointerCapture(e.pointerId))return;scratch(pt(e))});
  cv.addEventListener('pointerup',function(){last=null;if(!done&&cleared()>.55)reveal()});
  btn.addEventListener('click',function(){if(done){paint(true);var c=cv.closest('.sc__card'),r=c.getBoundingClientRect();if(r.top<70||r.bottom>innerHeight)c.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'})}else reveal()});
  F.forEach(function(f){var i=new Image();i.src=f[0]});
  coat.onload=function(){cur=-1;paint(true);if('ResizeObserver' in window)new ResizeObserver(function(){if(Math.abs(cv.clientWidth-cw)>1)paint(false)}).observe(cv);else addEventListener('resize',function(){paint(false)})};
  coat.src=R.getAttribute('data-coat')})})();
/* 手機版全螢幕選單 */
(function(){var nav=document.querySelector('.jade-navigation-bar');if(!nav)return;
  var links=[].slice.call(nav.querySelectorAll('.jade-navigation-bar__links a')),talk=nav.querySelector('.jade-secondary-button'),brand=nav.querySelector('.jade-navigation-bar__brand');
  var ZH={works:'作品',about:'關於我',playground:'實驗場',contact:'聯絡'},ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
  var items=links.map(function(a){return{href:a.getAttribute('href'),en:a.textContent.trim(),cur:a.getAttribute('aria-current')==='page'}});
  if(talk)items.push({href:talk.getAttribute('href'),en:'Contact',cur:/contact\.html$/.test(location.pathname)});
  var btn=document.createElement('button');btn.type='button';btn.className='navmenu-btn';btn.setAttribute('aria-label','開啟選單');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','navmenu');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg>';nav.appendChild(btn);
  var m=document.createElement('div');m.className='navmenu';m.id='navmenu';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','網站選單');
  m.innerHTML='<div class="navmenu__top">'+(brand?'<a class="navmenu__brand" href="'+brand.getAttribute('href')+'">'+brand.innerHTML+'</a>':'')+
    '<button type="button" class="navmenu__close" aria-label="關閉選單"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>'+
    '<ul class="navmenu__list">'+items.map(function(it,i){var k=it.en.toLowerCase();return '<li class="navmenu__item" style="--i:'+i+'"><a class="navmenu__link" href="'+it.href+'"'+(it.cur?' aria-current="page"':'')+'><span class="navmenu__n">0'+(i+1)+'</span><span class="navmenu__en">'+it.en.toUpperCase()+'</span><span class="navmenu__zh">'+(ZH[k]||'')+'</span></a></li>'}).join('')+'</ul>'+
    (talk?'<div class="navmenu__cta navmenu__item" style="--i:'+items.length+'"><a class="jade-primary-button" data-theme="brand" href="'+talk.getAttribute('href')+'"><span>Let&#39;s talk</span><span class="jade-primary-button__icon" aria-hidden="true">'+ARROW+'</span></a></div>':'');
  m.setAttribute('data-theme','brand');document.body.appendChild(m);
  var close=m.querySelector('.navmenu__close'),rm=matchMedia('(prefers-reduced-motion:reduce)');
  function open(){m.classList.add('is-open');document.documentElement.classList.add('navmenu-lock');btn.setAttribute('aria-expanded','true');requestAnimationFrame(function(){requestAnimationFrame(function(){m.classList.add('is-shown')})});close.focus()}
  function shut(){m.classList.remove('is-shown','is-open');document.documentElement.classList.remove('navmenu-lock');btn.setAttribute('aria-expanded','false');btn.focus()}
  btn.addEventListener('click',open);close.addEventListener('click',shut);
  m.addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.getAttribute('href').charAt(0)==='#'){shut()}});
  document.addEventListener('keydown',function(e){if(!m.classList.contains('is-open'))return;if(e.key==='Escape'){shut();return}
    if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('a,button')),a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
  matchMedia('(min-width:761px)').addEventListener('change',function(q){if(q.matches&&m.classList.contains('is-open'))shut()})})();
/* 手機版熱點：圖上小圓點，點了說明卡從底部彈出；小冊圓點直接捲到試翻區 */
(function(){
  var figs=document.querySelectorAll('.ob-hot');if(!figs.length)return;var mq=matchMedia('(max-width:760px)'),items=[];
  var sh=document.createElement('div');sh.className='ob-sheet cs-sec';sh.innerHTML='<button type="button" class="ob-sheet__x" aria-label="關閉說明"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="ob-sheet__card" role="dialog" aria-modal="false" aria-label="製作物說明"></div>';
  document.body.appendChild(sh);var card=sh.querySelector('.ob-sheet__card'),x=sh.querySelector('.ob-sheet__x');
  function closeAll(){items.forEach(function(it){it.h.classList.remove('is-open');var d=it.h.querySelector('.ob-hs__dot');d&&d.setAttribute('aria-expanded','false')});sync()}
  x.addEventListener('click',function(e){e.stopPropagation();closeAll();if(last)last.focus({preventScroll:true})});
  var last=null;
  [].forEach.call(figs,function(f){[].forEach.call(f.querySelectorAll('.ob-hs'),function(h){var tip=h.querySelector('.ob-hs__tip'),d=h.querySelector('.ob-hs__dot'),go=tip&&tip.querySelector('.ex-tip__go');
    items.push({h:h,tip:tip});
    d.addEventListener('click',function(e){if(!mq.matches)return;last=d;
      if(go){e.stopImmediatePropagation();e.preventDefault();var t=document.querySelector(go.getAttribute('href'));if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'})}},true);
    if(go)go.addEventListener('click',function(){closeAll()})})});
  function sync(){var any=false;items.forEach(function(it){var o=it.h.classList.contains('is-open');if(it.tip)it.tip.classList.toggle('is-shown',o);if(o)any=true});sh.classList.toggle('is-on',mq.matches&&any)}
  function place(){items.forEach(function(it){if(!it.tip)return;if(mq.matches){if(it.tip.parentNode!==card)card.appendChild(it.tip)}else if(it.tip.parentNode!==it.h)it.h.appendChild(it.tip)})}
  place();
  function later(){setTimeout(sync,0)}
  document.addEventListener('click',later,true);document.addEventListener('keydown',later,true);
  mq.addEventListener('change',function(){place();sync()});
})();
/* 手機版回到最上方 */
(function(){var b=document.createElement('button');b.type='button';b.className='totop';b.setAttribute('aria-label','回到最上方');
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(b);var on=false;
  function chk(){var s=scrollY>innerHeight*1.2;if(s!==on){on=s;b.classList.toggle('is-on',s)}}
  addEventListener('scroll',chk,{passive:true});chk();
  b.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});var h=document.querySelector('.jade-navigation-bar a');if(h)h.focus({preventScroll:true})})})();

/* 手機版小卡插槽：說明卡上方散落成分小卡，點一下放大，點空白或下一張復原 */
(function(){var mq=matchMedia('(max-width:760px)'),h=document.querySelector('.ob-hs[data-cards]'),sh=document.querySelector('.ob-sheet');if(!h||!sh)return;
  var src=h.querySelectorAll('.ob-mc__card');if(!src.length)return;
  var POS=[[0,24,-22],[48,16,17],[22,6,-6],[48,48,-14],[2,54,11],[26,30,24],[24,62,-4]];
  var sc=document.createElement('div');sc.className='ob-scatter';sc.setAttribute('aria-hidden','true');
  [].forEach.call(src,function(p,i){var c=p.cloneNode(true),q=POS[i%POS.length];c.className='ob-scatter__card';c.style.cssText='--x:'+q[0]+'%;--y:'+q[1]+'%;--r:'+q[2]+'deg;--d:'+(i*45)+'ms';
    var im=c.querySelector('img');if(im)im.loading='eager';
    c.addEventListener('click',function(e){e.stopPropagation();var on=!c.classList.contains('is-big');[].forEach.call(sc.children,function(k){k.classList.remove('is-big')});c.classList.toggle('is-big',on)});sc.appendChild(c)});
  sc.addEventListener('click',function(e){e.stopPropagation();[].forEach.call(sc.children,function(k){k.classList.remove('is-big')})});
  sh.insertBefore(sc,sh.firstChild);
  function sync(){var on=mq.matches&&h.classList.contains('is-open');sc.classList.toggle('is-on',on);if(!on)[].forEach.call(sc.children,function(k){k.classList.remove('is-big')})}
  document.addEventListener('click',function(){setTimeout(sync,10)},true);document.addEventListener('keydown',function(){setTimeout(sync,10)},true);
})();
/* 29 Banner 合輯：等高橫向展示（同 AI 廣告圖案例：下方圓點、滑鼠拖曳、DRAG 游標） */
(function(){[].forEach.call(document.querySelectorAll('.bn-car'),function(box){
  var tr=box.querySelector('.bn-row'),it=[].slice.call(tr.children),dots=box.querySelector('.bn-car__dots');
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function pad(){return parseFloat(getComputedStyle(tr).paddingLeft)||0}
  function cur(){var x=tr.scrollLeft+pad()+4,c=0;it.forEach(function(e,i){if(e.offsetLeft<=x)c=i});if(tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4)c=it.length-1;return c}
  function go(i){i=Math.max(0,Math.min(it.length-1,i));tr.scrollTo({left:it[i].offsetLeft-pad(),behavior:rm?'auto':'smooth'})}
  it.forEach(function(e,j){var d=document.createElement('button');d.type='button';d.className='kl-dot';d.setAttribute('aria-label','第 '+(j+1)+' 張，共 '+it.length+' 張');d.addEventListener('click',function(){go(j)});dots.appendChild(d)});
  function sync(){var c=cur();[].forEach.call(dots.children,function(d,j){d.classList.toggle('is-on',j===c)})}
  var t;tr.addEventListener('scroll',function(){clearTimeout(t);t=setTimeout(sync,60)},{passive:true});addEventListener('resize',sync);
  tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(cur()+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(cur()-1)}});
  var down=false,moved=false,sx=0,sl=0;
  tr.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;down=true;moved=false;sx=e.clientX;sl=tr.scrollLeft});
  addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(!moved&&Math.abs(dx)>4){moved=true;tr.classList.add('is-drag')}if(moved)tr.scrollLeft=sl-dx});
  addEventListener('pointerup',function(e){if(!down)return;down=false;tr.classList.remove('is-drag');if(moved){var dx=e.clientX-sx,c=cur();go(Math.abs(dx)>40&&c===cur()?c+(dx<0?1:0):c)}});
  tr.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);
  tr.addEventListener('dragstart',function(e){e.preventDefault()});
  var y=document.getElementById('ycur'),tag=y&&y.querySelector('.ycur__tag');
  if(tag){tr.addEventListener('mouseenter',function(){tag.textContent='DRAG ↔';y.classList.add('is-drag')});tr.addEventListener('mouseleave',function(){tag.textContent='YOU';y.classList.remove('is-drag')})}
  sync();
})})();

/* 26 年度贈禮互動：桌上的筆記本與桌曆（結構在 tools/frag/26-desk.html） */
(function(){
  var g=document.querySelector('.desk');if(!g)return;
  var stage=g.querySelector('.desk__stage'),nb=g.querySelector('.desk__nb'),cal=g.querySelector('.desk__cal'),hint=g.querySelector('.desk__hint'),
      lv=[].slice.call(nb.querySelectorAll('.desk__leaf')),L=lv.length,sh=[].slice.call(cal.querySelectorAll('.desk__sheet')),S=sh.length,
      rm=matchMedia('(prefers-reduced-motion:reduce)').matches,mode='idle',np=0,cp=0,tk=0,HINT=hint.textContent;
  var quick=false; // 放回桌上時紙頁一起闔上，不一張張依序翻
  function stagger(i,lo,hi,fwd,n){return !quick&&n>1&&!rm&&i>=lo&&i<hi?(fwd?i-lo:hi-1-i)*Math.min(.05,.6/n):0}
  /* 筆記本：攤開時最上面兩頁微微抬起，下面的紙越深越平，書口露出厚度 */
  function lift(k){return np===0||np===L?-Math.min(k*.05,1):6-4*(1-Math.exp(-k/6))}
  /* 效能：只讓最上面幾張紙參與動畫，更深的隱藏且不跑動畫；只在數值有變時才寫入；預先解碼附近頁面的圖 */
  var tn=0,tc=0;
  function setv(d,k,v){if(d.style.getPropertyValue(k)!==v)d.style.setProperty(k,v)}
  function warm(list,a,b){for(var i=Math.max(0,a);i<=Math.min(list.length-1,b);i++)[].forEach.call(list[i].querySelectorAll('img'),function(im){if(im.decode&&!im.dataset.w){im.dataset.w=1;im.decode().catch(function(){})}})}
  function nbNear(i){return (i<np?np-1-i:i-np)<=6}
  /* 效能：翻頁時只有正在翻的紙和兩側最上面的紙跑動畫，其他紙的角度微調直接到位（差不到 1°，看不出來） */
  var all=false;
  function snap(d,mov,k){d.classList.toggle('is-snap',!all&&!(mov||k<=1))}
  function drawNb(prev){var lo=Math.min(np,prev),hi=Math.max(np,prev),n=hi-lo;
    lv.forEach(function(d,i){var up=i<np,k=up?np-1-i:i-np,mov=i>=lo&&i<hi;
      d.classList.toggle('is-far',!(nbNear(i)||mov));snap(d,mov,k);
      setv(d,'--a',(up?-180+lift(k):-lift(k))+'deg');
      setv(d,'--dl',stagger(i,lo,hi,np>prev,n)+'s')});
    clearTimeout(tn);tn=setTimeout(function(){lv.forEach(function(d,i){d.classList.toggle('is-far',!nbNear(i))})},wait(n)+100);
    warm(lv,np-3,np+2);return n}
  function goNb(n){n=Math.max(0,Math.min(L,n));if(n===np)return 0;var pr=np;np=n;return drawNb(pr)}
  /* 桌曆：立起來時整座後仰 20°，背板對稱後仰在 -40°（兩片都碰到桌面），翻過的紙繞頂端線圈轉到 320° 貼著背板外側。
     立起來時最上面那張紙下緣朝觀者抬起最多，下面的紙越深越平，下緣一層層露出來（跟速寫本同樣的厚度做法） */
  function calLift(k){return mode==='cal'?5-4.2*(1-Math.exp(-k/4)):-k*.12}
  function calNear(i){return i<cp?cp-1-i<=2:i-cp<=8}
  function drawCal(prev){var lo=Math.min(cp,prev),hi=Math.max(cp,prev),n=hi-lo;
    sh.forEach(function(d,i){var up=i<cp,mov=i>=lo&&i<hi;
      d.classList.toggle('is-far',!(calNear(i)||mov));snap(d,mov,up?cp-1-i:i-cp);
      setv(d,'--a',(up?320-(i+1)*.15:calLift(i-cp))+'deg');
      setv(d,'--dl',stagger(i,lo,hi,cp>prev,n)+'s')});
    clearTimeout(tc);tc=setTimeout(function(){sh.forEach(function(d,i){d.classList.toggle('is-far',!calNear(i))})},wait(n)+100);
    warm(sh,cp-1,cp+2);return n}
  function goCal(n){n=Math.max(0,Math.min(S-1,n));if(n===cp)return 0;var pr=cp;cp=n;return drawCal(pr)}
  function wait(n){return 850+(n>1&&!rm?n*Math.min(50,600/n):0)}
  function open(which){++tk;mode=which;g.classList.add(which==='nb'?'is-nb':'is-cal');
    hint.textContent=which==='nb'?'點右頁往後翻、點左頁往前翻・點空白處放回桌上':'點桌曆翻下一頁・點空白處放回桌上';
    if(which==='nb'){var t=tk;setTimeout(function(){if(t===tk&&mode==='nb')goNb(1)},rm?0:320)}else{all=true;drawCal(cp);all=false}}
  /* 放回桌上：筆記本跟速寫本一樣，先一張張往回翻、闔上，再回到桌上原位；收合途中多點幾下不會讓它重來或延後。
     桌曆則是闔起與移回同時進行 */
  function close(){if(mode==='idle'||mode==='closing')return;var t=++tk,m=mode;hint.textContent=HINT;
    if(m==='nb'){mode='closing';var n=goNb(0);
      setTimeout(function(){if(t!==tk)return;g.classList.remove('is-nb');mode='idle'},n?wait(n)-150:0)}
    else{mode='idle';quick=true;all=true;goCal(0);drawCal(0);quick=false;all=false;g.classList.remove('is-cal')}}
  function spineX(){var r=stage.getBoundingClientRect();return r.left+r.width/2}
  nb.addEventListener('click',function(e){e.stopPropagation();if(mode==='idle'){open('nb');return}if(mode!=='nb')return;
    /* 沒點在紙上（例如翻到封底後右邊的空位）就當成點空白處 */
    if(!e.target.closest('.desk__leaf')||(np===L&&e.clientX>spineX())){close();return}
    if(e.clientX>spineX())goNb(np+1);else if(np<=1)close();else goNb(np-1)});
  cal.addEventListener('click',function(e){e.stopPropagation();if(mode==='idle'){open('cal');return}if(mode!=='cal')return;
    if(cp<S-1)goCal(cp+1);else goCal(0)});
  stage.addEventListener('click',close);
  function keys(el,which,next,prev){el.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}
    else if(e.key==='Escape')close();
    else if(mode===which&&e.key==='ArrowRight'){e.preventDefault();next()}
    else if(mode===which&&e.key==='ArrowLeft'){e.preventDefault();prev()}})}
  keys(nb,'nb',function(){goNb(np+1)},function(){if(np<=1)close();else goNb(np-1)});
  keys(cal,'cal',function(){goCal(cp+1)},function(){goCal(cp-1)});
  drawNb(0);drawCal(0);
})();
/* 27 抽卡：選卡→翻正→翻面→刮開→吉祥話＋再抽一次（結構在 tools/frag/27-picker.html） */
(function(){
  var fp=document.getElementById('fp');if(!fp)return;
  var cards=[].slice.call(fp.querySelectorAll('.fp__card')),msg=fp.querySelector('.fp__msg'),btn=fp.querySelector('.fp__btn');
  var F=JSON.parse(fp.getAttribute('data-fortunes')),coat=new Image(),HINT=msg.textContent;
  var WORDS={'大吉':'大吉！一甲子的承諾與守護，祝新年萬事順心。','中吉':'中吉！明台與您齊心，迎接新年新氣象。','吉':'吉！平安就是福，新的一年穩穩前進。','小吉':'小吉！小小的好運，一點一滴累積成整年的幸福。'};
  var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,T_STRAIGHT=rm?0:380,T_FLIP=rm?0:720;
  var sel=null,cv=null,ctx=null,cur=-1,done=false,busy=false,mask=null,moves=0,last=null,lw=0;
  F.forEach(function(f){var i=new Image();i.src=f[0]});
  coat.src=fp.getAttribute('data-coat');
  function ui(text,label){msg.textContent=text;if(label){btn.textContent=label;btn.hidden=false}else btn.hidden=true}
  function paint(){
    var d=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;
    cv.width=Math.round(w*d);cv.height=Math.round(h*d);var W=cv.width,H=cv.height;
    ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);ctx.drawImage(coat,0,0,W,H);
    ctx.globalCompositeOperation='source-atop';var g=ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(255,255,255,.35)');g.addColorStop(.45,'rgba(255,255,255,0)');g.addColorStop(.55,'rgba(255,255,255,.4)');g.addColorStop(.7,'rgba(80,82,96,.12)');g.addColorStop(1,'rgba(255,255,255,.25)');
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    for(var i=0;i<W*H/120;i++){ctx.fillStyle='rgba('+(Math.random()<.5?'255,255,255':'70,72,84')+','+(Math.random()*.16)+')';ctx.fillRect(Math.random()*W,Math.random()*H,1.2*d,1.2*d)}
    ctx.fillStyle='rgba(70,72,84,.7)';ctx.font='700 '+Math.round(H*.16)+'px "Noto Sans TC",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('刮 刮 看',W/2,H*.4);
    ctx.globalCompositeOperation='source-over';try{mask=ctx.getImageData(0,0,W,H).data}catch(_){mask=null}
    moves=0;last=null;lw=W*.1;cv.classList.remove('is-done');
  }
  function cleared(){if(!mask)return moves/70; // 本機開檔時畫布不能讀像素，改用刮的次數估算
    var W=cv.width,H=cv.height,data=ctx.getImageData(0,0,W,H).data,tot=0,clr=0,s=Math.max(4,Math.round(W/60));
    for(var y=0;y<H;y+=s)for(var x=0;x<W;x+=s){var k=(y*W+x)*4+3;if(mask[k]<128)continue;tot++;if(data[k]<40)clr++}return tot?clr/tot:0}
  function reveal(){if(done)return;done=true;cv.classList.add('is-done');ui('✦ '+WORDS[F[cur][1]],'再抽一次')}
  function pick(card){
    if(sel||busy)return;busy=true;sel=card;done=false;
    var n=cur;while(F.length>1&&n===cur)n=Math.floor(Math.random()*F.length);cur=n;
    card.querySelector('.fp__fortune').src=F[cur][0];
    cv=card.querySelector('.sc__coat');ctx=cv.getContext('2d');
    fp.classList.add('is-picked');card.classList.add('is-sel');ui('');
    function flip(){paint();card.classList.add('is-flip');
      setTimeout(function(){busy=false;ui('✦ 用滑鼠或手指在銀色扇形上刮一刮')},T_FLIP)}
    setTimeout(function(){if(coat.complete)flip();else coat.onload=flip},T_STRAIGHT);
  }
  function reset(){
    if(!sel||busy)return;busy=true;var c=sel;c.classList.remove('is-flip');ui(HINT);
    setTimeout(function(){c.classList.remove('is-sel');fp.classList.remove('is-picked');sel=null;busy=false},T_FLIP);
  }
  cards.forEach(function(card){
    card.addEventListener('click',function(){if(!sel)pick(card)});
    card.addEventListener('keydown',function(e){if(!sel&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pick(card)}});
    var c=card.querySelector('.sc__coat');
    function pt(e){var r=c.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*c.width,y:(e.clientY-r.top)/r.height*c.height}}
    function scratch(p){ctx.globalCompositeOperation='destination-out';ctx.lineCap=ctx.lineJoin='round';ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo((last||p).x,(last||p).y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p;
      if(++moves%8===0&&cleared()>.55)reveal()}
    function live(){return c===cv&&!done&&!busy}
    c.addEventListener('pointerdown',function(e){if(!live())return;e.preventDefault();try{c.setPointerCapture(e.pointerId)}catch(_){}last=null;scratch(pt(e))});
    c.addEventListener('pointermove',function(e){if(!live()||!c.hasPointerCapture(e.pointerId))return;scratch(pt(e))});
    c.addEventListener('pointerup',function(){last=null;if(live()&&cleared()>.55)reveal()});
  });
  btn.addEventListener('click',function(){if(done)reset()});
})();
/* 28 速寫本翻頁（結構在 tools/frag/28-sketchbook.html） */
(function(){
  var sb=document.querySelector('.sbk');if(!sb)return;
  var sc=sb.querySelector('.sbk__scene'),bk=sb.querySelector('.sbk__book'),lv=[].slice.call(sb.querySelectorAll('.sbk__leaf')),L=lv.length,
      p=0,rm=matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* 攤開時最上面兩頁朝觀者抬起成 V 字，下面的紙越深越平，紙邊就會從外緣一層層露出來；角度不重複才不會閃爍 */
  function lift(k){return p===0||p===L?-Math.min(k*.1,3):30-24*(1-Math.exp(-k/7))}
  /* 效能：每側只讓最上面 K 張紙參與動畫，更深的隱藏且不跑動畫（帶標籤的紙保留）；只在數值有變時才寫入 */
  var K=6,ft=0,tab=lv.map(function(d){return !!d.querySelector('.sbk__tab')});
  function setv(d,k,v){if(d.style.getPropertyValue(k)!==v)d.style.setProperty(k,v)}
  function depth(i){return i<p?p-1-i:i-p}
  function near(){return p===0||p===L?2:K} // 闔上時紙頁幾乎平疊在封面後面，只留最上面兩張和帶標籤的紙
  function warm(c){for(var i=Math.max(0,c-3);i<=Math.min(L-1,c+2);i++)[].forEach.call(lv[i].querySelectorAll('img'),function(im){if(im.decode&&!im.dataset.w){im.dataset.w=1;im.decode().catch(function(){})}})}
  function draw(prev){
    var lo=Math.min(p,prev),hi=Math.max(p,prev),n=hi-lo;
    var edge=prev===0||prev===L||p===0||p===L; // 闔上／翻開那一下，所有紙的角度都大幅改變，要全部跑動畫
    lv.forEach(function(d,i){
      var up=i<p,k=depth(i),mov=i>=lo&&i<hi;
      d.classList.toggle('is-far',!(k<=near()||tab[i]||mov));
      d.classList.toggle('is-snap',!edge&&!(mov||k<=2)); // 翻開狀態下翻頁時，深處的紙角度微調直接到位
      setv(d,'--a',(up?-180+lift(k):-lift(k))+'deg');
      var dl=0;if(n>1&&!rm&&mov)dl=(p>prev?i-lo:hi-1-i)*Math.min(.06,.6/n); // 跳頁時一張接一張翻
      setv(d,'--dl',dl+'s');
    });
    clearTimeout(ft);ft=setTimeout(function(){lv.forEach(function(d,i){d.classList.toggle('is-far',!(depth(i)<=near()||tab[i]))})},950+(n>1&&!rm?n*Math.min(60,600/n):0));
    bk.style.setProperty('--sx',p===0?'calc(var(--pw) * -.5)':p===L?'calc(var(--pw) * .5)':'0px');
    sb.classList.toggle('is-front',p===0);sb.classList.toggle('is-back',p===L);
    warm(p);
  }
  function go(n){n=Math.max(0,Math.min(L,n));if(n===p)return;var pr=p;p=n;draw(pr)}
  [].forEach.call(sb.querySelectorAll('.sbk__tab'),function(t){t.addEventListener('click',function(e){e.stopPropagation();go(+t.getAttribute('data-go'))})});
  var sx=null;
  sb.addEventListener('pointerdown',function(e){sx=e.target.closest('.sbk__tab')?null:e.clientX});
  sb.addEventListener('pointerup',function(e){
    if(sx===null)return;var dx=e.clientX-sx;sx=null;
    if(Math.abs(dx)>40){go(p+(dx<0?1:-1));return}
    if(!e.target.closest('.sbk__leaf')){go(0);return} // 點空白處闔回封面
    if(p===0){go(1);return}if(p===L){go(L-1);return}
    var r=bk.getBoundingClientRect();go(e.clientX>r.left+r.width/2?p+1:p-1);
  });
  sb.addEventListener('pointercancel',function(){sx=null});
  sc.addEventListener('keydown',function(e){
    var m={ArrowRight:p+1,ArrowLeft:p-1,Home:0,End:L}[e.key];
    if(m!==undefined){e.preventDefault();go(m)}
  });
  draw(0);
})();
