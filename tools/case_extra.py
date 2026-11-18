import json,os
import html
P='public/works/'
def pic(name,w,h,alt,lazy=True):
  return (f'<picture><source srcset="{P}{name}.webp" type="image/webp"><img src="{P}{name}.jpg" width="{w}" height="{h}" alt="{html.escape(alt)}"'
          f'{" loading=\"lazy\"" if lazy else ""} decoding="async"></picture>')
def head(eyebrow,en,zh,lead=''):
  l=f'<p class="cs-sec__lead">{lead}</p>' if lead else ''
  return f'<header class="cs-sec__head"><p class="eyebrow">{eyebrow}</p><h2 class="cs-sec__title">{en}<small>{zh}</small></h2>{l}</header>'
def strip(group,items,cls=''):
  out=''.join(f'<button type="button" class="cs-strip__item" data-lb="{group}" aria-label="放大檢視：{html.escape(a)}">{pic(n,w,h,a)}</button>' for n,w,h,a in items)
  return f'<div class="cs-strip {cls}" style="--n:{len(items)}">{out}</div>'

def kolapp():
  props=[('a','科技 K 線','葉片融入股市 K 線，呈現正成長姿態，象徵股價上升與穩健增值。',True,'cyan'),
         ('b','活力綠葉','樹葉結合頻道名稱，圓潤立體字與排版節奏，傳遞溫暖積極的能量。',False,'lime'),
         ('c','書法藤蔓','樹葉與藤蔓融入書法標準字，以精緻專業塑造高信賴感。',False,'yellow')]
  cards=''
  for k,name,desc,final,tone in props:
    sets='|'.join(f'../{P}work-05-kolapp-prop-{k}{i}.webp' for i in range(1,5))
    fin='<span class="cs-prop__final">Final</span>' if final else ''
    cards+=(f'<button type="button" class="cs-prop" data-tone="{tone}" data-lb-set="{sets}" data-lb-alt="提案 {k.upper()} 款：{name}" aria-label="查看提案 {k.upper()} 款「{name}」完整 4 頁">'
            f'<span class="cs-prop__img">{pic(f"work-05-kolapp-prop-{k}1",2000,1636,f"提案 {k.upper()} 款主視覺：{name}")}{fin}</span>'
            f'<span class="cs-prop__meta"><span class="cs-prop__key">{k.upper()}</span><span class="cs-prop__txt"><b>{name}</b><span>{desc}</span></span></span>'
            f'<span class="cs-prop__more">看完整提案 4 頁 <span aria-hidden="true">→</span></span></button>')
  sw=[('Primary','#2CF8B4'),('Secondary','#24BB88'),('Gradient','linear-gradient(180deg,#D0E9A8,#2CF8B4)','#D0E9A8 → #2CF8B4'),
      ('Background','#141414'),('Background 2','#212121'),('Line','#2F2F2F'),('Line 2','#595959'),('Text 2nd','#7A7A7A'),('Text 3rd','#ABABAB')]
  swh=''.join(f'<li><span class="cs-sw__chip" style="background:{s[1]}"></span><b>{s[0]}</b><code>{s[2] if len(s)>2 else s[1]}</code></li>' for s in sw)
  brand=(f'<div class="cs-brand">'
         f'<figure class="cs-tile cs-tile--logo"><button type="button" class="cs-tile__zoom" data-lb="brand" aria-label="放大檢視：好葉智能選股 Logo">{pic("work-05-kolapp-logo",512,512,"好葉智能選股 Logo：葉片融合 K 線上升箭頭")}</button><figcaption>Logo 設定</figcaption></figure>'
         f'<figure class="cs-tile cs-tile--color"><ul class="cs-sw">{swh}</ul><figcaption>顏色設定</figcaption></figure>'
         f'<figure class="cs-tile cs-tile--icon"><div class="cs-tile__icons"><button type="button" class="cs-tile__zoom" data-lb="brand" aria-label="放大檢視：App Icon">{pic("work-05-kolapp-icon-l",300,300,"好葉智能選股 App Icon")}</button>'
         f'<button type="button" class="cs-tile__zoom cs-tile__tab" data-lb="brand" aria-label="放大檢視：功能圖示">{pic("work-05-kolapp-tabicons",376,188,"底部導覽列功能圖示：一般與選取狀態")}</button></div><figcaption>Icon 設定</figcaption></figure>'
         f'</div>')
  store=[(f'work-05-kolapp-store-{i}',416,736,a) for i,a in enumerate(['商店頁 1：好葉智能選股主視覺','商店頁 2：好葉持股一次看','商店頁 3：好葉持倉／觀察','商店頁 4：三大選股策略','商店頁 5：個股體質雷達','商店頁 6：APP 用戶專屬互動','商店頁 7：獨家內容全收錄'],1)]
  onb=[('work-05-kolapp-splash',388,848,'APP 啟動畫面')]+[(f'work-05-kolapp-onboard-{i}',388,844,f'新手導覽第 {i} 頁') for i in range(1,7)]
  inapp=(f'<div class="cs-screens">'
         f'<button type="button" class="cs-screens__wide" data-lb="inapp" aria-label="放大檢視：選股清單頁">{pic("work-05-kolapp-list",964,844,"選股清單頁：好葉清單、潛力成長等分類與個股指標")}</button>'
         f'<button type="button" data-lb="inapp" aria-label="放大檢視：VIP 文章列表">{pic("work-05-kolapp-content-1",388,844,"內容頁：VIP 文章列表")}</button>'
         f'<button type="button" data-lb="inapp" aria-label="放大檢視：影音內容列表">{pic("work-05-kolapp-content-2",388,844,"內容頁：影音內容列表")}</button>'
         f'</div>')
  health=[(f'work-05-kolapp-health-{i}',390,844,f'個股體質雷達：{g}') for i,g in enumerate(['A 級成長型','C 級成長型','E 級：股息型','B 級成長型','A 級成長型・獲利面向'],1)]
  return (f'<section class="cs-sec" aria-label="主視覺提案">{head("Proposal","3 Directions","主視覺提案","從品牌意象、視覺概念到風格定位共提出三款方向，最終由 A 款「科技 K 線」定案。點擊卡片可看完整提案。")}<div class="cs-props">{cards}</div></section>'
          f'<section class="cs-sec" aria-label="品牌設定">{head("Brand system","Brand System","Logo・顏色・Icon 設定")}{brand}</section>'
          f'<section class="cs-sec" aria-label="APP 商店頁">{head("App store","Store Screens","APP 商店頁")}{strip("store",store,"cs-strip--store")}</section>'
          f'<section class="cs-sec" aria-label="啟動與新手導覽">{head("Onboarding","Launch &amp; Onboarding","登入頁・新手導覽頁")}{strip("onb",onb)}</section>'
          f'<section class="cs-sec" aria-label="APP 內頁">{head("In-app","Inside The App","APP 內頁設計")}{inapp}<p class="cs-sec__sub">個股體質雷達：A–E 五階等級</p>{strip("health",health)}</section>')

