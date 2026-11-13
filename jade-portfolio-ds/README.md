# Jade Portfolio DS

線上預覽：`index.html`（元件模擬頁面）。設計系統檔案：`tokens.json`、`tokens.css`、`components/`。

大膽、俏皮、有系統：用壓縮超粗的海報字、霧藍底色和一抹萊姆，做出「讓品牌被記住」的作品集。

## 設計原則

1. **單一主色鋪底，一個高彩點綴。** `jade-sys-color-primary`（霧藍）負責氛圍，`jade-sys-color-secondary`（萊姆）負責重點。比例：底色 60%、文字與深色元素 30%、萊姆 7%、輔助色 3%。
2. **字重製造層級。** 標題用 Anton（`display-large`、`headline-large`、`headline-medium`），內文用 Space Grotesk 400–500。跳過中間字重，不要用 Anton 排內文。
3. **全面圓潤，巢狀圓角。** 卡片 `jade-sys-shape-corner-extra-large` → 內圖 `jade-sys-shape-corner-large` → 按鈕 `jade-sys-shape-corner-full`。畫面上不出現直角。
4. **貼紙承載次要資訊。** 年資、專案數、地點放在不規則形狀的貼紙上：旋轉 −8° 到 8°，描邊 `jade-sys-stroke-width` + `jade-sys-color-outline`。
5. **一張卡片一個顏色。** 卡片底色輪替使用 `jade-sys-color-tertiary`、`-coral`、`-cyan`、`-secondary`，文字一律用對應的 `on-` token。
6. **深淺區塊交替。** Light 區塊與 Brand 區塊輪流出現，形成捲動節奏。
7. **固定的元件語法。** 每個區塊都是：✦ eyebrow（`label-small`）→ 巨型標題 → 說明（`body-large`）→ Primary Button。

## Token 繼承（Material Design 3 方法）

三層結構，只能往下一層引用，不可跳層：

| 層級 | 內容 | 規則 |
| --- | --- | --- |
| Reference `jade-ref-*` | 原始值：HCT 色階、字體、數字 | 只被 sys 引用 |
| System `jade-sys-*` | 語意角色：surface、action、corner-full… | 只被 comp 引用，元件和頁面樣式從這層開始用 |
| Component `jade-comp-*` | 元件屬性 | 只引用 sys |

- 色階用 Material HCT 從品牌色計算，品牌原色覆寫在最接近的 tone，例如 `jade-ref-palette-primary50` = `#4a6fd8`。
- 不要在元件或頁面中直接使用 `jade-ref-*`。

### 兩種區塊模式（themes）

同一個元件在藍底和淺底上的配色是反相的，因此系統用 M3 切換 scheme 的機制定義兩種模式：

- **Light 區塊**（`data-theme="light"`）：底色為 `jade-sys-color-surface` = 淡紫白。CTA 用墨藍容器搭配萊姆 icon。
- **Brand 區塊**（`data-theme="brand"`）：底色為 `jade-sys-color-surface` = 霧藍。CTA 用萊姆容器搭配墨藍 icon。

在區塊外層加上 `data-theme`，裡面的 sys 和 comp token 就會自動切換，元件程式碼不需要改。

## 命名規則

格式：

- Reference：`jade-ref-{category}-{name}{tone}`，例如 `jade-ref-palette-primary50`。
- System：`jade-sys-{category}-{role}-{property?}`，例如 `jade-sys-color-on-action`、`jade-sys-shape-corner-full`。
- Component：`jade-comp-{component}-{state?}-{element}-{property}`，例如 `jade-comp-primary-button-hovered-state-layer-color`。

規則：

1. 全部小寫 kebab-case。`jade` 是命名空間，對應 M3 的 `md`。
2. 用角色命名，不用外觀命名：寫 `action`，不寫 `lime`。
3. 每個填色角色 `{role}` 都要有成對的 `on-{role}`。
4. state 用 M3 的過去分詞：`hovered`、`focused`、`pressed`、`dragged`、`disabled`。預設的 enabled 狀態省略不寫。
5. 元件名用 `{variant}-{component}`：`primary-button`、`secondary-button`、`project-card`、`sticker-badge`。
6. element 詞彙固定：`container`、`headline`、`label-text`、`supporting-text`、`index-text`、`icon`、`icon-container`、`state-layer`、`outline`、`focus-indicator`、`active-indicator`、`media`、`decoration`。
7. property 詞彙固定：`color`、`opacity`、`height`、`min-height`、`width`、`size`、`shape`、`elevation`、`padding-leading`、`padding-trailing`、`gap`、`inset`、`offset`、`thickness`、`aspect-ratio`、`rotation`。
8. 即使引用的值相同，每個元件屬性也要各自寫成一個 token。
9. 選取狀態用 `selected`（例如導覽列的目前頁面），和 M3 一致。

### 換色：data-tone

