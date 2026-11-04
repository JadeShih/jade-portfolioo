# ProjectCard

作品卡：一張卡一個顏色，上方編號與類別，中間 16:9 作品圖，下方 Anton 專案名與服務標籤；整張卡是一個連結。

## 使用者需要提供

- `<a class="jade-project-card" data-tone="…" href="…">`，`data-tone` 可用 `lime`、`blue`、`pink`、`coral`、`cyan`、`yellow`、`ink`。
- `__head`：`__index`（01、02…）、`__rule`、`__label`（專案類別）、`__icon`（↗）。
- `__media`：一張 `<img>`（16:9，`alt` 描述作品內容）。
- `__body`：`<h3 class="jade-project-card__title">` 專案名、`<p class="jade-project-card__tags">` 用 · 分隔的服務。
- 放在兩欄網格中，gap `jade-sys-spacing-6`；760px 以下變一欄。

## 結構與 token

| Element | Token |
| --- | --- |
| container | `jade-comp-project-card-container-color` → 由 `data-tone` 指向 sys 色（預設 `jade-sys-color-secondary`）；`jade-sys-shape-corner-extra-large` |
| index-text | Anton 40px；`jade-comp-project-card-index-text-color` |
| label-text、headline、supporting-text | 都跟著 tone 的 `on-` 色 |
| icon-container | `jade-comp-project-card-icon-container-color` → `jade-sys-color-surface-contrast`；48px |
| icon | `jade-comp-project-card-icon-color` → `jade-sys-color-secondary` |
| media | 內縮 `jade-comp-project-card-media-inset`（16px）；圓角 `jade-sys-shape-corner-large`（40 − 16 = 24） |

## 互動

- Hover：箭頭旋轉 45°、圖片放大 1.03 倍（400ms）。
- Focus：整張卡外推 4px 的焦點框。

## Do

- 相鄰的卡片用不同 tone；cyan 只放在 Light 區塊。
- 在 Brand 區塊不要用 `blue` tone（會和底色融在一起）。

## Don't

- 不要在卡片上加描邊或陰影。
- 專案名不要超過兩行。
