# SecondaryButton

次要行動按鈕：白底膠囊，搭配深墨色圓形箭頭；用在 Primary Button 旁的第二個動作，或導覽列裡的「Let's talk」。

## 使用者需要提供

- `<button>` 或導頁用的 `<a>`，加上 class `jade-secondary-button`。
- 文字包在 `<span>` 裡，動詞開頭、1–3 個字。
- 帶 icon 版：右側加 `<span class="jade-secondary-button__icon" aria-hidden="true">` 放 20px ↗ 箭頭。
- 純文字版：不放 icon，加上 `jade-secondary-button--text-only`。
- 祖先元素上的 `data-theme="light"` 或 `"brand"`。

## 結構與 token

| Element | Token |
| --- | --- |
| container | `jade-comp-secondary-button-container-color` → `jade-sys-color-action-secondary`；高 48px；`jade-sys-shape-corner-full` |
| outline | `jade-comp-secondary-button-outline-color` → `jade-sys-color-action-secondary-outline`；2px。Light 區塊是墨藍框，Brand 區塊與容器同色 |
| label-text | `jade-comp-secondary-button-label-text-color` → `jade-sys-color-on-action-secondary` |
| icon-container | `jade-comp-secondary-button-icon-container-color` → `jade-sys-color-action-secondary-accent` |
| icon | `jade-comp-secondary-button-icon-color` → `jade-sys-color-on-action-secondary-accent` |
| state-layer | hover 8%、pressed 10%，顏色 `jade-sys-color-on-action-secondary` |
| focus-indicator | `jade-sys-color-focus-ring`，3px、外推 2px |

## Do

- 和 Primary Button 並排時，Primary 放左邊。
- 一個區塊最多一個 Secondary Button。

## Don't

- 不要單獨把 Secondary 當成區塊的主要 CTA。
- 不要在 Light 區塊拿掉外框，白按鈕會融進淡紫白背景。