def kolapp2():
  B='work-05-betterleaf/web-'
  SH=json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'shapes.json')))
  def kh(eb,en,zh,lead=''):
    l=f'<p class="kl-head__lead">{lead}</p>' if lead else ''
    return f'<header class="kl-head"><p class="kl-eyebrow">{eb}</p><h2 class="kl-title">{en}<small>{zh}</small></h2>{l}</header>'
  def zoom(name,w,h,alt,group='kl',cls=''):
    return f'<button type="button" class="{cls}" data-lb="{group}" aria-label="放大檢視：{html.escape(alt)}">{pic(name,w,h,alt)}</button>'
  props=[('a',2,'科技 K 線','葉片融入股市 K 線，呈現正成長姿態，象徵股價上升與穩健增值。',True),
         ('b',3,'活力綠葉','樹葉結合頻道名稱，圓潤立體字與排版節奏，傳遞溫暖積極的能量。',False),
         ('c',4,'書法藤蔓','樹葉與藤蔓融入書法標準字，以精緻專業塑造高信賴感。',False)]
  pc=''
  for k,n,name,desc,final in props:
    sets='|'.join(f'../{P}{B}{24+n-1}-{i}.webp' for i in range(1,4))
    fin='<span class="kl-prop__final">Final</span>' if final else ''
    pc+=(f'<article class="kl-prop{" is-final" if final else ""}">'
         f'<span class="kl-prop__img">{pic(B+str(n),1203,740,f"提案 {k.upper()} 款：{name}")}{fin}</span>'
         f'<span class="kl-prop__txt"><b><i>{k.upper()}</i>{name}</b><span>{desc}</span></span></article>')
  onb=[(10,'啟動畫面','品牌 Logo 與 CMoney 標示'),(12,'三大選股策略','壓倉股、潛力成長、多元配置'),(13,'智能演算 × 策略','關鍵指標一眼找出潛力標的'),
       (14,'個股體質雷達','五大面向、五階等級'),(15,'專屬互動空間','與好葉直接交流、共學成長'),(16,'獨家內容','VIP 深度分析一站收錄')]
  onbh=''.join(f'<figure class="kl-onb__item">{zoom(B+str(n),1170,2532,t,"onb")}<figcaption><span>{i:02d}</span><b>{t}</b>{d}</figcaption></figure>' for i,(n,t,d) in enumerate(onb,1))
  def feat(num,en,zh,shots,notes,flip=False):
    sh=''.join(f'<span class="kl-feat__shot">{pic(n,w,h,a)}</span>' for n,w,h,a in shots)
    nt=''.join(f'<li><span>{j}</span>{t}</li>' for j,t in enumerate(notes,1))
    return (f'<article class="kl-feat{" kl-feat--flip" if flip else ""}" data-n="{len(shots)}"><div class="kl-feat__shots">{sh}</div>'
            f'<div class="kl-feat__txt"><p class="kl-eyebrow">Feature {num:02d}</p><h3>{en}<small>{zh}</small></h3><ol>{nt}</ol></div></article>')
  feats=(feat(1,'Stock Picks','選股清單',[(B+'18',1673,1446,'選股清單頁')],
              ['分頁切換好葉清單、好葉持倉與三大選股策略','以葉子圖示分級，潛在價值空間一眼看懂','紅綠標籤即時提示連續成長／連續下降'])+
         feat(2,'Health Radar','個股體質雷達',[(B+'19',1170,2533,'體質雷達：A 級成長型'),(B+'21',1170,2533,'體質雷達：E 級股息型'),(B+'20',1170,2533,'體質雷達：C 級成長型')],
              ['成長、股息、估值、健康、獲利五大評估面向','A–E 五階等級，綠紅配色直覺區分體質好壞','逐條列出指標是否達標，判斷有依據'],True)+
         feat(3,'VIP Content','內容專區',[(B+'22',1170,2533,'VIP 文章列表'),(B+'23',1170,2533,'影音內容列表')],
              ['文章／影音分頁，免費與 VIP 內容清楚區隔','VIP 標籤與主視覺封面強化付費價值','統一封面版型，延續品牌視覺語言']))
  return (f'<section class="kl" aria-label="好葉智能選股 品牌與介面設計">'
    f'<figure class="kl-full kl-kv">{zoom(B+"1",2400,1454,"好葉智能選股主視覺：Logo 與標語「你的投資引路人」")}</figure>'
    f'<div class="wrap">'
    f'<section class="kl-block">{kh("Proposal","3 Directions","主視覺提案","業主給予高度創作自由，從品牌意象到風格定位提出三款方向，最終由 A 款定案。")}<div class="kl-props">{pc}</div></section>'
    f'<section class="kl-block kl-logo">{kh("Logo concept","Leaf × K-Line","Logo 設計概念")}'
    f'<div class="kl-logo__grid"><div class="kl-logo__formula"><img src="{P}{B}5.webp" width="1200" height="329" alt="設計元素：葉片 ＋ K 線 ＝ 好葉智能選股 Logo" loading="lazy">'
    f'</div>'
    f'<p class="kl-logo__txt">葉片內部融入股市 K 線元素，呈現正成長的姿態，象徵股價上升、投資增值與穩健發展，傳達智慧投資帶來財富增長的意涵；也讓 Logo 在視覺上更直觀地與金融領域建立聯繫。</p></div>'
    f'{zoom(B+"6",2000,1002,"Logo 淺色版與深色版","kl","kl-round")}</section>'
    f'<section class="kl-block">{kh("Brand system","Color &amp; Icon","顏色・Icon・字體設定")}{zoom(B+"7",2000,1205,"品牌色彩、App Icon、功能圖示與 Noto Sans 字體設定","kl","kl-plain")}</section>'
    f'</div>'
    f'<figure class="kl-full kl-mid">{zoom(B+"8",2000,1144,"APP 啟動畫面手機情境圖")}</figure>'
    f'<div class="wrap">'
    
    f'<section class="kl-block kl-onb2">'
    f'<div class="kl-onb2__txt">{kh("Onboarding","First Launch","登入頁・新手導覽")}'
    f'<ol class="kl-steps">'+''.join(f'<li data-i="{j}"><button type="button"><span>{j+1:02d}</span><b>{t}</b><em>{d}</em></button></li>' for j,(n,t,d) in enumerate(onb))+'</ol>'
    f'</div>'
    f'<div class="kl-onb2__track">'+''.join(f'<figure class="kl-onb2__item"><span class="kl-num" aria-hidden="true">{SH["circle"]}<b>{j+1:02d}</b></span><button type="button" data-lb="onb" aria-label="放大檢視：{html.escape(t)}">{pic(B+str(n),1170,2532,t)}</button></figure>' for j,(n,t,d) in enumerate(onb))+'</div>'
    f'<div class="kl-dots" role="tablist" aria-label="切換新手導覽頁面"></div>'
    f'</section>'
    f'<section class="kl-block">{kh("Inside the app","Key Features","核心功能")}{feats}</section>'
    f'</div>'
    f'<figure class="kl-full kl-end">{zoom(B+"24",2400,980,"手持手機，資料夾中的好葉智能選股 App Icon")}<figcaption class="kl-end__txt">That’s a wrap<small>感謝觀看</small></figcaption></figure>'
    f'</section>')

