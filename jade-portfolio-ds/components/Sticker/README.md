# Sticker

貼紙：放次要資訊（年資、地點、合作狀態），粗描邊、輕旋轉，可以壓在卡片或標題邊緣，讓嚴謹的版面多一點手作感。

## 使用者需要提供

- `<span class="jade-sticker" data-shape="…" data-tone="…">`。
  - `data-shape`：`burst`、`scallop`、`flower`、`circle`、`blob`、`pill`。
  - `data-tone`：同作品卡，預設粉色。
  - `data-size`：`small`（96px）、省略（128px）、`large`（160px）。
- 形狀 SVG：`<svg class="jade-sticker__shape" viewBox="0 0 128 128" aria-hidden="true">` 內放一個 path／polygon／circle（`pill` 不需要）。
- `<span class="jade-sticker__label">`：最多兩行；數字可包 `<b>` 改用 Anton 放大。
- 旋轉角度用 `style="--jade-sticker-rotation: 8deg"`，範圍 −8° 到 8°。

## 結構與 token

| Element | Token |
| --- | --- |
| container | `jade-comp-sticker-container-color` → 預設 `jade-sys-color-tertiary` |
| outline | `jade-comp-sticker-outline-color` → `jade-sys-color-outline`；`jade-sys-stroke-width`（2.5px） |
| label-text | `jade-comp-sticker-label-text-color` → 跟著 tone 的 `on-` 色 |
| rotation | `jade-comp-sticker-container-rotation`（預設 −6°） |

## Do

- 一個區塊最多 2–3 張貼紙，顏色不要重複。
- 可以用 −16 到 −24px 的負位移壓出網格。
- 手機寬度時隱藏裝飾性貼紙，重要資訊改放進正文。

## Don't

- 貼紙不能點擊，也不要放重要資訊（螢幕閱讀器會略過裝飾形狀，但會讀到文字）。
- 不要加陰影。
- 不要讓貼紙蓋住標題文字。
