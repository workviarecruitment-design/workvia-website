// ===================================
// Global State
// ===================================
let currentSlide = 0;
let jobs = [];
let isAutoPlaying = true;
let autoPlayInterval;

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParticles();
    initCounters();
    loadJobs();
    initScrollAnimations();
    initScrollTop();
    initContactForm();
    smoothScroll();
});

// ===================================
// Navigation
// ===================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Sticky navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close menu on outside click
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ===================================
// Particles Animation
// ===================================
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random positioning
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    
    // Random animation duration and delay
    const duration = 10 + Math.random() * 15;
    const delay = Math.random() * 5;
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = delay + 's';
    
    container.appendChild(particle);
    
    // Recreate particle after animation ends
    particle.addEventListener('animationiteration', () => {
        particle.style.left = Math.random() * 100 + '%';
    });
}

// ===================================
// Animated Counters
// ===================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                counters.forEach(counter => animateCounter(counter));
            }
        });
    }, observerOptions);
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    
    updateCounter();
}

// ===================================
// Jobs Slider
// ===================================
async function loadJobs() {
    try {
        // URL do publicznego API CRM - pobiera tylko oferty oznaczone do publikacji
        const apiUrl = 'https://workvia-crm2026.onrender.com/api/jobs/public/active';
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiJobs = await response.json();
        
        console.log(`✅ Pobrano ${apiJobs.length} ofert z CRM`);
        
        // Mapowanie danych z CRM na format strony
        jobs = apiJobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.company_name || job.client_name || 'Work Via',
            country: job.country || job.location || 'Europa',
            flag: getCountryFlag(job.country || job.location),
            location: job.city || job.location || 'Różne lokalizacje',
            salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.hourly_rate),
            type: formatEmploymentType(job.employment_type),
            experience: formatExperience(job.experience_level),
            tags: getTags(job),
            description: job.description || '',
            requirements: job.requirements || '',
            benefits: job.benefits || '',
            image: job.image_url || null,
            deadline: job.deadline
        }));
        
        if (jobs.length === 0) {
            console.warn('⚠️ Brak opublikowanych ofert w CRM (sprawdź czy zaznaczono "Publikuj na stronie WWW")');
            useMockJobs();
        } else {
            console.log(`✅ Wyświetlam ${jobs.length} ofert`);
            renderJobCards();
            initSlider();
        }
    } catch (error) {
        console.error('❌ Błąd ładowania ofert z CRM:', error);
        // Fallback: użyj przykładowych danych jeśli API nie działa
        useMockJobs();
    }
}

// Funkcje pomocnicze do mapowania danych
function getCountryFlag(country) {
    const flags = {
        'Niemcy': '🇩🇪',
        'Holandia': '🇳🇱',
        'Belgia': '🇧🇪',
        'Francja': '🇫🇷',
        'Wielka Brytania': '🇬🇧',
        'Irlandia': '🇮🇪',
        'Austria': '🇦🇹',
        'Szwajcaria': '🇨🇭',
        'Germany': '🇩🇪',
        'Netherlands': '🇳🇱',
        'Belgium': '🇧🇪',
        'France': '🇫🇷',
        'United Kingdom': '🇬🇧',
        'Ireland': '🇮🇪',
        'Austria': '🇦🇹',
        'Switzerland': '🇨🇭'
    };
    return flags[country] || '🇪🇺';
}

function formatSalary(min, max, currency, hourlyRate) {
    const curr = currency || 'EUR';
    if (hourlyRate) {
        return `${hourlyRate} ${curr}/godz`;
    }
    if (min && max) {
        return `${min} - ${max} ${curr}`;
    }
    if (min) {
        return `od ${min} ${curr}`;
    }
    if (max) {
        return `do ${max} ${curr}`;
    }
    return 'Do uzgodnienia';
}

function formatEmploymentType(type) {
    const types = {
        'full-time': 'Pełny etat',
        'part-time': 'Część etatu',
        'contract': 'Kontrakt',
        'internship': 'Staż'
    };
    return types[type] || 'Pełny etat';
}

