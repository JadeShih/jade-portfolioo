# NavigationBar

固定在頁面頂端、置中的膠囊形導覽列：左側品牌字標，中間頁面連結，右側純文字 Secondary Button。

## 使用者需要提供

- `<nav class="jade-navigation-bar" data-theme="brand" aria-label="主選單">`：導覽列本身固定用 Brand 模式，在任何區塊上看起來都一樣。
- 品牌字標 `<a class="jade-navigation-bar__brand">`：✦ SVG + Anton 名字。
- 連結清單 `<ul class="jade-navigation-bar__links">`，每個連結加 `jade-navigation-bar__link`；目前頁面加 `aria-current="page"`。
- 一個純文字 Secondary Button（例如「Let's talk」）。
- 外層用 `position: sticky; top: env(safe-area-inset-top, 0px)`，與視窗頂端保持 `jade-comp-navigation-bar-container-offset`（24px）。

## 結構與 token

| Element | Token |
| --- | --- |
| container | `jade-comp-navigation-bar-container-color` → `jade-sys-color-primary-emphasis`；高 60px；`jade-sys-shape-corner-full` |
| icon | `jade-comp-navigation-bar-icon-color` → `jade-sys-color-secondary`；24px |
| headline | `jade-comp-navigation-bar-headline-color` → `jade-sys-color-on-primary-emphasis`；Anton 28px |
| label-text | `jade-comp-navigation-bar-label-text-color` → `jade-sys-color-on-primary-emphasis` |
| hovered / selected label-text | → `jade-sys-color-secondary`（萊姆，5.4:1） |
| active-indicator | `jade-comp-navigation-bar-active-indicator-color` → `jade-sys-color-secondary`；2px，在連結下方 6px |
| focus-indicator | `jade-sys-color-focus-ring`（Brand 模式下為萊姆） |

## 響應式

- 760px 以下隱藏中間連結，只留字標與按鈕；需要完整選單時另做漢堡選單。

## Don't

- 不要給導覽列加陰影或背景模糊。
- 連結不超過 5 個。
