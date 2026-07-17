// smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('mobileNav')?.classList.remove('open');
            document.getElementById('navBurger')?.classList.remove('active');
        }
    });
});

// mobile nav
const burger = document.getElementById('navBurger');
const mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileNav.classList.toggle('open');
    });
}

// scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.split-section, .features-section, .faq-section, .trust').forEach(el => {
    el.classList.add('reveal-target');
    revealObserver.observe(el);
});

// staggered feature card reveal
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, i * 60);
            cardObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll('.feature-card').forEach(el => {
    el.classList.add('reveal-target');
    cardObserver.observe(el);
});



// nav on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (!nav) return;
    const scrolled = window.scrollY > 60;
    nav.style.borderBottomColor = scrolled ? 'rgba(198, 255, 82, 0.12)' : 'rgba(198, 255, 82, 0.07)';
    nav.style.background = scrolled ? 'rgba(5, 6, 4, 0.92)' : 'rgba(5, 6, 4, 0.82)';
}, { passive: true });

// feature card glow + tilt
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mouse-x', `${x * 100}%`);
        card.style.setProperty('--mouse-y', `${y * 100}%`);
        const tiltX = (x - 0.5) * 2;
        const tiltY = (y - 0.5) * -2;
        card.style.transform = `perspective(600px) rotateY(${tiltX}deg) rotateX(${tiltY}deg)`;
        card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateY(0) rotateX(0)';
        card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    });
});

// download card btn glow
const dlBtn = document.querySelector('.download-card__btn');
if (dlBtn) {
    dlBtn.addEventListener('mouseenter', () => {
        dlBtn.style.boxShadow = '0 0 40px rgba(198, 255, 82, 0.3), 0 4px 24px rgba(0,0,0,0.3)';
    });
    dlBtn.addEventListener('mouseleave', () => {
        dlBtn.style.boxShadow = '';
    });
}
