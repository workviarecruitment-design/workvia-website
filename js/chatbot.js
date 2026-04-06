// ===================================
// e-Via Chatbot for WorkVIA — AI-powered (GPT)
// ===================================

(function () {
    'use strict';

    const BOT_NAME = 'e-Via';
    const API_URL = '/api/chat';

    // --- COMPANY INFO (fallback) ---
    const COMPANY = {
        email: 'workvia.recruitment@gmail.com',
        phone: '+48 453 310 569'
    };

    // --- FALLBACK KEYWORD RESPONSES (when AI unavailable) ---
    const FALLBACK_PATTERNS = [
        {
            keywords: ['cześć', 'czesc', 'hej', 'witaj', 'witam', 'dzień dobry', 'hello', 'hi'],
            response: `Cześć! 👋 Jestem ${BOT_NAME}, wirtualny asystent WorkVIA.\n\nW czym mogę Ci pomóc?\n• Szukasz pracy za granicą?\n• Chcesz poznać nasze oferty?\n• Potrzebujesz kontaktu z nami? 😊`
        },
        {
            keywords: ['kontakt', 'telefon', 'mail', 'email', 'numer', 'zadzwonić', 'adres'],
            response: `📞 **Kontakt z WorkVIA:**\n\n📧 E-mail: ${COMPANY.email}\n📱 Telefon: ${COMPANY.phone}\n📍 Adres: WorkVia Recruitment, 89356 Haldenwang, Deutschland\n\n🕐 Pon-Pt: 8:00-18:00, Sob: 9:00-14:00`
        },
        {
            keywords: ['oferty', 'praca', 'prace', 'zatrudnienie', 'stanowisk'],
            response: `📋 Nasze oferty pracy znajdziesz na:\n👉 [Zobacz oferty](oferty.html)\n\nSpecjalizujemy się w rekrutacji do pracy w Zachodniej Europie!`
        },
        {
            keywords: ['jak aplikow', 'jak się zgłosić', 'aplikować', 'cv', 'rekrutacja'],
            response: `📝 **Jak aplikować?**\n\n1️⃣ Przejdź do [oferty pracy](oferty.html)\n2️⃣ Wybierz interesującą ofertę\n3️⃣ Kliknij **„Aplikuj teraz"**\n4️⃣ Wypełnij formularz\n5️⃣ Rekruter skontaktuje się w ciągu 24h!`
        }
    ];

    function fallbackResponse(input) {
        const cleaned = input.toLowerCase().trim();
        for (const p of FALLBACK_PATTERNS) {
            if (p.keywords.some(kw => cleaned.includes(kw))) return p.response;
        }
        return `Przepraszam, mam chwilowe problemy z połączeniem. 😅\n\nSkontaktuj się z nami:\n📧 ${COMPANY.email}\n📱 ${COMPANY.phone}\n👉 [Oferty pracy](oferty.html)`;
    }

    // --- BUILD JOBS CONTEXT FOR AI ---
    function buildJobsContext() {
        if (typeof jobs === 'undefined' || !jobs.length) return '';
        return jobs.slice(0, 30).map(j =>
            `- ${j.title} | Kraj: ${j.country} | Miasto: ${j.location} | Wynagrodzenie: ${j.salary} | Typ: ${j.type} | Tagi: ${(j.tags || []).join(', ')}`
        ).join('\n');
    }

    // --- AI CALL ---
    async function getAIResponse(userMessage) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    jobsContext: buildJobsContext()
                })
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (data.reply) return data.reply;
            throw new Error('Empty reply');
        } catch (err) {
            console.warn('e-Via AI fallback:', err.message);
            return fallbackResponse(userMessage);
        }
    }

    // --- SIMPLE MARKDOWN ---
    function formatMessage(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .replace(/\n/g, '<br>');
    }

    // --- BUILD UI ---
    function injectChatbot() {
        const html = `
        <div id="evia-chatbot" class="evia-chatbot">
            <div class="evia-tooltip" id="eviaTooltip">
                <span class="evia-tooltip-text">✨ Wypróbuj Chatbota e-Via!</span>
                <span class="evia-tooltip-arrow"></span>
            </div>
            <button class="evia-toggle" id="eviaToggle" aria-label="Otwórz czat z e-Via">
                <svg class="evia-toggle-icon evia-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg class="evia-toggle-icon evia-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span class="evia-badge" id="eviaBadge">1</span>
            </button>

            <div class="evia-window" id="eviaWindow">
                <div class="evia-header">
                    <div class="evia-header-info">
                        <div class="evia-avatar">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.26 8.29l-.375 1.313a2.25 2.25 0 0 1-1.548 1.547l-1.313.376 1.313.375a2.25 2.25 0 0 1 1.548 1.547l.375 1.313.375-1.313a2.25 2.25 0 0 1 1.548-1.547l1.313-.375-1.313-.376a2.25 2.25 0 0 1-1.548-1.547L18.26 8.29Z"/>
                            </svg>
                        </div>
                        <div>
                            <div class="evia-header-name">${BOT_NAME} <span class="evia-ai-badge">AI</span></div>
                            <div class="evia-header-status">
                                <span class="evia-status-dot"></span> Online — odpowiadam natychmiast
                            </div>
                        </div>
                    </div>
                    <button class="evia-close" id="eviaClose" aria-label="Zamknij czat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="evia-messages" id="eviaMessages"></div>

                <div class="evia-quick-actions" id="eviaQuickActions">
                    <button class="evia-quick-btn" data-msg="Pokaż mi aktualne oferty pracy">📋 Oferty pracy</button>
                    <button class="evia-quick-btn" data-msg="Jak mogę aplikować na ofertę pracy?">📝 Jak aplikować?</button>
                    <button class="evia-quick-btn" data-msg="Podaj dane kontaktowe do WorkVIA">📞 Kontakt</button>
                    <button class="evia-quick-btn" data-msg="Opowiedz mi o firmie WorkVIA">🏢 O firmie</button>
                </div>

                <form class="evia-input-area" id="eviaForm">
                    <input type="text" id="eviaInput" class="evia-input" placeholder="Napisz wiadomość..." autocomplete="off" maxlength="500">
                    <button type="submit" class="evia-send" id="eviaSend" aria-label="Wyślij">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    // --- MESSAGES ---
    function addMessage(text, sender) {
        const container = document.getElementById('eviaMessages');
        const wrapper = document.createElement('div');
        wrapper.className = `evia-msg evia-msg-${sender}`;

        const bubble = document.createElement('div');
        bubble.className = `evia-bubble evia-bubble-${sender}`;
        bubble.innerHTML = formatMessage(text);

        const time = document.createElement('div');
        time.className = 'evia-time';
        time.textContent = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        wrapper.appendChild(bubble);
        wrapper.appendChild(time);
        container.appendChild(wrapper);
        requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
    }

    function showTyping() {
        const container = document.getElementById('eviaMessages');
        const typing = document.createElement('div');
        typing.className = 'evia-msg evia-msg-bot evia-typing-indicator';
        typing.innerHTML = `<div class="evia-bubble evia-bubble-bot evia-typing"><span></span><span></span><span></span></div>`;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return typing;
    }

    async function handleUserMessage(text) {
        if (!text.trim()) return;
        addMessage(text, 'user');

        const quickActions = document.getElementById('eviaQuickActions');
        if (quickActions) quickActions.style.display = 'none';

        const input = document.getElementById('eviaInput');
        const sendBtn = document.getElementById('eviaSend');
        input.disabled = true;
        sendBtn.disabled = true;

        const typingEl = showTyping();
        const response = await getAIResponse(text);
        typingEl.remove();
        addMessage(response, 'bot');

        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }

    // --- INIT ---
    function init() {
        injectChatbot();

        const toggle = document.getElementById('eviaToggle');
        const window_ = document.getElementById('eviaWindow');
        const close = document.getElementById('eviaClose');
        const form = document.getElementById('eviaForm');
        const input = document.getElementById('eviaInput');
        const badge = document.getElementById('eviaBadge');
        const iconChat = toggle.querySelector('.evia-icon-chat');
        const iconClose = toggle.querySelector('.evia-icon-close');
        let isOpen = false;
        let greeted = false;

        function toggleChat() {
            isOpen = !isOpen;
            window_.classList.toggle('evia-open', isOpen);
            toggle.classList.toggle('evia-toggle-active', isOpen);
            iconChat.style.display = isOpen ? 'none' : 'block';
            iconClose.style.display = isOpen ? 'block' : 'none';
            badge.style.display = 'none';

            if (isOpen && !greeted) {
                greeted = true;
                setTimeout(() => {
                    addMessage(`Cześć! 👋 Jestem **${BOT_NAME}**, inteligentny asystent WorkVIA.\n\nZapytaj mnie o cokolwiek związanego z pracą za granicą — odpowiem na podstawie aktualnych ofert! 🌍\n\nMożesz też kliknąć jeden z przycisków poniżej. 😊`, 'bot');
                }, 300);
            }
            if (isOpen) setTimeout(() => input.focus(), 350);
        }

        // Attention tooltip
        const tooltip = document.getElementById('eviaTooltip');
        function hideTooltip() {
            tooltip.classList.remove('evia-tooltip-visible');
            tooltip.classList.add('evia-tooltip-hidden');
            sessionStorage.setItem('eviaTooltipSeen', '1');
        }
        if (!sessionStorage.getItem('eviaTooltipSeen')) {
            setTimeout(() => {
                if (!isOpen) tooltip.classList.add('evia-tooltip-visible');
            }, 3000);
            setTimeout(() => {
                if (tooltip.classList.contains('evia-tooltip-visible')) hideTooltip();
            }, 13000);
        }

        toggle.addEventListener('click', () => { hideTooltip(); toggleChat(); });
        close.addEventListener('click', toggleChat);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                handleUserMessage(text);
                input.value = '';
            }
        });

        document.getElementById('eviaQuickActions').addEventListener('click', (e) => {
            const btn = e.target.closest('.evia-quick-btn');
            if (btn) handleUserMessage(btn.dataset.msg);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) toggleChat();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
