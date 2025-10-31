// Minimal JS - smooth scroll with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.onclick = e => {
        e.preventDefault();
        const target = document.querySelector(a.hash);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
            history.pushState(null, '', a.hash);
        }
    };
});