function formatExperience(level) {
    const levels = {
        'junior': 'Początkujący',
        'mid': '1-3 lata',
        'senior': '3+ lata',
        'expert': '5+ lata',
        'none': 'Bez doświadczenia'
    };
    return levels[level] || 'Bez wymagań';
}

function getTags(job) {
    const tags = [];
    
    // Dodaj typ zatrudnienia
    if (job.employment_type) {
        tags.push(formatEmploymentType(job.employment_type));
    }
    
    // Dodaj opcję zdalną
    if (job.remote_option) {
        tags.push('Praca zdalna');
    }
    
    // Dodaj zakwaterowanie
    if (job.accommodation) {
        tags.push('Zakwaterowanie');
    }
    
    // Dodaj język
    if (job.language && job.language !== 'Polski') {
        tags.push(`Język: ${job.language}`);
    }
    
    // Ograniczenie do maksymalnie 3 tagów
    return tags.slice(0, 3);
}

function useMockJobs() {
    jobs = [
        {
            id: 1,
            title: "Operator wózka widłowego",
            company: "Logistics Pro GmbH",
            country: "Niemcy",
            flag: "🇩🇪",
            location: "Hamburg",
            salary: "3500 - 4200 EUR",
            type: "Pełny etat",
            experience: "1-2 lata",
            tags: ["Wózek widłowy", "Logistyka", "3 zmiany"]
        },
        {
            id: 2,
            title: "Pracownik produkcji",
            company: "Dutch Manufacturing B.V.",
            country: "Holandia",
            flag: "🇳🇱",
            location: "Rotterdam",
            salary: "2800 - 3400 EUR",
            type: "Pełny etat",
            experience: "Bez doświadczenia",
            tags: ["Produkcja", "Pakowanie", "Zmianowy"]
        },
        {
            id: 3,
            title: "Kierowca kat. CE",
            company: "Transport Solutions SA",
            country: "Belgia",
            flag: "🇧🇪",
            location: "Antwerpia",
            salary: "4000 - 5500 EUR",
            type: "Pełny etat",
            experience: "2+ lata",
            tags: ["Transport", "Kat. CE", "Długie trasy"]
        },
        {
            id: 4,
            title: "Monter konstrukcji stalowych",
            company: "Steel Build GmbH",
            country: "Niemcy",
            flag: "🇩🇪",
            location: "Frankfurt",
            salary: "3800 - 4800 EUR",
            type: "Pełny etat",
            experience: "2+ lata",
            tags: ["Konstrukcje", "Spawanie", "Budowa"]
        },
        {
            id: 5,
            title: "Pracownik magazynu",
            company: "Warehouse Solutions",
            country: "Holandia",
            flag: "🇳🇱",
            location: "Amsterdam",
            salary: "2600 - 3200 EUR",
            type: "Pełny etat",
            experience: "Bez doświadczenia",
            tags: ["Magazyn", "Picking", "Order picker"]
        },
        {
            id: 6,
            title: "Elektryk przemysłowy",
            company: "Industrial Electric Ltd",
            country: "Wielka Brytania",
            flag: "🇬🇧",
            location: "Manchester",
            salary: "3200 - 4500 GBP",
            type: "Pełny etat",
            experience: "3+ lata",
            tags: ["Elektryk", "Automatyka", "Przemysł"]
        },
        {
            id: 7,
            title: "Operator CNC",
            company: "Precision Parts SARL",
            country: "Francja",
            flag: "🇫🇷",
            location: "Lyon",
            salary: "3000 - 3800 EUR",
            type: "Pełny etat",
            experience: "1-2 lata",
            tags: ["CNC", "Frezowanie", "Produkcja"]
        },
        {
            id: 8,
            title: "Pracownik budowlany",
            company: "Construction Pro AG",
            country: "Szwajcaria",
            flag: "🇨🇭",
            location: "Zurych",
            salary: "5000 - 6500 CHF",
            type: "Pełny etat",
            experience: "1+ rok",
            tags: ["Budowa", "Wykończenia", "Remonty"]
        }
    ];
    
    renderJobCards();
    initSlider();
}

