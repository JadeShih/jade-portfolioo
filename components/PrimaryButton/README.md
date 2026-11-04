# PrimaryButton

每個區塊唯一的行動呼籲按鈕：全圓角膠囊，左側文字、右側圓形箭頭 icon，配色會依所在區塊（Light／Brand）自動反相。

## 使用者需要提供

- 一個 `<button>`（或導頁用的 `<a>`），加上 class `jade-primary-button`。
- 文字包在一個 `<span>` 裡：動詞開頭、1–3 個字，例如「View my work」「Let's work together」。
- 右側 `<span class="jade-primary-button__icon" aria-hidden="true">`，裡面放 20px 的 ↗ 線條箭頭 SVG（`stroke="currentColor"`）。
- 外層任一祖先元素加上 `data-theme="light"` 或 `data-theme="brand"`。

## 結構與 token

| Element | Token |
| --- | --- |
| container | `jade-comp-primary-button-container-color` → `jade-sys-color-action`；高 `jade-comp-primary-button-container-height`（48px）；圓角 `jade-sys-shape-corner-full` |
| label-text | `jade-comp-primary-button-label-text-color` → `jade-sys-color-on-action`；字型 `label-large` |
| icon-container | `jade-comp-primary-button-icon-container-color` → `jade-sys-color-action-accent`；40px |
| icon | `jade-comp-primary-button-icon-color` → `jade-sys-color-on-action-accent`；20px |
| state-layer | `jade-comp-primary-button-hovered-state-layer-color` → `jade-sys-color-on-action`；hover 8%、pressed 10% |
| focus-indicator | `jade-comp-primary-button-focused-focus-indicator-color` → `jade-sys-color-focus-ring`；3px、外推 2px |
| disabled | 容器 `jade-sys-color-on-surface` 12%；文字與 icon 38% |

## 狀態

- Hover：疊上 8% 的狀態層，箭頭 icon 旋轉 45°（200ms，M3 emphasized easing）。
- Pressed：狀態層 10%。
- Focus（鍵盤）：實心焦點框，Light 區塊用霧藍、Brand 區塊用萊姆。
- Disabled：保留按鈕形狀，但不旋轉、不顯示狀態層。

## Do

- 一個區塊只放一個 Primary Button。第二個動作用次要按鈕（白底、深墨字）。
- 讓 `data-theme` 決定配色。

## Don't

- 不要把萊姆按鈕放在淺色區塊（對比約 1.1:1）。
- 不要拿掉右側 icon，它是這個按鈕的辨識特徵。
- 不要加陰影，也不要改成非全圓角。