def ph(label,ratio='16/9',note=''):
  n=f'<small>{note}</small>' if note else ''
  return f'<div class="ph" style="aspect-ratio:{ratio}"><span><b>配圖</b>{label}{n}</span></div>'

def chat():
  M='work-06-chat-mock/'
  C='work-06-chat/web-'
  def phone(n,alt): return f'<div class="ch-phone">{pic(M+n,390,844,alt)}</div>'
  def sh(eb,en,zh,lead=''):
    l=f'<p class="cs-sec__lead">{lead}</p>' if lead else ''
    return f'<header class="cs-sec__head"><p class="eyebrow">{eb}</p><h2 class="cs-sec__title">{en}<small>{zh}</small></h2>{l}</header>'
  pains=[('01','找不到','想回顧重要公告、投資事件或作者觀點，只能不斷往上滑，效率低下。'),
         ('02','被淹沒','關鍵訊息很快被新訊息蓋過，降低了訊息本身的價值。'),
         ('03','不想留','訊息量快速累積，用戶對聊天室的黏著度可能下降。')]
  ph_html=''.join(f'<article class="ch-pain"><span class="ch-pain__no">{n}</span><h3>{t}</h3><p>{d}</p></article>' for n,t,d in pains)
  users=[('一般用戶','訊息數量龐大時，想輸入關鍵字快速找到過往對話。','pink'),
         ('一般用戶','找到目標訊息後，想點擊直接跳到原位置、回顧上下文。','pink'),
         ('產品經理／營運','想提供穩定快速的搜尋，提高黏著度並維持競爭力。','cyan'),
         ('客服／管理者','處理糾紛時，想快速找到相關紀錄、降低人力成本。','cyan')]
  us=''.join(f'<article class="ch-user" data-tone="{t}"><b>{r}</b><p>身為{r}，{d}</p></article>' for r,d,t in users)
  def dec(num,title,zh,points,img,flip=False):
    pts=''.join(f'<li>{p}</li>' for p in points)
    return (f'<article class="ch-dec{" ch-dec--flip" if flip else ""}"><div class="ch-dec__img">{img}</div>'
            f'<div class="ch-dec__txt"><p class="eyebrow">Decision {num:02d}</p><h3>{title}<small>{zh}</small></h3><ul>{pts}</ul></div></article>')
  decs=(dec(1,'Smart Snippet','搜尋結果摘要',[
            '每則結果最多兩行，以「關鍵句＋前後句平均擴展」組成摘要，一眼看出上下文',
            '關鍵字以主色高亮；同一則訊息有多組關鍵字只算一筆結果，但全部高亮',
            '裁切時絕不切斷關鍵字，超出部分以「…」收尾'],f'<div class="ch-sq">{pic(C+"05",1200,1200,"搜尋結果摘要：關鍵字高亮的兩行摘要")}</div>')+
        dec(2,'Two Tabs','作者／全部 雙頁籤',[
            '把作者（Mike是麥克）的發言獨立成第一個 Tab，最有價值的觀點優先看到',
            '預設頁籤規則：作者有結果先選作者；作者無結果自動切到「全部」',
            '結果上方標註「僅顯示近三個月結果」，讓搜尋範圍透明'],f'<div class="ch-sq">{pic(C+"06",1200,1200,"作者／全部雙頁籤與搜尋範圍提示")}</div>',True)+
        dec(3,'Highlight Mode','跳回原訊息檢視',[
            '點擊結果直接跳回聊天室中的原位置，關鍵字以色塊標示',
            '底部提供 ↑↓ 切換上一則／下一則結果，到頭尾時自動 disable',
            '「返回搜尋結果」一鍵回到列表，不必重新搜尋'],f'<div class="ch-sq">{pic(C+"07",1200,1200,"Highlight 模式：跳回原訊息並可切換上下則")}</div>'))
  states=[('搜尋錯誤','08'),('查詢無結果','09'),('Loading',''),('只輸入一個關鍵字',''),('Tab 最大寬度',''),('Tab 名稱過長',''),('往下載入',''),('載入至最底部',''),('訊息為一行',''),('被引用訊息不 highlight',''),('第一則：上一則 disable',''),('最後一則：下一則 disable','')]
  st=''.join(f'<li>{x}</li>' for x in states)
  return (
    f'<section class="cs-sec ch-problem">{sh("The problem","What Went Wrong","發生了什麼問題")}'
    f'<p class="ch-big">聊天室沒有搜尋功能，<em>訊息越多，越難找到重要的那一則。</em></p>'
    f'<div class="ch-problem__grid"><div class="ch-pains">{ph_html}</div><div class="ch-pimg">{pic(C+"01",2400,1366,"聊天室訊息堆疊，重要訊息被淹沒的示意")}</div></div></section>'
    f'<section class="cs-sec">{sh("Who needs it","User Stories","誰需要這個功能")}<div class="ch-users">{us}</div></section>'
    f'<section class="cs-sec">{sh("The solution","How I Solved It","我怎麼解決","以「找得到 → 看得懂 → 回得去」為主軸：搜尋、看摘要判斷、跳回原訊息檢視上下文。")}'
    f'<div class="ch-rib"><svg class="ch-rib__bg" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path d="M-20 250 C 180 140, 300 330, 520 290 S 820 150, 1000 260 S 1180 300, 1230 200" fill="none" stroke="#C2FF0A" stroke-width="54" stroke-linecap="round"/></svg>'
      f'<figure class="ch-rib__step"><figcaption><span>1</span><b>Search</b>輸入關鍵字</figcaption><div class="ch-phone">{pic(C+"02",1170,2532,"Search：輸入關鍵字")}</div></figure>'
      f'<span class="ch-rib__arrow" aria-hidden="true">→</span>'
      f'<figure class="ch-rib__step"><figcaption><span>2</span><b>Find</b>看摘要找到目標訊息</figcaption><div class="ch-phone">{pic(C+"03",1170,2532,"Find：看摘要找到目標訊息")}</div></figure>'
      f'<span class="ch-rib__arrow" aria-hidden="true">→</span>'
      f'<figure class="ch-rib__step"><figcaption><span>3</span><b>Jump</b>跳回原訊息、回顧上下文</figcaption><div class="ch-phone">{pic(C+"04",1170,2532,"Jump：跳回原訊息、回顧上下文")}</div></figure>'
      f'</div></section>'
    f'<section class="cs-sec">{sh("Key decisions","Design Decisions","關鍵設計決策")}{decs}</section>'
    f'<section class="cs-sec">{sh("Spec","Every State Covered","完整狀態與規格","交付給工程的不只畫面，還包含 12 種 UI 狀態、iOS／Android 長按流程與搜尋規則。")}'
    f'<div class="hcar"><div class="hcar__track">'+''.join(f'<figure class="hcar__item">{(f"<div class=hcar__img>"+pic(C+c,1200,2147,x)+"</div>") if c else ph("畫面待提供","1200/2147")}<figcaption>{x}</figcaption></figure>' for x,c in states)+'</div><div class="kl-dots hcar__dots"></div></div></section>'

    f'<section class="cs-sec ch-result">{sh("Outcome","What Happened Next","後續成果")}<p class="ch-big ch-big--sm">規格完整交付工程，<em>iOS／Android 雙平台上線。</em></p></section>'
  )
