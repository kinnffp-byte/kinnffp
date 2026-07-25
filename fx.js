(() => {
  const ready = () => document.body.classList.add("ready");
  window.setTimeout(ready, 1600);
  if (typeof window.fxHearts === "function") {
    window.fxHearts();
  }
  ready();
})();
