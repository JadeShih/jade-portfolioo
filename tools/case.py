# 作品詳細頁產生器：每件作品一份資料，套同一個版型
import re,math,html,sys
SITE='/home/claude/site'
ab=open(f'{SITE}/about.html').read()
def up(s):
  s=re.sub(r'(?<![\w-])(href|src|srcset)="(?!https?:|mailto:|#|\.\./|\./)([^"]+)"',r'\1="../\2"',s)
  return s
head=ab[:ab.index('<a class="skip"')]
nav=ab[ab.index('<div class="navrow">'):ab.index('</nav></div>')+len('</nav></div>')].replace(' aria-current="page"','')
nav=nav.replace('href="works.html">Works</a>','href="works.html" aria-current="page">Works</a>')
band=ab[ab.index('<div class="name-band"'):ab.index('</div></div>',ab.index('<div class="name-band"'))+len('</div></div>')]
foot=ab[ab.index('<footer class="foot">'):ab.index('</footer>')+len('</footer>')]
cursor=ab[ab.index('<div class="ycur"'):ab.index('</div>',ab.index('<div class="ycur"'))+len('</div>')]
tail=ab[ab.index('<script src="site.js'):]
WAVE='<div class="wave{c}" aria-hidden="true"><svg viewBox="0 0 1440 64" preserveAspectRatio="none"><path d="M0 40 C 240 0, 480 0, 720 28 S 1200 64, 1440 20 V64 H0 Z" fill="currentColor"/></svg></div>'
ARROW='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>'
NEXT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
def burst(n,ro,ri,c=64): return ' '.join(f"{c+(ro if i%2==0 else ri)*math.cos(math.pi*i/n-math.pi/2):.1f},{c+(ro if i%2==0 else ri)*math.sin(math.pi*i/n-math.pi/2):.1f}" for i in range(n*2))
TODO=lambda t:f'<span class="todo">待補：{t}</span>'
def render(w):
  h=head.replace('<title>About Jade Shih</title>',f'<title>{w["title_zh"]} — Jade Shih</title>').replace(
    'content="Jade Shih 的完整介紹：十年品牌平面、整合設計與 UI/UX 經歷、能力與工作方式。"',f'content="{html.escape(w["desc"])}"')
  tags=''.join(f'<li>{t}</li>' for t in w['tags'])
  meta=''.join(f'<div class="cs-meta__item"><dt>{k}</dt><dd>{v}</dd></div>' for k,v in w['meta'])
  tagline=f'    <p class="cs-tagline">{w["tagline"]}</p>\n' if w.get('tagline') else ''
  cards=''.join(f'<article class="cs-card" data-tone="{c["tone"]}"><h2 class="cs-card__title">{c["title"]}<small>{c["zh"]}</small></h2><p class="cs-card__text">{c["text"]}</p><svg class="cs-card__deco" viewBox="0 0 128 128" aria-hidden="true"><polygon points="{burst(14,62,46)}"/></svg></article>' for c in w['cards'])
  gal=''
  for g in w['gallery']:
    inner=f'<picture><source srcset="public/works/{g["img"]}.webp" type="image/webp"><img src="public/works/{g["img"]}.jpg" width="2000" height="1333" alt="{html.escape(g["alt"])}" loading="lazy" decoding="async"></picture>' if g.get('img') else f'<span class="cs-shot__ph">{g["ph"]}</span>'
    cap=f'<figcaption>{g["cap"]}</figcaption>' if g.get('cap') else ''
    gal+=f'<figure class="cs-shot" data-tone="{g["tone"]}"><div class="cs-shot__frame">{inner}</div>{cap}</figure>'
  imgs=[g for g in w['gallery'] if g.get('img')]
  if w.get('gallery_style')=='stack' and imgs:
    items=''.join(f'<button type="button" class="cs-stack__item" data-i="{i}" aria-label="放大檢視：{html.escape(g["alt"])}"><picture><source srcset="public/works/{g["img"]}.webp" type="image/webp"><img src="public/works/{g["img"]}.jpg" width="2000" height="1333" alt="{html.escape(g["alt"])}" loading="lazy" decoding="async" draggable="false"></picture></button>' for i,g in enumerate(imgs))
    galhtml=f'<div class="cs-stack" data-n="{len(imgs)}">{items}</div>'
  else:
    galhtml=f'<div class="cs-gallery">{gal}</div>'
  nx=w['next']
  body=f'''<a class="skip" href="#main">跳到主要內容</a>

{nav}

<main id="main" class="page-case">
<!-- 作品詳細頁草稿：標示「待補」的地方請 Jade 提供內容 -->
<header class="sec cs-hero" data-theme="brand" id="top">
  <div class="wrap">
    <span class="jade-sticker cs-hero__st2" data-shape="scallop" data-tone="pink" style="--jade-sticker-rotation:8deg" aria-hidden="true"><svg class="jade-sticker__shape" viewBox="0 0 128 128" aria-hidden="true"><path d="M125.0,64.0 L124.6,65.6 L123.6,67.1 L122.1,68.6 L120.2,69.9 L118.2,71.1 L116.4,72.3 L114.9,73.4 L114.0,74.6 L113.7,75.9 L113.9,77.4 L114.7,79.0 L115.8,80.8 L117.0,82.8 L118.2,84.8 L119.0,86.8 L119.3,88.6 L119.1,90.3 L118.1,91.6 L116.6,92.6 L114.7,93.2 L112.4,93.7 L110.1,93.9 L107.9,94.2 L106.0,94.5 L104.6,95.2 L103.7,96.1 L103.2,97.5 L103.1,99.2 L103.3,101.3 L103.6,103.6 L103.8,105.9 L103.7,108.1 L103.3,110.0 L102.4,111.4 L101.0,112.3 L99.3,112.6 L97.3,112.4 L95.1,111.8 L92.9,111.1 L90.8,110.3 L88.9,109.8 L87.3,109.7 L86.0,110.0 L84.9,111.0 L84.1,112.5 L83.3,114.4 L82.6,116.5 L81.8,118.7 L80.8,120.7 L79.6,122.3 L78.2,123.3 L76.7,123.6 L75.0,123.2 L73.2,122.2 L71.5,120.8 L69.8,119.2 L68.2,117.6 L66.7,116.2 L65.3,115.3 L64.0,115.0 L62.7,115.3 L61.3,116.2 L59.8,117.6 L58.2,119.2 L56.5,120.8 L54.8,122.2 L53.0,123.2 L51.3,123.6 L49.8,123.3 L48.4,122.3 L47.2,120.7 L46.2,118.7 L45.4,116.5 L44.7,114.4 L43.9,112.5 L43.1,111.0 L42.0,110.0 L40.7,109.7 L39.1,109.8 L37.3,110.3 L35.1,111.1 L32.9,111.8 L30.7,112.4 L28.7,112.6 L27.0,112.3 L25.6,111.4 L24.7,110.0 L24.3,108.1 L24.2,105.9 L24.4,103.6 L24.7,101.3 L24.9,99.2 L24.8,97.5 L24.3,96.1 L23.4,95.2 L22.0,94.5 L20.1,94.2 L17.9,93.9 L15.6,93.7 L13.3,93.2 L11.4,92.6 L9.9,91.6 L8.9,90.3 L8.7,88.6 L9.0,86.8 L9.8,84.8 L11.0,82.8 L12.2,80.8 L13.3,79.0 L14.1,77.4 L14.3,75.9 L14.0,74.6 L13.1,73.4 L11.6,72.3 L9.8,71.1 L7.8,69.9 L5.9,68.6 L4.4,67.1 L3.4,65.6 L3.0,64.0 L3.4,62.4 L4.4,60.9 L5.9,59.4 L7.8,58.1 L9.8,56.9 L11.6,55.7 L13.1,54.6 L14.0,53.4 L14.3,52.1 L14.1,50.6 L13.3,49.0 L12.2,47.2 L11.0,45.2 L9.8,43.2 L9.0,41.2 L8.7,39.4 L8.9,37.7 L9.9,36.4 L11.4,35.4 L13.3,34.8 L15.6,34.3 L17.9,34.1 L20.1,33.8 L22.0,33.5 L23.4,32.8 L24.3,31.9 L24.8,30.5 L24.9,28.8 L24.7,26.7 L24.4,24.4 L24.2,22.1 L24.3,19.9 L24.7,18.0 L25.6,16.6 L27.0,15.7 L28.7,15.4 L30.7,15.6 L32.9,16.2 L35.1,16.9 L37.2,17.7 L39.1,18.2 L40.7,18.3 L42.0,18.0 L43.1,17.0 L43.9,15.5 L44.7,13.6 L45.4,11.5 L46.2,9.3 L47.2,7.3 L48.4,5.7 L49.8,4.7 L51.3,4.4 L53.0,4.8 L54.8,5.8 L56.5,7.2 L58.2,8.8 L59.8,10.4 L61.3,11.8 L62.7,12.7 L64.0,13.0 L65.3,12.7 L66.7,11.8 L68.2,10.4 L69.8,8.8 L71.5,7.2 L73.2,5.8 L75.0,4.8 L76.7,4.4 L78.2,4.7 L79.6,5.7 L80.8,7.3 L81.8,9.3 L82.6,11.5 L83.3,13.6 L84.1,15.5 L84.9,17.0 L86.0,18.0 L87.3,18.3 L88.9,18.2 L90.8,17.7 L92.9,16.9 L95.1,16.2 L97.3,15.6 L99.3,15.4 L101.0,15.7 L102.4,16.6 L103.3,18.0 L103.7,19.9 L103.8,22.1 L103.6,24.4 L103.3,26.7 L103.1,28.8 L103.2,30.5 L103.7,31.9 L104.6,32.8 L106.0,33.5 L107.9,33.8 L110.1,34.1 L112.4,34.3 L114.7,34.8 L116.6,35.4 L118.1,36.4 L119.1,37.7 L119.3,39.4 L119.0,41.2 L118.2,43.2 L117.0,45.2 L115.8,47.2 L114.7,49.0 L113.9,50.6 L113.7,52.1 L114.0,53.4 L114.9,54.6 L116.4,55.7 L118.2,56.9 L120.2,58.1 L122.1,59.4 L123.6,60.9 L124.6,62.4Z"/></svg></span>
    <ul class="cs-tags">{tags}</ul>
    <h1 class="cs-title">{w["title_en"]}<span>{w["title_zh"]}</span></h1>
{tagline}    <div class="cs-cover" data-tone="{w["tone"]}"><span class="jade-sticker cs-hero__st" data-shape="burst" data-tone="lime" style="--jade-sticker-rotation:-10deg" aria-hidden="true"><svg class="jade-sticker__shape" viewBox="0 0 128 128"><polygon points="{burst(16,62,47)}"/></svg><span class="jade-sticker__label"><b>{w["num"]}</b>Case</span></span><picture><source srcset="public/works/{w["cover"]}.webp" type="image/webp"><img src="public/works/{w["cover"]}.jpg" width="2000" height="1333" alt="{html.escape(w["cover_alt"])}" decoding="async" fetchpriority="high"></picture></div>
  </div>
</header>

<section class="sec cs-body" data-theme="light" aria-label="專案說明">
  {WAVE.format(c='')}
  <div class="wrap">
    <dl class="cs-meta">{meta}</dl>
    <div class="cs-overview">
      <p class="eyebrow cs-overview__label">Overview</p>
      <div class="cs-overview__body">{w["overview"]}</div>
    </div>
    <div class="cs-cards">{cards}</div>
    {galhtml}
  </div>
</section>

<section class="sec cs-next" data-theme="brand" aria-labelledby="t-next">
  {WAVE.format(c=' wave--flip')}
  <div class="wrap">
    <p class="eyebrow">Next project</p>
    <a class="cs-next__link" {nx["attr"]}><span class="cs-next__title" id="t-next">{nx["title"]}</span><span class="cs-next__go" aria-hidden="true">{NEXT}</span></a>
    <a class="jade-secondary-button cs-next__all" href="works.html"><span>View all works</span><span class="jade-secondary-button__icon" aria-hidden="true">{ARROW}</span></a>
  </div>
</section>

{band}
</main>

{foot}

{cursor}

{tail}'''
  return up(h)+up(body)