卡片與貼紙用 `data-tone` 換色，而不是為每個顏色各開一組 token。`data-tone` 把元件的 container 指向一個 sys 填色角色，把文字指向它成對的 `on-` 角色：

| data-tone | container | 文字 |
| --- | --- | --- |
| `lime` | `jade-sys-color-secondary` | `jade-sys-color-on-secondary` |
| `blue` | `jade-sys-color-primary` | `jade-sys-color-on-primary` |
| `pink` | `jade-sys-color-tertiary` | `jade-sys-color-on-tertiary` |
| `coral` | `jade-sys-color-coral` | `jade-sys-color-on-coral` |
| `cyan` | `jade-sys-color-cyan` | `jade-sys-color-on-cyan` |
| `yellow` | `jade-sys-color-yellow` | `jade-sys-color-on-yellow` |
| `ink` | `jade-sys-color-surface-contrast` | `jade-sys-color-on-surface-contrast` |

新增元件要支援換色時，在 `components/bundle.css` 的 tone 區段補上該元件的 `[data-tone]` 對應即可。

## 元件清單

| 元件 | 用途 |
| --- | --- |
| PrimaryButton | 每個區塊唯一的主要行動 |
| SecondaryButton | 第二個動作、導覽列 CTA |
| NavigationBar | 固定在頂端的膠囊導覽列 |
| ProjectCard | 作品卡，整張是連結 |
| ServiceCard | 服務說明卡，三張一組 |
| Sticker | 次要資訊貼紙，裝飾用 |

### 新增元件的流程

1. 拆出元件結構，列出有哪些 element。
2. 每個 element 依照 property 詞彙列出需要的屬性。
3. 先找可以引用的 sys token；找不到才新增 sys token，並同時寫好 light 與 brand 兩種模式的值。
4. 補上 hovered、focused、pressed、disabled 四種狀態。
5. 檢查兩種模式下的對比：文字 4.5:1，大字（24px 以上）與非文字元素 3:1。
6. 確認 comp 沒有直接引用 ref。

## 色彩

- 區塊底色用 `jade-sys-color-surface`，文字用 `jade-sys-color-on-surface`，次要文字用 `jade-sys-color-on-surface-variant`。
- CTA 一律用 `jade-sys-color-action` 系列，不要直接拿 `secondary` 當按鈕色：萊姆放在淺底上的對比只有約 1.1:1，按鈕會消失。
- 萊姆字直接放在藍底上（3.9:1）只能用於 48px 以上的大字，例如「BRANDS MATTER」。小字改用萊姆底配 `jade-sys-color-on-secondary`。
- `jade-sys-color-cyan` 和主色是同色系，只放在 Light 區塊。
- `jade-sys-color-coral` 是藍色的互補色，同一個視窗最多出現一處。
- 不使用漸層。

## 字體

- 標題用 Anton（Google Fonts），全大寫。它只有一個字重，本身就是黑體級的重量。
- 內文與介面用 Space Grotesk（Google Fonts）400 / 500 / 600。
- 中文 fallback 用 Noto Sans TC：標題 900、內文 400/500；中文內文行高 1.7、中文標題行高 1.1。
- Display / Headline（Anton 全大寫）行高統一為 1（2026-11 由 0.9–0.95 放寬，避免多行標題太擠）。

## 形狀與高度

- 卡片內距 `jade-sys-spacing-8`，內圖圓角 = 卡片圓角 − 內距，也就是 `jade-sys-shape-corner-large`。
- 卡片和按鈕都不加陰影：`jade-sys-elevation-level0`。
- 貼紙是 SVG 不規則形狀（星爆、波浪圓、花形），只用作裝飾與次要資訊，不能點擊。

## 間距與版面

- 間距以 8px 為基準、4px 為半格，使用 `jade-sys-spacing-*`。
- 密度原則是「外寬鬆、內緊湊」：區塊之間用 `jade-sys-spacing-32`（手機 80px），卡片之間用 `jade-sys-spacing-6`，卡片內用 `jade-sys-spacing-8`。
- 版面網格：桌機 12 欄、內容最大寬 1280px、gutter 24px；手機 4 欄、gutter 16px。
- 貼紙可以用 −16 到 −24px 的負位移壓出網格。

## 動態

- 時長 200ms（M3 `short4`），easing 用 `cubic-bezier(0.2, 0, 0, 1)`（M3 emphasized）。
- 按鈕與作品卡 hover 時，箭頭 icon 旋轉 45°；作品圖片放大 1.03 倍；服務卡的裝飾形狀旋轉 20°。
- 尊重使用者的 `prefers-reduced-motion` 設定，此時關閉旋轉。

## Iconography

- 只用線條箭頭（↗）與實心幾何 icon（游標、愛心、長條圖、皇冠、閃電），放在帶描邊的貼紙形狀中。
- 不用 emoji。
- 本系統還沒有上傳 logo 或 icon 檔，需要時以 Anton 排出名字。
