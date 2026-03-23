// ===================================
// Cookie Consent Manager
// ===================================

// Check if consent already given
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const settingsBtn = document.getElementById('cookieSettings');
    
    // Check if user already accepted
    if (!getCookie('cookieConsent')) {
        // Show banner after 1 second
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1000);
    }
    
    // Accept all cookies
    acceptBtn.addEventListener('click', () => {
        acceptAllCookies();
        cookieBanner.classList.remove('show');
    });
    
    // Settings button - for now just opens policy page
    settingsBtn.addEventListener('click', () => {
        window.location.href = 'polityka-cookies.html';
    });
});

// Accept all cookies
function acceptAllCookies() {
    setCookie('cookieConsent', 'all', 365);
    setCookie('cookieAnalytics', 'true', 365);
    setCookie('cookieMarketing', 'true', 365);
    
    // Initialize analytics if available
    if (typeof initAnalytics === 'function') {
        initAnalytics();
    }
    
    console.log('✅ All cookies accepted');
}

// Set cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
}

// Get cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Delete cookie
function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/;';
}

// Check if specific cookie type is allowed
function isCookieAllowed(type) {
    const consent = getCookie('cookieConsent');
    if (!consent) return false;
    if (consent === 'all') return true;
    
    // Check specific type
    return getCookie('cookie' + type.charAt(0).toUpperCase() + type.slice(1)) === 'true';
}

// Withdraw consent (for policy pages)
function withdrawConsent() {
    deleteCookie('cookieConsent');
    deleteCookie('cookieAnalytics');
    deleteCookie('cookieMarketing');
    location.reload();
}
