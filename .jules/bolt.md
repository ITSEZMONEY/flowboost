## 2024-05-15 - Polling vs Event Listeners for DOM resizing
**Learning:** Using `setInterval` to poll layout properties (like `document.body.scrollHeight`) every few hundred milliseconds is a performance anti-pattern. It forces the browser to do continuous layout calculations (reflows) even when nothing changes, wasting CPU cycles and draining battery.
**Action:** Always use `ResizeObserver` instead of polling to react to element size changes. It's event-driven and only fires when the dimensions actually change, which is significantly more efficient.
