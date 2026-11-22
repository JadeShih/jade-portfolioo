import json,os
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
  h=re.sub(r'\n?<!-- share:start -->.*?<!-- share:end -->','',h,flags=re.S)  # 分享資訊改由 tools/headmeta.py 產生
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
    # 一般擺放：一張一行全寬、統一黑色細框、可點擊放大（原本的疊放已停用）
    from PIL import Image as _I
    def _dim(p):
      try: return _I.open(os.path.join('/home/claude/site/public/works',p+'.jpg')).size
      except Exception: return (2000,1333)
    figs=''
    for g in imgs:
      wd,ht=_dim(g['img']);cap=g.get('cap','')
      fc=f'<figcaption>✦ {cap}</figcaption>' if cap else ''
      figs+=(f'<figure class="bq-fig"><button type="button" class="bq-fig__img" data-lb="gal" aria-label="放大檢視：{html.escape(cap or g["alt"])}">'
             f'<picture><source srcset="public/works/{g["img"]}.webp" type="image/webp"><img src="public/works/{g["img"]}.jpg" width="{wd}" height="{ht}" alt="{html.escape(g["alt"])}" loading="lazy" decoding="async"></picture></button>{fc}</figure>')
    galhtml=f'<div class="bq-sec cs-figs">{figs}</div>'
  else:
    galhtml=f'<div class="cs-gallery">{gal}</div>'
  SH=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'shapes.json')))
  dl,dr=w.get('deco',(('flower','yellow'),('scallop','pink')))
  deco=(f'<span class="jade-sticker cs-hero__st3" data-shape="{dl[0]}" data-tone="{dl[1]}" style="--jade-sticker-rotation:-12deg" aria-hidden="true">{SH[dl[0]]}</span>'
        f'<span class="jade-sticker cs-hero__st2" data-shape="{dr[0]}" data-tone="{dr[1]}" style="--jade-sticker-rotation:8deg" aria-hidden="true">{SH[dr[0]]}</span>')
  nx=w['next']
  body=f'''<a class="skip" href="#main">跳到主要內容</a>

{nav}

<main id="main" class="page-case">
<!-- 作品詳細頁草稿：標示「待補」的地方請 Jade 提供內容 -->
<header class="sec cs-hero" data-theme="brand" id="top">
  <div class="wrap">
    {deco}
    <ul class="cs-tags">{tags}</ul>
    <h1 class="cs-title">{w["title_en"]}<span>{w["title_zh"]}</span></h1>
{tagline}    <div class="cs-cover" data-tone="{w["tone"]}"><span class="jade-sticker cs-hero__st" data-shape="burst" data-tone="lime" style="--jade-sticker-rotation:-10deg" aria-hidden="true"><svg class="jade-sticker__shape" viewBox="0 0 128 128"><polygon points="{burst(16,62,47)}"/></svg><span class="jade-sticker__label"><b>{w["num"]}</b>Case</span></span><picture><source srcset="public/works/{w["cover"]}.webp" type="image/webp"><img src="public/works/{w["cover"]}.jpg" width="{w.get("cover_w",2000)}" height="{w.get("cover_h",1333)}"{(f' style="aspect-ratio:{w["cover_w"]}/{w["cover_h"]}"' if "cover_w" in w else "")} alt="{html.escape(w["cover_alt"])}" decoding="async" fetchpriority="high"></picture></div>
  </div>
</header>

<section class="sec cs-body{w.get('body_cls','')}" data-theme="light" aria-label="專案說明">
  {WAVE.format(c='')}
  <div class="wrap">
    <dl class="cs-meta">{meta}</dl>
    <div class="cs-overview">
      <p class="eyebrow cs-overview__label">Overview</p>
      <div class="cs-overview__body">{w["overview"]}</div>
    </div>
    <div class="cs-cards">{cards}</div>
    {galhtml}
    {w.get('extra','')}
  </div>
</section>

{w.get('after','')}
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
