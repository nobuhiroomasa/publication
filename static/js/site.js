document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const loader = document.getElementById('pageLoader');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (toggle) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('open');
        });
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            if (loader) {
                loader.classList.add('hide');
            }
        }, 600);
    });

    if (!prefersReducedMotion) {
        const animatedElements = document.querySelectorAll('[data-animate]');
        const animateObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    animateObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animatedElements.forEach(el => animateObserver.observe(el));

        const counters = document.querySelectorAll('[data-count]');
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });

        counters.forEach(counter => {
            counter.textContent = '0';
            counterObserver.observe(counter);
        });

        function animateCounter(element) {
            const target = parseInt(element.dataset.count, 10);
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
    }
});
