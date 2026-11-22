# 15 美股事件行事曆：可操作的 HTML prototype（首頁 → 重要事件頁）
import math,random
P='public/works/work-15-calendar/'
def img(n,w,h,cls,alt=''):
  return f'<picture class="{cls}"><source srcset="{P}{n}.webp?v=1122" type="image/webp"><img src="{P}{n}.png?v=1122" width="{w}" height="{h}" alt="{alt}" draggable="false"></picture>'
def bar(t,extra=''): return f'<div class="clp-h"><h3><i></i>{t}</h3>{extra}</div>'
def spark(seed,up):
  r=random.Random(seed);pts=[];y=20
  for i in range(40):
    y+=r.uniform(-2.2,2.2)+(-.35 if up else .3);y=max(4,min(36,y));pts.append((i*86/39,y))
  d=' '.join(f'{x:.1f},{y:.1f}' for x,y in pts);c='#47AB75' if up else '#F84444'
  return (f'<svg class="clp-spark" viewBox="0 0 86 43" aria-hidden="true"><defs><linearGradient id="g{seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c}" stop-opacity=".55"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></linearGradient></defs>'
          f'<line x1="0" y1="20" x2="86" y2="20" stroke="#555" stroke-dasharray="2 2" stroke-width=".5"/><polygon points="0,43 {d} 86,43" fill="url(#g{seed})"/><polyline points="{d}" fill="none" stroke="{c}" stroke-width="1"/></svg>')
