## 2024-12-05 - Common Pattern: Missing ARIA Labels on Utility Headers and Icon-Only Buttons
**Learning:** Utility headers often rely heavily on visual cues (like a magnifying glass for search or a bell for notifications). These elements frequently lack ARIA labels and place unhidden decorative SVG icons inside the buttons. This renders these buttons functionally meaningless to a screen reader.
**Action:** When auditing or implementing utility navigation areas, explicitly check for:
1. `aria-label` on inputs without visible `<label>` elements (e.g. search boxes).
2. `aria-label` on any icon-only `<button>` or link.
3. `aria-hidden="true"` on the underlying decorative SVG/icon components so that screen readers skip over them when parsing the button.