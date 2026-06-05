(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  const updateParallax = () => {
    const offset = window.scrollY || window.pageYOffset;

    root.style.setProperty("--parallax-field", `${offset * -0.05}px`);
    root.style.setProperty("--parallax-line", `${offset * -0.11}px`);
    root.style.setProperty("--parallax-grain", `${offset * -0.025}px`);
    ticking = false;
  };

  const requestUpdate = () => {
    if (reduceMotion.matches || ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener("scroll", requestUpdate, { passive: true });
})();