def proto():
  chips=[('提早休市','12/24 ET 1:00pm',''),('休市','12/25 聖誕節','r'),('提早休市','12/31 ET 1:00pm',''),('休市','01/01 元旦','r')]
  ch=''.join(f'<span class="clp-chip"><b class="{c}">{a}</b>{t}</span>' for a,t,c in chips)
  eco=[('FED官方利率','12/26 2:00 (ET)'),('美國核心CPI年增率','12/27 2:00 (ET)'),('美國GDP成長率','12/29 8:30 (ET)'),('美國非農業就業人數月增減','01/09 8:30 (ET)')]
  stk=[('NVDA','12/25 (ET)'),('AAPL','12/26 (ET)'),('TSLA','12/29 (ET)'),('GOOG','12/30 (ET)'),('MSFT','12/31 (ET)'),('META','01/05 (ET)')]
  ecoc=''.join(f'<button type="button" class="clp-card" data-go="eco"><b>{a}</b><small>{b}</small></button>' for a,b in eco)
  stkc=''.join(f'<button type="button" class="clp-card clp-card--s" data-go="stk"><b>{a}</b><small>{b}</small></button>' for a,b in stk)
  idx=[('道瓊指數','44323.07',0),('S&amp;P 500','6305.06',1),('那斯達克','44323.07',0),('費城半導體','6305.06',1)]
  tiles=''.join(f'<div class="clp-tile"><small>{n}</small><b>{v}</b><div class="clp-tile__row"><p class="{"up" if u else "dn"}">{"▲8.81" if u else "▼19.12"}<br>{"0.14%" if u else "-0.04%"}</p>{spark(k+3,u)}</div></div>' for k,(n,v,u) in enumerate(idx))
  rooms=''.join(f'<div class="clp-row">01.{26+k}({"一二三四五"[k]}) 11:00 ｜北京時間</div>' for k in range(5))
  home=(f'<section class="clp-view clp-view--home" data-view="home">{img("proto-home-top",1170,273,"clp-top","Mike 是麥克 App 首頁頂部")}'
    f'<div class="clp-body" data-dy>'
    f'{bar("美股行事曆")}<div class="clp-x" data-dx>{ch}</div>'
    f'{bar("美股關鍵日程")}<div class="clp-seg"><div class="clp-seg__g" role="tablist"><button type="button" role="tab" aria-selected="true" data-seg="eco">經濟數據</button><button type="button" role="tab" aria-selected="false" data-seg="stk">個股財報</button></div>'
    f'<button type="button" class="clp-more" data-go="cur" aria-label="查看全部重要事件"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>'
    f'<div class="clp-x" data-dx data-pane="eco">{ecoc}</div><div class="clp-x" data-dx data-pane="stk" hidden>{stkc}</div>'
    f'{bar("大盤")}<div class="clp-tiles">{tiles}</div>'
    f'{bar("自選股","<span>查看我的自選股 &gt;</span>")}'
    f'{bar("語音聊天室","<span>【社團】&gt;【語音聊天室】</span>")}<div class="clp-rows">{rooms}</div>'
    f'</div>{img("proto-tabbar",1170,249,"clp-tab","")}</section>')
  def stat(a,b,c):
    cl=lambda v:'pos' if v.startswith('+') else 'neg' if v.startswith('-') else ''
    return '<dl class="clp-stat">'+''.join(f'<div><dt>{k}</dt><dd class="{cl(v)}">{v}</dd></div>' for k,v in (('預估',a),('實際',b),('前值',c)))+'</dl>'
  mac=[('2025/12/24  1:00 PM (ET)','昨日','提早休市',None),('2025/12/25','今日','聖誕節 休市',None),
       ('2025/12/26  2:00 (ET)','明日','FED官方利率',('0.5%','0.5%','0.5%')),
       ('2025/12/27  2:00 (ET)','','美國核心CPI年增率',('+0.5%','-0.5%','0%')),
       ('2025/12/29  8:30 (ET)','','美國GDP成長率',('+0.5%','-0.5%','0%')),
       ('2025/12/31  1:00 PM (ET)','','提早休市',None),
       ('2026/01/01','','元旦 休市',None),
       ('2026/01/09  8:30 (ET)','','美國非農業就業人數月增減',('—','—','25.6萬'))]
  def tag(t): return f'<span class="clp-tag{" is-today" if t=="今日" else ""}">{t}</span>' if t else ''
  macl=''.join(f'<article class="clp-ev{" is-past" if t=="昨日" else ""}"><p class="clp-ev__d">{d}{tag(t)}</p><h5>{h}</h5>{stat(*s) if s else ""}</article>' for d,t,h,s in mac)
  TK='NVDA AMZN NASDAQGS:FCNC.A GOOG MSFT AMZN META AAPL TSLA 2222.SR AVGO BRK-B WMT LLY JPM 005930.KS TCEHY V'.split()
  def grp(title,dates):
    out=f'<h5 class="clp-gt">{title}</h5>'
    for d,t,o,first in dates:
      i=TK.index(first);tk=''.join(f'<span>{x}</span>' for x in TK[i:]+TK[:i])
      out+=(f'<div class="clp-acc{" is-open" if o else ""}"><button type="button" class="clp-acc__h" aria-expanded="{"true" if o else "false"}"><span>{d}{tag(t)}</span>'
            f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
            f'<div class="clp-tk">{tk}<button type="button" class="clp-tk__more" aria-label="展開全部代號"><svg viewBox="0 0 16 4" aria-hidden="true"><circle cx="2" cy="2" r="2"/><circle cx="8" cy="2" r="2"/><circle cx="14" cy="2" r="2"/></svg></button></div></div>')
    return out
  four=(grp('道瓊工業指數成分股｜財報(預估)',[('2025/12/25','今日',1,'NVDA'),('2025/12/26','明日',0,'AAPL')])+grp('標普 500 指數成分股｜財報(預估)',[('2025/12/29','',0,'TSLA'),('2025/12/30','',0,'GOOG')])
        +grp('那斯達克綜合指數成分股｜財報(預估)',[('2025/12/31','',0,'MSFT')])+grp('羅素 2000 指數成分股｜財報(預估)',[('2026/01/05','',0,'META')]))
  mine=grp('我的自選股｜財報(預估)',[('2025/12/25','今日',1,'NVDA'),('2025/12/30','',0,'GOOG')])
  diary=grp('麥克投資日誌｜財報(預估)',[('2025/12/26','明日',1,'AAPL')])
  flt=[('all','不限'),('four','四大指數成分股'),('mine','我的自選股'),('diary','麥克投資日誌')]
  fl=''.join(f'<button type="button" data-f="{k}" aria-pressed="{"true" if k=="four" else "false"}">{t}</button>' for k,t in flt)
  ev=(f'<section class="clp-view clp-view--ev" data-view="ev" aria-hidden="true">{img("proto-ev-top",1170,264,"clp-top","重要事件頁頂部")}'
      f'<button type="button" class="clp-back" aria-label="返回首頁"></button><button type="button" class="clp-info" aria-label="事件說明"></button>'
      f'<div class="clp-tabs" role="tablist"><button type="button" role="tab" data-tab="eco" aria-selected="true">經濟數據</button><button type="button" role="tab" data-tab="stk" aria-selected="false">個股財報</button></div>'
      f'<div class="clp-body" data-dy data-tpane="eco"><div class="clp-list">{macl}</div></div>'
      f'<div class="clp-body" data-dy data-tpane="stk" hidden><div class="clp-flt" data-dx>{fl}</div>'
      f'<div class="clp-g" data-g="four">{four}</div><div class="clp-g" data-g="all" hidden>{four}</div><div class="clp-g" data-g="mine" hidden>{mine}</div><div class="clp-g" data-g="diary" hidden>{diary}</div></div>'
      f'{img("proto-tabbar",1170,249,"clp-tab","")}'
      f'<div class="clp-sheet" hidden><div class="clp-sheet__c"><h5>經濟數據</h5><p>提供近期重要的總經數據，例如升降息、核心 CPI、非農、GDP 成長率，並列出預估、實際與前值。</p><h5>個股財報</h5><p>提供近期將公布財報的個股，預設顯示四大指數成分股，可再依自選股等條件篩選。</p><button type="button" class="clp-sheet__x">知道了</button></div></div></section>')
  return (f'<div class="clp"><div class="clp-phone"><span class="clp-phone__island" aria-hidden="true"></span><div class="clp-fit"><div class="clp-app">{home}{ev}</div></div></div></div>')
