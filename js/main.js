// ===================================
// Global State
// ===================================
let currentSlide = 0;
let jobs = []; // Wszystkie oferty z CRM
let displayedJobs = []; // 8 losowych ofert wyświetlanych na stronie głównej
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
            salary: job.salary_text || formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.hourly_rate),
            type: formatEmploymentType(job.employment_type),
            experience: formatExperience(job.experience_level),
            tags: getTags(job),
            description: job.description || '',
            requirements: job.requirements || '',
            benefits: job.benefits || '',
            image: job.image_url || null,
            deadline: job.deadline,
            created_at: job.created_at || job.published_at || null,
            latitude: job.latitude ? parseFloat(job.latitude) : null,
            longitude: job.longitude ? parseFloat(job.longitude) : null,
            postal_code: (job.postal_code || '').trim(),
            city: job.city || ''
        }));
        
        // Sort by newest first
        jobs.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
        });
        
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
        return [...jobsArray]; // Jeśli mamy 8 lub mniej ofert, zwróć wszystkie
    }
    
    const shuffled = [...jobsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function renderJobCards() {
    const sliderTrack = document.getElementById('sliderTrack');
    sliderTrack.innerHTML = '';
    
    // Na stronie głównej pokazujemy tylko 8 losowych ofert
    displayedJobs = getRandomJobs(jobs, 8);
    
    console.log(`🎲 Wylosowano ${displayedJobs.length} z ${jobs.length} ofert do wyświetlenia`);
    
    displayedJobs.forEach(job => {
        const card = createJobCard(job);
        sliderTrack.appendChild(card);
    });
    
    createSliderDots(displayedJobs.length);
}

// Update country map with real job counts
function updateCountryMap() {
    const mapEl = document.getElementById('jobsMap');
    if (!mapEl || typeof L === 'undefined') return;

    // Prevent re-init
    if (mapEl._leaflet_id) return;

    // Country bounding boxes for coordinate validation
    const countryBounds = {
        'Niemcy':     { latMin: 47.2, latMax: 55.1, lngMin: 5.8, lngMax: 15.1 },
        'Germany':    { latMin: 47.2, latMax: 55.1, lngMin: 5.8, lngMax: 15.1 },
        'Holandia':   { latMin: 50.7, latMax: 53.6, lngMin: 3.3, lngMax: 7.3 },
        'Netherlands':{ latMin: 50.7, latMax: 53.6, lngMin: 3.3, lngMax: 7.3 },
        'Belgia':     { latMin: 49.4, latMax: 51.6, lngMin: 2.5, lngMax: 6.5 },
        'Belgium':    { latMin: 49.4, latMax: 51.6, lngMin: 2.5, lngMax: 6.5 },
        'Austria':    { latMin: 46.3, latMax: 49.1, lngMin: 9.5, lngMax: 17.2 },
        'Szwajcaria': { latMin: 45.8, latMax: 47.9, lngMin: 5.9, lngMax: 10.5 },
        'Switzerland':{ latMin: 45.8, latMax: 47.9, lngMin: 5.9, lngMax: 10.5 },
        'Luksemburg': { latMin: 49.4, latMax: 50.2, lngMin: 5.7, lngMax: 6.6 },
        'Luxembourg': { latMin: 49.4, latMax: 50.2, lngMin: 5.7, lngMax: 6.6 },
        'Francja':    { latMin: 41.3, latMax: 51.1, lngMin: -5.1, lngMax: 9.6 },
        'France':     { latMin: 41.3, latMax: 51.1, lngMin: -5.1, lngMax: 9.6 }
    };

    function isCoordValidForCountry(lat, lng, country) {
        const b = countryBounds[country];
        if (!b) return lat >= 44 && lat <= 58 && lng >= -5 && lng <= 17;
        return lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax;
    }

    // Nominatim geocoding with localStorage cache
    function geocodeJob(job) {
        const cacheKey = 'geo_' + job.id + '_' + job.postal_code + '_' + job.city;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try { return Promise.resolve(JSON.parse(cached)); } catch(e) {}
        }

        const query = [job.postal_code, job.city, job.country].filter(Boolean).join(', ');
        if (!query || query === job.country) return Promise.resolve(null);

        return fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query), {
            headers: { 'Accept-Language': 'de' }
        })
        .then(r => r.json())
        .then(data => {
            if (data && data[0]) {
                const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                localStorage.setItem(cacheKey, JSON.stringify(result));
                return result;
            }
            return null;
        })
        .catch(() => null);
    }

    const map = L.map('jobsMap', {
        center: [50.5, 10.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        scrollWheelZoom: true,
        zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    const goldIcon = L.divIcon({
        className: 'map-marker-custom',
        html: '<div class="map-marker-pin"></div>',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        popupAnchor: [0, -42]
    });

    const markers = L.markerClusterGroup({
        maxClusterRadius: 40,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            return L.divIcon({
                html: '<div class="map-cluster-icon">' + count + '</div>',
                className: 'map-cluster-custom',
                iconSize: [44, 44]
            });
        }
    });

    map.addLayer(markers);

    function createPopup(job) {
        return `
            <div class="map-popup">
                <div class="map-popup-flag">${job.flag}</div>
                <h3 class="map-popup-title">${job.title}</h3>
                <p class="map-popup-location">${job.location}, ${job.country}</p>
                <p class="map-popup-salary">${job.salary}</p>
                <div class="map-popup-tags">
                    <span>${job.type}</span>
                </div>
                <a href="oferty.html?job=${job.id}" class="map-popup-btn">Zobacz szczegóły →</a>
            </div>
        `;
    }

    function addMarker(lat, lng, job) {
        const marker = L.marker([lat, lng], { icon: goldIcon });
        marker.bindPopup(createPopup(job), {
            maxWidth: 280,
            minWidth: 220,
            className: 'map-popup-container'
        });
        markers.addLayer(marker);
    }

    const bounds = [];
    const toGeocode = [];

    jobs.forEach(job => {
        const hasCoords = job.latitude && job.longitude;
        const coordsValid = hasCoords && isCoordValidForCountry(job.latitude, job.longitude, job.country);

        if (coordsValid) {
            addMarker(job.latitude, job.longitude, job);
            bounds.push([job.latitude, job.longitude]);
        } else if (job.city || job.postal_code) {
            // Coords missing or wrong — queue for geocoding
            toGeocode.push(job);
        }
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6 });
    }

    // Geocode jobs with bad/missing coords (rate-limited 1 req/sec)
    if (toGeocode.length > 0) {
        let i = 0;
        function geocodeNext() {
            if (i >= toGeocode.length) return;
            const job = toGeocode[i++];
            geocodeJob(job).then(result => {
                if (result && isCoordValidForCountry(result.lat, result.lng, job.country)) {
                    addMarker(result.lat, result.lng, job);
                    bounds.push([result.lat, result.lng]);
                }
                setTimeout(geocodeNext, 1100); // respect Nominatim 1 req/sec
            });
        }
        geocodeNext();
        console.log(`🗺️ Geokodowanie ${toGeocode.length} ofert z błędnymi koordynatami...`);
    }

    // Update country stats
    const countryCounts = {};
    jobs.forEach(job => {
        const c = job.country;
        countryCounts[c] = (countryCounts[c] || 0) + 1;
    });

    document.querySelectorAll('.map-country-stat').forEach(el => {
        const country = el.dataset.country;
        const countEl = el.querySelector('.map-stat-count');
        if (countEl && countryCounts[country]) {
            countEl.textContent = countryCounts[country];
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
    
    // Użyj liczby wyświetlanych ofert zamiast wszystkich
    const jobCount = displayedJobsCount || jobs.length;
    if (!jobCount || jobCount === 0) return;
    
    const slidesPerView = getSlidesPerView();
    // Twórz tylko pełne slajdy (floor zamiast ceil)
    const slidesCount = Math.floor(jobCount / slidesPerView);
    
    // Jeśli są jakieś pozostałe oferty, dodaj jeszcze jeden slajd
    if (jobCount % slidesPerView > 0) {
        // Ale tylko jeśli jest wystarczająco dużo ofert (min. 50% slajdu)
        const remainingJobs = jobCount % slidesPerView;
        const minJobsForSlide = Math.ceil(slidesPerView / 2);
        if (remainingJobs >= minJobsForSlide) {
            // Wystarczająco dużo ofert - pokaż ostatni slajd
            for (let i = 0; i < slidesCount + 1; i++) {
                const dot = document.createElement('button');
                dot.classList.add('slider-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
            return;
        }
    }
    
    // Standardowe pełne slajdy
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
// Contact form is handled by contact-form.js

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
