document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const loader = document.getElementById('pageLoader');

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
});
