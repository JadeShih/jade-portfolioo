# ServiceCard

服務卡：三張一組說明專業項目，大圓角色塊、小編號、標題與說明，右下角放一個同色的裝飾形狀。

## 使用者需要提供

- `<article class="jade-service-card" data-tone="…">`，tone 同作品卡；三張建議用 `lime`、`pink`、`ink`。
- `__index`（01、02…）、`<h3 class="jade-service-card__title">`、`<p class="jade-service-card__text">`（一到兩句）。
- `<span class="jade-service-card__decoration" aria-hidden="true">` 放 128px 的 SVG 形狀，`fill="currentColor"`。
- 三欄網格，gap `jade-sys-spacing-6`；900px 以下變一欄。

## 結構與 token

| Element | Token |
| --- | --- |
| container | `jade-comp-service-card-container-color`；最小高 360px；內距 `jade-sys-spacing-8`；`jade-sys-shape-corner-extra-large` |
| index-text | `label-small` 字型；`jade-comp-service-card-index-text-color` |
| headline | `title-large`（Space Grotesk 600 32px）；`jade-comp-service-card-headline-color` |
| supporting-text | `body-medium`；`jade-comp-service-card-supporting-text-color` |
| decoration | `jade-comp-service-card-decoration-color`；128px，hover 時旋轉 20° |

## Don't

- 服務卡不是連結；要導頁時在區塊下方放 Primary Button。
- 裝飾形狀只用簡單幾何（花形、星爆、四葉），不放 icon 或插畫。
