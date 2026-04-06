// ===================================
// e-Via Chatbot for WorkVIA
// ===================================

(function () {
    'use strict';

    // --- CONFIG ---
    const BOT_NAME = 'e-Via';
    const TYPING_DELAY = 600;

    const COMPANY_INFO = {
        name: 'WorkVIA Recruitment',
        email: 'workvia.recruitment@gmail.com',
        phone: '+48 453 310 569',
        address: 'WorkVia Recruitment, Magdalena Syrnicka, 89356 Haldenwang, Deutschland',
        hours: 'Poniedziałek–Piątek: 8:00–18:00, Sobota: 9:00–14:00',
        website: 'https://workvia.com.pl',
        description: 'Profesjonalna agencja rekrutacyjna specjalizująca się w zatrudnieniu w krajach Zachodniej Europy (Niemcy, Holandia, Belgia i inne). Pomagamy kandydatom znaleźć legalną, stabilną pracę z zakwaterowaniem i atrakcyjnym wynagrodzeniem.',
        services: [
            'Rekrutacja do pracy w Niemczech, Holandii, Belgii i innych krajach UE',
            'Pomoc w legalizacji zatrudnienia',
            'Organizacja zakwaterowania dla pracowników',
            'Wsparcie podczas całego procesu rekrutacji',
            'Doradztwo zawodowe'
        ]
    };

    // --- KNOWLEDGE BASE ---
    const PATTERNS = [
        {
            keywords: ['cześć', 'czesc', 'hej', 'siema', 'witaj', 'witam', 'dzień dobry', 'dzien dobry', 'hello', 'hi', 'hejka', 'yo'],
            response: () => `Cześć! 👋 Jestem ${BOT_NAME}, wirtualny asystent WorkVIA.\n\nW czym mogę Ci pomóc?\n• Szukasz pracy za granicą?\n• Chcesz poznać nasze oferty?\n• Potrzebujesz kontaktu z nami?\n\nWpisz pytanie lub wybierz temat poniżej! 😊`
        },
        {
            keywords: ['kontakt', 'telefon', 'mail', 'email', 'e-mail', 'numer', 'zadzwonić', 'zadzwonic', 'napisać', 'napisac', 'adres'],
            response: () => `📞 **Kontakt z WorkVIA:**\n\n📧 E-mail: ${COMPANY_INFO.email}\n📱 Telefon: ${COMPANY_INFO.phone}\n📍 Adres: ${COMPANY_INFO.address}\n\n🕐 **Godziny pracy:**\n${COMPANY_INFO.hours}\n\nMożesz też wypełnić formularz kontaktowy na dole tej strony! ⬇️`
        },
        {
            keywords: ['godziny', 'kiedy', 'otwarte', 'dostępni', 'dostepni', 'pracujecie', 'czynne'],
            response: () => `🕐 **Godziny pracy WorkVIA:**\n\n${COMPANY_INFO.hours}\n\nPoza godzinami pracy napisz do nas na: ${COMPANY_INFO.email} — odpowiemy w ciągu 24h! 📧`
        },
        {
            keywords: ['oferty', 'praca', 'prace', 'zatrudnienie', 'stanowisk', 'wakat', 'job', 'jobs', 'oferta'],
            response: () => {
                if (typeof jobs !== 'undefined' && jobs.length > 0) {
                    const countries = [...new Set(jobs.map(j => j.country))];
                    return `📋 **Aktualnie mamy ${jobs.length} aktywnych ofert pracy!**\n\nKraje: ${countries.map(c => jobs.find(j => j.country === c)?.flag + ' ' + c).join(', ')}\n\nChcesz zobaczyć oferty? 👉 [Zobacz wszystkie oferty](oferty.html)\n\nMożesz też zapytać mnie np.:\n• „Jakie oferty są w Niemczech?"\n• „Szukam pracy w Holandii"\n• „Pokaż oferty z zakwaterowaniem"`;
                }
                return `📋 Nasze oferty pracy znajdziesz na stronie:\n👉 [Zobacz oferty](oferty.html)\n\nSpecjalizujemy się w rekrutacji do pracy w Zachodniej Europie!`;
            }
        },
        {
            keywords: ['niemcy', 'niemcz', 'germany', 'deutschland', 'de'],
            response: () => searchJobsByCountry('Niemcy', '🇩🇪')
        },
        {
            keywords: ['holandia', 'holland', 'netherlands', 'nl', 'holend'],
            response: () => searchJobsByCountry('Holandia', '🇳🇱')
        },
        {
            keywords: ['belgia', 'belgium', 'belgii', 'be'],
            response: () => searchJobsByCountry('Belgia', '🇧🇪')
        },
        {
            keywords: ['francja', 'france', 'fr'],
            response: () => searchJobsByCountry('Francja', '🇫🇷')
        },
        {
            keywords: ['austria', 'at', 'austrii'],
            response: () => searchJobsByCountry('Austria', '🇦🇹')
        },
        {
            keywords: ['zakwaterowanie', 'mieszkanie', 'nocleg', 'accommodation', 'kwater'],
            response: () => {
                if (typeof jobs !== 'undefined' && jobs.length > 0) {
                    const withAccom = jobs.filter(j =>
                        j.tags.some(t => t.toLowerCase().includes('zakwaterowanie')) ||
                        j.benefits?.toLowerCase().includes('zakwaterowanie') ||
                        j.benefits?.toLowerCase().includes('mieszkanie')
                    );
                    if (withAccom.length > 0) {
                        const list = withAccom.slice(0, 5).map(j => `• ${j.flag} **${j.title}** — ${j.location} | ${j.salary}`).join('\n');
                        return `🏠 **Oferty z zakwaterowaniem (${withAccom.length}):**\n\n${list}${withAccom.length > 5 ? `\n\n...i ${withAccom.length - 5} więcej!` : ''}\n\n👉 [Zobacz wszystkie oferty](oferty.html)`;
                    }
                }
                return `🏠 Wiele naszych ofert zawiera zakwaterowanie w cenie lub z dopłatą pracodawcy.\n\nSprawdź szczegóły poszczególnych ofert:\n👉 [Zobacz oferty](oferty.html)`;
            }
        },
        {
            keywords: ['wynagrodzenie', 'zarobki', 'pensja', 'płaca', 'placa', 'salary', 'ile zarab', 'ile płac', 'stawka', 'ile płacą'],
            response: () => {
                if (typeof jobs !== 'undefined' && jobs.length > 0) {
                    const withSalary = jobs.filter(j => j.salary && j.salary !== 'Do uzgodnienia');
                    if (withSalary.length > 0) {
                        const examples = withSalary.slice(0, 4).map(j => `• ${j.flag} ${j.title} — **${j.salary}**`).join('\n');
                        return `💰 **Przykładowe wynagrodzenia:**\n\n${examples}\n\nWynagrodzenie zależy od stanowiska, doświadczenia i kraju.\n\n👉 [Sprawdź wszystkie oferty](oferty.html)`;
                    }
                }
                return `💰 Wynagrodzenia zależą od stanowiska i kraju. Nasze oferty obejmują wynagrodzenia od kilkunastu do kilkudziesięciu EUR/h.\n\n👉 [Sprawdź aktualne oferty](oferty.html)`;
            }
        },
        {
            keywords: ['jak aplikow', 'jak się zgłosić', 'jak zgłosic', 'jak złożyć', 'jak zlozic', 'aplikować', 'aplikowac', 'cv', 'rekrutacja', 'proces'],
            response: () => `📝 **Jak aplikować?**\n\n1️⃣ Przejdź do naszych ofert: [oferty.html](oferty.html)\n2️⃣ Wybierz interesującą ofertę\n3️⃣ Kliknij **„Aplikuj teraz"**\n4️⃣ Wypełnij formularz (imię, e-mail, telefon, wiadomość)\n5️⃣ Nasz rekruter skontaktuje się z Tobą!\n\nMożesz też napisać do nas bezpośrednio:\n📧 ${COMPANY_INFO.email}\n📱 ${COMPANY_INFO.phone}`
        },
        {
            keywords: ['o firmie', 'o was', 'kim jesteście', 'kim jestescie', 'czym się zajmujecie', 'o workvia', 'co robicie', 'jaka firma'],
            response: () => `🏢 **O WorkVIA Recruitment:**\n\n${COMPANY_INFO.description}\n\n🌟 **Nasze usługi:**\n${COMPANY_INFO.services.map(s => `• ${s}`).join('\n')}\n\n📍 Siedziba: Haldenwang, Niemcy\n🌐 Działamy na terenie całej Europy`
        },
        {
            keywords: ['dokumenty', 'dokument', 'umowa', 'co potrzebuj', 'wymagane', 'potrzebne'],
            response: () => `📄 **Jakie dokumenty potrzebujesz?**\n\n• 🪪 Dowód osobisty lub paszport\n• 📋 CV (pomożemy je przygotować!)\n• 🎓 Dokumenty potwierdzające kwalifikacje (jeśli wymagane)\n\nReszta formalności leży po naszej stronie — pomagamy z umową, legalizacją i zakwaterowaniem! 💪\n\nPytania? Napisz: ${COMPANY_INFO.email}`
        },
        {
            keywords: ['język', 'jezyk', 'angielski', 'niemiecki', 'znajomość', 'znajomosc', 'mówić', 'mowic', 'komunikacja'],
            response: () => `🗣️ **Wymagania językowe:**\n\nTo zależy od stanowiska:\n• 🔧 Praca fizyczna — często wystarczy podstawowy angielski lub niemiecki\n• 📋 Praca biurowa — zwykle wymagany min. B1/B2\n• 🏗️ Budowlanka — często bez wymagań językowych\n\nSprawdź wymagania konkretnej oferty:\n👉 [Oferty pracy](oferty.html)\n\nNie znasz języka? Nie szkodzi — mamy oferty bez wymagań językowych! 🌍`
        },
        {
            keywords: ['bezpiecz', 'legaln', 'oszust', 'scam', 'wiarygod', 'zaufan', 'pewn'],
            response: () => `🔒 **WorkVIA to legalna agencja rekrutacyjna:**\n\n✅ Zarejestrowana działalność w Niemczech\n✅ Legalne umowy o pracę\n✅ Transparentne warunki zatrudnienia\n✅ Nie pobieramy opłat od kandydatów\n✅ Wsparcie przez cały okres zatrudnienia\n\n📍 Siedziba: ${COMPANY_INFO.address}\n📧 Kontakt: ${COMPANY_INFO.email}\n📱 Tel: ${COMPANY_INFO.phone}`
        },
        {
            keywords: ['dziękuję', 'dziekuje', 'dzięki', 'dzieki', 'thanks', 'thx', 'super', 'fajnie', 'ok dzięki', 'git'],
            response: () => `Cała przyjemność po mojej stronie! 😊\n\nJeśli masz jeszcze pytania — pisz śmiało! Jestem tu dla Ciebie 24/7.\n\nPowodzenia w szukaniu pracy! 🍀`
        },
        {
            keywords: ['pa', 'do widzenia', 'nara', 'cześć na razie', 'do zobaczenia', 'bye', 'papa'],
            response: () => `Do zobaczenia! 👋\n\nJeśli będziesz potrzebować pomocy — wracaj w każdej chwili!\n\nŻyczę powodzenia! 🌟 — ${BOT_NAME}`
        }
    ];

    // --- JOB SEARCH HELPERS ---
    function searchJobsByCountry(country, flag) {
        if (typeof jobs !== 'undefined' && jobs.length > 0) {
            const found = jobs.filter(j =>
                j.country?.toLowerCase().includes(country.toLowerCase())
            );
            if (found.length > 0) {
                const list = found.slice(0, 5).map(j => `• **${j.title}** — ${j.location} | ${j.salary}`).join('\n');
                return `${flag} **Oferty pracy w kraju: ${country} (${found.length}):**\n\n${list}${found.length > 5 ? `\n\n...i ${found.length - 5} więcej!` : ''}\n\n👉 [Zobacz wszystkie oferty w ${country}](oferty.html)`;
            }
            return `${flag} Niestety aktualnie nie mamy ofert w ${country}.\n\nAle nowe oferty pojawiają się regularnie! Sprawdzaj:\n👉 [oferty.html](oferty.html)\n\nLub napisz do nas: ${COMPANY_INFO.email}`;
        }
        return `${flag} Oferty z ${country} znajdziesz na:\n👉 [oferty.html](oferty.html)`;
    }

    function searchJobsByKeyword(query) {
        if (typeof jobs === 'undefined' || jobs.length === 0) return null;

        const q = query.toLowerCase();
        const found = jobs.filter(j =>
            j.title?.toLowerCase().includes(q) ||
            j.location?.toLowerCase().includes(q) ||
            j.description?.toLowerCase().includes(q) ||
            j.country?.toLowerCase().includes(q) ||
            j.tags?.some(t => t.toLowerCase().includes(q))
        );

        if (found.length > 0) {
            const list = found.slice(0, 5).map(j => `• ${j.flag} **${j.title}** — ${j.location} | ${j.salary}`).join('\n');
            return `🔍 **Wyniki wyszukiwania „${query}" (${found.length}):**\n\n${list}${found.length > 5 ? `\n\n...i ${found.length - 5} więcej!` : ''}\n\n👉 [Zobacz wszystkie oferty](oferty.html)`;
        }
        return null;
    }

    function getDefaultResponse(input) {
        // Try keyword search in jobs
        const jobResult = searchJobsByKeyword(input);
        if (jobResult) return jobResult;

        return `Hmm, nie jestem pewien jak odpowiedzieć na to pytanie. 🤔\n\nMogę pomóc z:\n• 📋 **Oferty pracy** — „Pokaż oferty"\n• 🌍 **Praca w konkretnym kraju** — np. „Niemcy", „Holandia"\n• 💰 **Wynagrodzenia** — „Ile zarabiam?"\n• 📝 **Jak aplikować** — „Jak się zgłosić?"\n• 📞 **Kontakt** — „Dane kontaktowe"\n• 🏢 **O firmie** — „Kim jesteście?"\n\nLub zadzwoń do nas: ${COMPANY_INFO.phone} 📱`;
    }

    // --- MATCHING ---
    function findResponse(input) {
        const cleaned = input.toLowerCase().trim();
        for (const pattern of PATTERNS) {
            if (pattern.keywords.some(kw => cleaned.includes(kw))) {
                return pattern.response();
            }
        }
        return getDefaultResponse(cleaned);
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
                            <div class="evia-header-name">${BOT_NAME}</div>
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
                    <button class="evia-quick-btn" data-msg="Pokaż oferty pracy">📋 Oferty pracy</button>
                    <button class="evia-quick-btn" data-msg="Jak aplikować?">📝 Jak aplikować?</button>
                    <button class="evia-quick-btn" data-msg="Kontakt">📞 Kontakt</button>
                    <button class="evia-quick-btn" data-msg="O firmie WorkVIA">🏢 O firmie</button>
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

        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    function showTyping() {
        const container = document.getElementById('eviaMessages');
        const typing = document.createElement('div');
        typing.className = 'evia-msg evia-msg-bot evia-typing-indicator';
        typing.innerHTML = `
            <div class="evia-bubble evia-bubble-bot evia-typing">
                <span></span><span></span><span></span>
            </div>`;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return typing;
    }

    function handleUserMessage(text) {
        if (!text.trim()) return;

        addMessage(text, 'user');

        // Hide quick actions after first message
        const quickActions = document.getElementById('eviaQuickActions');
        if (quickActions) quickActions.style.display = 'none';

        const typingEl = showTyping();

        setTimeout(() => {
            typingEl.remove();
            const response = findResponse(text);
            addMessage(response, 'bot');
        }, TYPING_DELAY + Math.random() * 400);
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
                    addMessage(`Cześć! 👋 Jestem **${BOT_NAME}**, wirtualny asystent WorkVIA.\n\nW czym mogę Ci dzisiaj pomóc? Możesz wpisać pytanie lub kliknąć jeden z przycisków poniżej! 😊`, 'bot');
                }, 300);
            }

            if (isOpen) {
                setTimeout(() => input.focus(), 350);
            }
        }

        toggle.addEventListener('click', toggleChat);
        close.addEventListener('click', toggleChat);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                handleUserMessage(text);
                input.value = '';
            }
        });

        // Quick action buttons
        document.getElementById('eviaQuickActions').addEventListener('click', (e) => {
            const btn = e.target.closest('.evia-quick-btn');
            if (btn) {
                handleUserMessage(btn.dataset.msg);
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) toggleChat();
        });
    }

    // Start when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
