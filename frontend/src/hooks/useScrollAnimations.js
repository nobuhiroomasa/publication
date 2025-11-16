import { useEffect } from 'react';

export function useScrollAnimations(active, key) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const cleanup = initPageAnimations();
    return cleanup;
  }, [active, key]);
}

function initPageAnimations() {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((element) => element.classList.add('in-view'));
    return () => {};
  }

  const animatedElements = Array.from(document.querySelectorAll('[data-animate]'));
  const counters = Array.from(document.querySelectorAll('[data-count]'));

  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          animateObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  animatedElements.forEach((element) => animateObserver.observe(element));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );

  counters.forEach((counter) => {
    counter.textContent = '0';
    counterObserver.observe(counter);
  });

  return () => {
    animateObserver.disconnect();
    counterObserver.disconnect();
  };
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count || '0', 10);
  if (Number.isNaN(target)) {
    return;
  }
  const duration = 1400;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);
    element.textContent = value.toLocaleString();
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
