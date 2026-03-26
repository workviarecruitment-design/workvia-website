// ===================================
// Global State
// ===================================
let currentSlide = 0;
let jobs = []; // Wszystkie oferty z CRM
let displayedJobs = []; // 5 losowych ofert wyświetlanych na stronie głównej
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
            job_number: job.job_number || job.id,  // Real job number from CRM
            title: job.title,
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
            // Show message in slider area
            const sliderContainer = document.querySelector('.slider-container');
            const dotsContainer = document.getElementById('sliderDots');
            
            document.getElementById('sliderTrack').innerHTML = `
                <div style="text-align: center; padding: 3rem 2rem; width: 100%;">
                    <p style="font-size: 1.2rem; color: #666;">
                        Aktualnie nie ma opublikowanych ofert pracy.<br>
                        Sprawdź później lub skontaktuj się z nami bezpośrednio.
                    </p>
                </div>
            `;
            sliderContainer.style.display = 'none'; // Hide slider buttons
            if (dotsContainer) dotsContainer.style.display = 'none'; // Hide dots
        } else {
            console.log(`✅ Wyświetlam ${jobs.length} ofert`);
            // Ensure slider UI is visible
            const sliderContainer = document.querySelector('.slider-container');
            const dotsContainer = document.getElementById('sliderDots');
            if (sliderContainer) sliderContainer.style.display = '';
            if (dotsContainer) dotsContainer.style.display = '';
            
            renderJobCards();
            updateCountryMap();  // Update country counts
            initSlider();
        }
    } catch (error) {
        console.error('❌ Błąd ładowania ofert z CRM:', error);
        // Show error message in slider area
        const sliderContainer = document.querySelector('.slider-container');
        const dotsContainer = document.getElementById('sliderDots');
        
        document.getElementById('sliderTrack').innerHTML = `
            <div style="text-align: center; padding: 3rem 2rem; width: 100%;">
                <p style="font-size: 1.2rem; color: #666;">
                    Nie udało się załadować ofert pracy z serwera.<br>
                    Spróbuj odświeżyć stronę lub wróć później.
                </p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">
                    Szczegóły błędu: ${error.message}
                </p>
            </div>
        `;
        sliderContainer.style.display = 'none'; // Hide slider buttons
        if (dotsContainer) dotsContainer.style.display = 'none'; // Hide dots
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

// USUNIĘTO: Mock data - używamy tylko prawdziwych ofert z CRM
// Jeśli widzisz błąd/brak ofert:
// 1. Sprawdź czy w CRM są oferty z zaznaczonym "Publikuj na stronie WWW"
// 2. Sprawdź czy API jest dostępne: https://workvia-crm2026.onrender.com/api/jobs/public/active

// Funkcja do losowania N ofert z listy
function getRandomJobs(jobsArray, count) {
    if (jobsArray.length <= count) {
        return [...jobsArray]; // Jeśli mamy 5 lub mniej ofert, zwróć wszystkie
    }
    
    const shuffled = [...jobsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderJobCards() {
    const sliderTrack = document.getElementById('sliderTrack');
    sliderTrack.innerHTML = '';
    
    // Na stronie głównej pokazujemy tylko 5 losowych ofert
    displayedJobs = getRandomJobs(jobs, 5);
    
    console.log(`🎲 Wylosowano ${displayedJobs.length} z ${jobs.length} ofert do wyświetlenia`);
    
    displayedJobs.forEach(job => {
        const card = createJobCard(job);
        sliderTrack.appendChild(card);
    });
    
    createSliderDots(displayedJobs.length);
}

// Update country map with real job counts
function updateCountryMap() {
    const countryMapping = {
        'Niemcy': { name: 'Niemcy', count: 0 },
        'Holandia': { name: 'Holandia', count: 0 },
        'Belgia': { name: 'Belgia', count: 0 },
        'Francja': { name: 'Francja', count: 0 },
        'Wielka Brytania': { name: 'Wielka Brytania', count: 0 },
        'Irlandia': { name: 'Irlandia', count: 0 },
        'Austria': { name: 'Austria', count: 0 },
        'Szwajcaria': { name: 'Szwajcaria', count: 0 }
    };
    
    // Count jobs per country
    jobs.forEach(job => {
        const country = job.country;
        if (countryMapping[country]) {
            countryMapping[country].count++;
        }
    });
    
    // Update HTML (only if .country-jobs elements exist)
    const countryCards = document.querySelectorAll('.country-card');
    countryCards.forEach(card => {
        const countElement = card.querySelector('.country-jobs');
        
        // Skip if country-jobs element doesn't exist (was removed from design)
        if (!countElement) return;
        
        const countryName = card.querySelector('h4')?.textContent;
        if (!countryName) return;
        
        const count = countryMapping[countryName]?.count || 0;
        
        if (count === 0) {
            countElement.textContent = 'Brak ofert';
        } else if (count === 1) {
            countElement.textContent = '1 oferta';
        } else if (count >= 2 && count <= 4) {
            countElement.textContent = `${count} oferty`;
        } else {
            countElement.textContent = `${count} ofert`;
        }
    });
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.classList.add('job-card');
    card.style.cursor = 'pointer';
    
    // Make entire card clickable
    card.addEventListener('click', (e) => {
        // Don't navigate if clicked on bookmark button
        if (!e.target.closest('.job-bookmark')) {
            window.location.href = `oferty.html?job=${job.id}`;
        }
    });
    
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
        <button class="btn btn-primary" style="width: 100%; text-align: center;" onclick="event.stopPropagation(); window.location.href='oferty.html?job=${job.id}'">Zobacz szczegóły</button>
    `;
    
    return card;
}

function createSliderDots(displayedJobsCount) {
    const dotsContainer = document.getElementById('sliderDots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    // Użyj liczby wyświetlanych ofert (5 losowych) zamiast wszystkich
    const jobCount = displayedJobsCount || jobs.length;
    if (!jobCount || jobCount === 0) return;
    
    const slidesCount = Math.ceil(jobCount / getSlidesPerView());
    
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
        createSliderDots(displayedJobs.length);
    });
}

function goToSlide(index) {
    if (!displayedJobs || displayedJobs.length === 0) return;
    
    const sliderTrack = document.getElementById('sliderTrack');
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(displayedJobs.length / slidesPerView) - 1;
    
    currentSlide = Math.max(0, Math.min(index, maxSlide));
    
    const offset = currentSlide * -100;
    sliderTrack.style.transform = `translateX(${offset}%)`;
    
    updateDots();
}

function nextSlide() {
    if (!displayedJobs || displayedJobs.length === 0) return;
    
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(displayedJobs.length / slidesPerView) - 1;
    
    if (currentSlide >= maxSlide) {
        currentSlide = 0;
    } else {
        currentSlide++;
    }
    
    goToSlide(currentSlide);
}

function previousSlide() {
    if (!displayedJobs || displayedJobs.length === 0) return;
    
    const slidesPerView = getSlidesPerView();
    const maxSlide = Math.ceil(displayedJobs.length / slidesPerView) - 1;
    
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
