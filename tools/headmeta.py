# 為每一頁加上分享預覽（og/twitter）與網站小圖示；可重複執行
import re,glob,os,html,sys
ROOT=sys.argv[1] if len(sys.argv)>1 else '.'
BASE='https://jadeshih.github.io/jade-portfolioo/'
os.chdir(ROOT)
wk=open('works.html').read()+open('playground.html').read()
card={}
for m in re.finditer(r'href="works/(work-[^"]+)\.html"[^>]*>.*?<img src="([^"?]+)\.(?:webp|jpg)',wk):
    card.setdefault(m.group(1),m.group(2)+'.jpg')
pages=['index.html','works.html','about.html','contact.html','playground.html']+sorted(glob.glob('works/*.html'))
for f in pages:
    s=open(f).read()
    s=re.sub(r'\n?<!-- share:start -->.*?<!-- share:end -->','',s,flags=re.S)
    pre='../' if f.startswith('works/') else ''
    title=html.unescape(re.search(r'<title>(.*?)</title>',s).group(1))
    desc=html.unescape(re.search(r'<meta name="description" content="([^"]*)"',s).group(1))
    key=os.path.basename(f)[:-5]
    img=card.get(key,'public/og/og-home.jpg')
    url=BASE+('' if f=='index.html' else f)
    e=lambda x:html.escape(x,quote=True)
    block=f'''<!-- share:start -->
<link rel="icon" href="{pre}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{pre}favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{pre}apple-touch-icon.png">
<meta property="og:type" content="{'article' if pre else 'website'}">
<meta property="og:site_name" content="Jade Shih Portfolio">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{BASE}{img}">
<meta property="og:locale" content="zh_TW">
<meta name="twitter:card" content="summary_large_image">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no">
<!-- share:end -->'''
    s=re.sub(r'(<meta name="theme-color"[^>]*>)',lambda m:m.group(1)+'\n'+block,s,count=1)
    open(f,'w').write(s)
    print(f,'|',title,'|',img)
