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
    var rp=demo.querySelector('.gc-replay');if(rp)rp.addEventListener('click',reset);
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
  var cw=0,top0=0,span=1,ticking=false,last=-1;
  function measure(){
    if(mq.matches){items.forEach(function(it){it.style.transform='';it.style.zIndex='';it.style.opacity=''});return}
    cw=items[0].offsetWidth;deck.style.setProperty('--ch',items[0].querySelector('.deck__card').offsetHeight+'px');
    var r=deck.getBoundingClientRect();top0=r.top+scrollY;span=Math.max(1,deck.offsetHeight-innerHeight);paint();
  }
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function paint(){
    ticking=false;if(mq.matches)return;
    var p=clamp((scrollY-top0)/span,0,1)*(N-1);
    items.forEach(function(it,i){
      var d=i-p,x,s,r,o=1,z;
      if(d>=0){var a=Math.min(d,1);x=a*(cw*.96+32)+Math.max(0,d-1)*cw*.9;s=1-.08*a;r=2*a;if(d>2)o=0}
      else{var t=-d,b=Math.min(t,1),k=Math.min(Math.max(0,t-1),4);x=-b*(cw*.5+28)-k*22;s=1-.14*b-.02*k;r=-2.5*b;if(t>5.5)o=0}
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
/* 26 明台產險贈禮：信封／筆記本／桌曆 3D */
(function(){var roots=document.querySelectorAll('[data-mt]');if(!roots.length)return;
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
[].forEach.call(roots,function(R){
  var st=R.querySelector('.mt-stage'),O={env:R.querySelector('.mt-env'),nb:R.querySelector('.mt-nb'),cal:R.querySelector('.mt-cal')},
      flap=R.querySelector('.mt-env__flap'),rig=R.querySelector('.mt-nb__rig'),
      leaves=[].slice.call(R.querySelectorAll('.mt-leaf')),sheets=[].slice.call(R.querySelectorAll('.mt-sheet')),
      cf=R.querySelector('.mt-cal__front'),cb=R.querySelector('.mt-cal__back'),cbase=R.querySelector('.mt-cal__base'),rings=R.querySelector('.mt-cal__rings'),csh=R.querySelector('.mt-sh--cal'),
      pg=R.querySelector('.mt-pg'),bPrev=R.querySelector('[data-mt-prev]'),bNext=R.querySelector('[data-mt-next]'),
      names=JSON.parse(R.getAttribute('data-names')),NL=leaves.length,NS=sheets.length,T=1.7,TH=9.83;
  var S={w:{ry:0},env:{x:0,y:0,z:0,rx:-8,ry:-24,s:1,v:1,flap:180},nb:{x:0,y:0,z:.3,rx:-8,ry:0,s:1,v:0,open:0},cal:{x:0,y:0,z:-.9,rx:-8,ry:0,s:1,v:0,th:0}};
  var lp=leaves.map(function(){return 0}),sp=sheets.map(function(){return 0}),ni=0,ci=0,u=10,narrow=false,tw=[],raf=0,focus='',phase='closed';
  function size(){var W=st.clientWidth,H=st.clientHeight;narrow=W/H<1;u=narrow?Math.min(W/34,H/52):Math.min(W/58,H/37);R.style.setProperty('--u',u+'px');st.style.perspective=(u*120)+'px';draw()}
  function tf(o){return 'translate3d('+o.x*u+'px,'+o.y*u+'px,'+o.z*u+'px) rotateX('+o.rx+'deg) rotateY('+o.ry+'deg) scale('+o.s+')'}
  function load(img){if(img&&img.dataset.src&&!img.src){img.src=img.dataset.src}}
  var world=R.querySelector('.mt-world');
  function draw(){
    world.style.transform='rotateY('+S.w.ry+'deg)';
    ['env','nb','cal'].forEach(function(k){var o=S[k],el=O[k];el.style.transform=tf(o);el.style.visibility=o.v?'visible':'hidden'});
    var e=S.env;flap.style.transform='translateY('+(-11.75*u)+'px) translateZ('+(-1.32*u)+'px) rotateX('+e.flap+'deg)';
    rig.style.transform='translateX('+S.nb.open*8*u+'px)';
    leaves.forEach(function(L,k){var p=lp[k],zu=-T/2+T*(NL-k)/NL,zt=-T/2+T*(k+.5)/NL+.02,z=zu+(zt-zu)*p;L.style.transform='translateZ('+z*u+'px) rotateY('+(-180*p)+'deg)'});
    var any=S.nb.open>.01||lp[0]>.01;if(any)R.setAttribute('data-nbopen','');else R.removeAttribute('data-nbopen');
    var ry=(focus?0:S.w.ry)+S.nb.ry;O.nb.style.setProperty('--gl',(50-Math.sin(ry*Math.PI/180)*55)+'%');
    var th=S.cal.th,r=th*Math.PI/180,h=20.5*Math.cos(r),ay=-h/2,bl=2*20.5*Math.sin(r);
    cf.style.transform='translateY('+ay*u+'px) rotateX('+th+'deg)';
    cb.style.transform='translateY('+ay*u+'px) rotateX('+(-th)+'deg)';
    cbase.style.transform='translateY('+h/2*u+'px) rotateX(90deg) scaleY('+Math.max(bl/7,.001)+')';
    csh.style.transform='translateY('+(h/2+.02)*u+'px) rotateX(90deg)';
    rings.style.transform='translateY('+ay*u+'px)';
    sheets.forEach(function(E,k){var p=sp[k],a=th+p*(360-2*th),du=.04+.012*(NS-k),dt=-(.04+.012*(k+1)),d=du+(dt-du)*p;
      E.style.transform='translateY('+ay*u+'px) rotateX('+a+'deg) translateY('+.7*u+'px) translateZ('+d*u+'px)'});
  }
  function tick(now){var live=[];tw.forEach(function(t){if(now<t.t0){live.push(t);return}if(t.a===null)t.a=t.get();var q=t.d?Math.min(1,(now-t.t0)/t.d):1;t.set(t.a+(t.b-t.a)*ease(q));if(q<1)live.push(t);else if(t.done)t.done()});tw=live;draw();raf=tw.length?requestAnimationFrame(tick):0}
  function anim(get,set,b,d,delay,done){var now=performance.now();tw.push({get:get,set:set,a:null,b:b,d:RM?0:d,t0:now+(RM?0:(delay||0)),done:done});if(!raf)raf=requestAnimationFrame(tick)}
  function go(k,props,d,delay,done){var ks=Object.keys(props),n=ks.length;ks.forEach(function(p,i){anim(function(){return S[k][p]},function(v){S[k][p]=v},props[p],d,delay,i===n-1?done:null)})}
  function L(name){var w=!narrow;return{
    closed:{env:{x:0,y:0,z:0,rx:-8,ry:-24,s:w?1.25:1.05}},
    front:{env:{x:0,y:w?3:4,z:0,rx:-8,ry:0,s:w?1.1:.95}},
    all:w?{env:{x:0,y:8,z:-26,rx:-6,ry:0,s:.62},nb:{x:-13,y:-1,z:4,rx:-6,ry:24,s:1},cal:{x:13.5,y:.5,z:2,rx:-8,ry:-26,s:1}}
         :{env:{x:7.5,y:-12,z:-14,rx:-6,ry:-16,s:.5},nb:{x:-6,y:-10.5,z:2,rx:-6,ry:22,s:.66},cal:{x:0,y:10,z:4,rx:-8,ry:-22,s:.78}},
    nb:{nb:{x:0,y:0,z:5,rx:-6,ry:-26,s:w?1.25:1.05},env:{x:w?-80:-60,y:6,z:-30,rx:-6,ry:20,s:.7},cal:{x:w?80:60,y:2,z:-30,rx:-8,ry:-30,s:.8}},
    nbopen:{nb:{x:0,y:0,z:4,rx:-4,ry:0,s:w?1.18:.9}},
    cal:{cal:{x:0,y:2,z:5,rx:-10,ry:-26,s:w?1.3:1.3},env:{x:w?-80:-60,y:6,z:-30,rx:-6,ry:20,s:.7},nb:{x:w?80:60,y:0,z:-30,rx:-6,ry:-20,s:.8}},
    env:{env:{x:0,y:0,z:4,rx:-8,ry:-24,s:w?1.2:1},nb:{x:w?-80:-60,y:0,z:-30,rx:-6,ry:20,s:.8},cal:{x:w?80:60,y:2,z:-30,rx:-8,ry:-30,s:.8}}}[name]}
  function apply(name,d,delay,done){var l=L(name),ks=Object.keys(l);ks.forEach(function(k,i){go(k,l[k],d,delay,i===ks.length-1?done:null)})}
  function setPhase(p){phase=p;R.setAttribute('data-phase',p)}
  function label(){if(focus==='nb'){pg.textContent=(ni===0?'封面':names.nb[Math.min(ni,names.nb.length-1)])+'　'+ni+' / '+NL;bPrev.disabled=ni===0;bNext.disabled=ni>=NL}
    else if(focus==='cal'){pg.textContent=names.cal[ci]+'　'+(ci+1)+' / '+NS;bPrev.disabled=ci===0;bNext.disabled=ci>=NS-1}}
  function preload(){if(focus==='nb')for(var k=Math.max(0,ni-1);k<=Math.min(NL-1,ni+2);k++)[].forEach.call(leaves[k].querySelectorAll('img'),load);
    if(focus==='cal'||phase!=='closed')for(var j=ci;j<=Math.min(NS-1,ci+2);j++)load(sheets[j].querySelector('img'))}
  function setFocus(f){if(phase!=='open')return;var was=focus;
    focus=f;if(was==='nb'&&f!=='nb'&&ni>0){turnNb(0)}
   R.setAttribute('data-focus',f);S.w.ry=0;
    [].forEach.call(R.querySelectorAll('[data-mt-focus]'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-mt-focus')===f?'true':'false')});
    apply(f||'all',900);if(f==='nb'&&ni>0)apply('nbopen',900);label();preload()}
  function turnNb(n){n=Math.max(0,Math.min(NL,n));var from=ni;ni=n;preload();
    if(n>0&&from===0){go('nb',{open:1},700);if(focus==='nb')apply('nbopen',700)}
    if(n===0&&from>0){go('nb',{open:0},700,(from-1)*60+400);if(focus==='nb')apply('nb',800,(from-1)*60+300)}
    var lo=Math.min(from,n),hi=Math.max(from,n),seq=0;
    for(var k=lo;k<hi;k++)(function(k,o){anim(function(){return lp[k]},function(v){lp[k]=v},n>from?1:0,850,o*60)})(n>from?k:hi-1-(k-lo),seq++);label()}
  function turnCal(n){n=Math.max(0,Math.min(NS-1,n));var from=ci;ci=n;preload();var lo=Math.min(from,n),hi=Math.max(from,n),seq=0;
    for(var k=lo;k<hi;k++)(function(k,o){anim(function(){return sp[k]},function(v){sp[k]=v},n>from?1:0,950,o*70)})(n>from?k:hi-1-(k-lo),seq++);label()}
  function open(){if(phase!=='closed')return;setPhase('busy');S.w.ry=0;load(sheets[0].querySelector('img'));
    apply('front',600,0);
    go('env',{flap:0},650,600);
    var sc=L('front').env.s,y0=L('front').env.y;
    S.nb.x=0;S.nb.y=y0+1*sc;S.nb.z=.35*sc;S.nb.rx=-8;S.nb.ry=0;S.nb.s=sc*.98;S.cal.x=0;S.cal.y=y0+2.2*sc;S.cal.z=-.85*sc;S.cal.rx=-8;S.cal.ry=0;S.cal.s=sc*.98;S.cal.th=0;
    setTimeout(function(){S.nb.v=1;S.cal.v=1},RM?0:1250);
    go('cal',{y:y0-19*sc},800,1250);go('nb',{y:y0-21*sc},800,1400);
    apply('all',1000,2250);go('cal',{th:TH},900,2350,function(){setPhase('open');focus='';R.setAttribute('data-focus','');preload();
      [].forEach.call(R.querySelectorAll('[data-mt-focus]'),function(b){b.setAttribute('aria-pressed',b.getAttribute('data-mt-focus')===''?'true':'false')})})}
  function close(){if(phase!=='open')return;if(ni>0)turnNb(0);if(ci>0)turnCal(0);setPhase('busy');focus='';R.setAttribute('data-focus','');S.w.ry=0;
    var sc=L('front').env.s,y0=L('front').env.y,dl=ni>0||ci>0?900:0;
    apply('front',800,dl);go('cal',{th:0},700,dl);
    go('nb',{x:0,y:y0-21*sc,z:.35*sc,rx:-8,ry:0,s:sc*.98},800,dl);go('cal',{x:0,y:y0-19*sc,z:-.85*sc,rx:-8,ry:0,s:sc*.98},800,dl);
    go('nb',{y:y0+1*sc},700,dl+900);go('cal',{y:y0+2.2*sc},700,dl+1000,function(){S.nb.v=0;S.cal.v=0;
      go('env',{flap:180},650,0);apply('closed',800,500,function(){setPhase('closed')})})}
  R.querySelector('[data-mt-open]').addEventListener('click',open);
  R.querySelector('[data-mt-close]').addEventListener('click',close);
  [].forEach.call(R.querySelectorAll('[data-mt-focus]'),function(b){b.addEventListener('click',function(){setFocus(b.getAttribute('data-mt-focus'))})});
  bPrev.addEventListener('click',function(){focus==='nb'?turnNb(ni-1):turnCal(ci-1)});
  bNext.addEventListener('click',function(){focus==='nb'?turnNb(ni+1):turnCal(ci+1)});
  // drag rotate
  var drag=null;
  function tgt(){return phase==='closed'?S.env:focus?S[focus]:S.w}
  st.addEventListener('pointerdown',function(e){if(phase==='busy')return;drag={x:e.clientX,y:e.clientY,m:false,id:e.pointerId,t:e.target}});
  st.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.m&&Math.abs(dx)+Math.abs(dy)>6){drag.m=true;st.classList.add('is-drag');try{st.setPointerCapture(drag.id)}catch(_){}}
    if(!drag.m)return;var o=tgt();o.ry+=dx*.45;if(o!==S.w)o.rx=Math.max(-40,Math.min(30,o.rx-dy*.25));drag.x=e.clientX;drag.y=e.clientY;draw()});
  function up(e){if(!drag)return;var d=drag;drag=null;st.classList.remove('is-drag');if(d.m)return;
    if(phase==='closed'){open();return}if(phase!=='open')return;
    var ob=d.t.closest&&d.t.closest('.mt-obj'),k=ob&&ob.getAttribute('data-obj');
    if(!focus&&k)setFocus(k);else if(focus==='nb'&&k==='nb')turnNb(ni>=NL?0:ni+1);else if(focus==='cal'&&k==='cal')turnCal(ci>=NS-1?0:ci+1);else if(focus&&k&&k!==focus)setFocus(k)}
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',function(){drag=null;st.classList.remove('is-drag')});
  st.addEventListener('keydown',function(e){var o=tgt();
    if(e.key==='Enter'||e.key===' '){if(phase==='closed'){e.preventDefault();open()}return}
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var dir=e.key==='ArrowRight'?1:-1;
      if(focus==='nb')turnNb(ni+dir);else if(focus==='cal')turnCal(ci+dir);else{o.ry+=dir*20;draw()}}});
  if('ResizeObserver' in window)new ResizeObserver(size).observe(st);else addEventListener('resize',size);
  size();
})})();