function renderJobCards() {
    const sliderTrack = document.getElementById('sliderTrack');
    sliderTrack.innerHTML = '';
    
    jobs.forEach(job => {
        const card = createJobCard(job);
        sliderTrack.appendChild(card);
    });
    
    createSliderDots();
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.classList.add('job-card');
    
    // Opcjonalne zdjęcie z oferty
    const imageHtml = job.image ? 
        `<div class="job-image">
            <img src="${job.image}" alt="${job.title}" onerror="this.parentElement.style.display='none'">
        </div>` : '';
    
    card.innerHTML = `
        ${imageHtml}
        <div class="job-header">
            <div class="job-flag">${job.flag}</div>
            <button class="job-bookmark" aria-label="Bookmark job">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        </div>
        <h3 class="job-title">${job.title}</h3>
        <div class="job-details">
            <div class="job-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${job.location}, ${job.country}</span>
            </div>
            <div class="job-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>${job.type}</span>
            </div>
            <div class="job-detail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>${job.experience}</span>
            </div>
        </div>
        <div class="job-tags">
            ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
        </div>
        <div class="job-salary">${job.salary}</div>
        <a href="#kontakt" class="btn btn-primary" style="width: 100%; text-align: center;">Aplikuj teraz</a>
    `;
    
    return card;
}

function createSliderDots() {
    const dotsContainer = document.getElementById('sliderDots');
    dotsContainer.innerHTML = '';
    
    const slidesCount = Math.ceil(jobs.length / getSlidesPerView());
    
    for (let i = 0; i < slidesCount; i++) {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
}

function getSlidesPerView() {
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
}

function initSlider() {
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const sliderTrack = document.getElementById('sliderTrack');
    
    prevBtn.addEventListener('click', () => {
        stopAutoPlay();
        previousSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    sliderTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    });
    
    sliderTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextSlide();
        if (touchEndX > touchStartX + 50) previousSlide();
    }
    
    // Auto play
    startAutoPlay();
    
    // Pause on hover
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
    
    // Responsive recalculation
    window.addEventListener('resize', () => {
        goToSlide(currentSlide);
        createSliderDots();
    });
}

function goToSlide(index) {
    const sliderTrack = document.getElementById('sliderTrack');
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(jobs.length / slidesPerView) - 1;
    
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    
    const offset = currentSlide * -100;
    sliderTrack.style.transform = `translateX(${offset}%)`;
    
    updateDots();
}

function nextSlide() {
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(jobs.length / slidesPerView) - 1;
    
    if (currentSlide >= maxSlide) {
        currentSlide = 0;
    } else {
        currentSlide++;
    }
    
    goToSlide(currentSlide);
}

function previousSlide() {
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(jobs.length / slidesPerView) - 1;
    
    if (currentSlide <= 0) {
        currentSlide = maxSlide;
    } else {
        currentSlide--;
    }
    
    goToSlide(currentSlide);
}

function updateDots() {
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function startAutoPlay() {
    if (isAutoPlaying) return;
    isAutoPlaying = true;
    autoPlayInterval = setInterval(nextSlide, 5000);
}

function stopAutoPlay() {
    isAutoPlaying = false;
    clearInterval(autoPlayInterval);
}

// ===================================
// Scroll Animations
// ===================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');
    
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ===================================
// Smooth Scroll
// ===================================
function smoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip empty or just # links
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// Scroll to Top Button
// ===================================
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// Contact Form
// ===================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send data to a server
        // For now, we'll just show a success message
        console.log('Form submitted:', data);
        
        // Show success message
        showNotification('Wiadomość wysłana pomyślnie! Skontaktujemy się z Tobą wkrótce.', 'success');
        
        // Reset form
        form.reset();
    });
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Add notification animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Performance Optimization
// ===================================
// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}
