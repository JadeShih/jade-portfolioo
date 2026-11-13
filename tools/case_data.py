T=lambda t:f'<span class="todo">待補：{t}</span>'
CASES={
 'work-01-report':dict(
  num='01',tone='cyan',
  title_en='Annual Report',title_zh='國泰金控年報',
  desc='Jade Shih 作品：國泰金控 2021 年報視覺設計與現場提案。',
  tags=['金融財經','國泰金控','2021'],
  tagline='Finance, told with a future in mind.',
  services='視覺設計・現場提案',
  cover='work-01-report.webp',cover_alt='國泰金控 2021 年報封面，數位與城市意象的立體插畫',
  meta=[('Client','國泰金控'),('Role','視覺設計・現場提案'),('Deliverables',T('例如封面、內頁、章節頁')),('Year',T('專案執行年份'))],
  notes=[('The brief',T('客戶的需求與目標，例如這份年報想傳達什麼訊息、給誰看。')),
         ('What I made',T('你負責的設計內容：封面插畫概念、版面系統、配色、字體選擇等。')),
         ('What happened next',T('提案結果或成效，例如客戶採用的方向、印量、獲得的回饋。'))],
  gallery=[dict(tone='cyan',img='work-01-report.webp',alt='年報封面',cap='封面主視覺'),
           dict(tone='light',ph='圖片待補：提案草稿或封面發展過程'),
           dict(tone='lime',ph='圖片待補：內頁版面或章節頁')],
  next=dict(title='2020新春電子月刊',attr='data-href="work-02-card.html" aria-disabled="true"')),
}
