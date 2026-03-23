# Work Via - Recruitment Website

Profesjonalna strona internetowa dla agencji rekrutacyjnej Work Via.

## 📁 Struktura projektu

```
WorkVia- Strona internetowa/
├── index.html          # Główna strona HTML
├── css/
│   └── styles.css      # Style CSS z animacjami i efektami
├── js/
│   └── main.js         # Logika JavaScript (slider, animacje, etc.)
├── data/
│   └── jobs.json       # Baza ofert pracy (gotowa do integracji z CRM)
├── assets/
│   └── logo.png        # Logo firmy (proszę dodać plik)
└── README.md           # Ten plik
```

## 🚀 Jak uruchomić

### Metoda 1: Bezpośrednio (bez serwera)
Wystarczy otworzyć plik `index.html` w przeglądarce.

### Metoda 2: Z lokalnym serwerem (zalecane)
```powershell
# Python 3
python -m http.server 8000

# Lub użyj VS Code Extension "Live Server"
```

Następnie otwórz: `http://localhost:8000`

## 📝 Konfiguracja

### 1. Dodaj logo
Skopiuj plik logo do folderu `assets/`:
```powershell
Copy-Item "ścieżka\do\twojego\logo.png" "assets\logo.png"
```

### 2. Aktualizuj oferty pracy
Edytuj plik `data/jobs.json` ręcznie lub podłącz do swojego CRM.

Struktura oferty:
```json
{
    "id": 1,
    "title": "Nazwa stanowiska",
    "company": "Nazwa firmy",
    "country": "Kraj",
    "flag": "🇵🇱",
    "location": "Miasto",
    "salary": "3000 - 4000 EUR",
    "type": "Pełny etat",
    "experience": "1-2 lata",
    "tags": ["Tag1", "Tag2", "Tag3"]
}
```

### 3. Dane kontaktowe
Zaktualizuj dane kontaktowe w pliku `index.html` (sekcja `#kontakt`):
- Adres
- Telefon
- Email
- Godziny otwarcia

### 4. Social Media
Zaktualizuj linki do social media w nawigacji i footerze.

## 🎨 Kolory

Strona używa palety kolorów Work Via:
- **Złoty**: `#D4AF37` (primary)
- **Ciemny granat**: `#1a1f3a` (secondary)

Zmień kolory w pliku `css/styles.css` w sekcji `:root` variables.

## ✨ Funkcje

- ✅ **Responsywna** - działa na wszystkich urządzeniach (mobile, tablet, desktop)
- ✅ **Animacje** - płynne przejścia i efekty scroll
- ✅ **Slider ofert** - automatyczny carousel z ofertami pracy
- ✅ **Particles** - animowane cząsteczki w tle hero section
- ✅ **Liczniki** - animowane statystyki
- ✅ **Smooth scroll** - płynne przewijanie do sekcji
- ✅ **Mobile menu** - hamburger menu na urządzeniach mobilnych
- ✅ **Formularz kontaktowy** - z walidacją
- ✅ **SEO podstawowe** - meta tagi, semantyczny HTML

## 🔧 Personalizacja

### Zmiana tekstów
Wszystkie teksty znajdują się w pliku `index.html`. Możesz je swobodnie edytować.

### Dodanie/usunięcie sekcji
Sekcje są ułożone modułowo. Możesz je kopiować, usuwać lub zmieniać kolejność.

### Integracja z CRM
Aktualnie oferty są wczytywane z pliku `data/jobs.json`. 

Aby podłączyć CRM, zmodyfikuj funkcję `loadJobs()` w pliku `js/main.js`:

```javascript
async function loadJobs() {
    try {
        // Zamień URL na swój endpoint CRM
        const response = await fetch('https://twoj-crm.pl/api/jobs');
        jobs = await response.json();
        renderJobCards();
        initSlider();
    } catch (error) {
        console.error('Error loading jobs:', error);
        useMockJobs(); // Fallback na lokalne dane
    }
}
```

## 📱 Responsywność

Strona jest w pełni responsywna:
- **Desktop**: >= 992px (3 oferty w sliderze)
- **Tablet**: 768px - 991px (2 oferty w sliderze)
- **Mobile**: < 768px (1 oferta w sliderze)

## 🌐 Przeglądarki

Strona jest kompatybilna z:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## 📧 Formularz kontaktowy

Obecnie formularz wyświetla tylko powiadomienie. Aby podłączyć backend:

1. Stwórz endpoint API do obsługi formularzy
2. Zmodyfikuj funkcję `initContactForm()` w `js/main.js`
3. Dodaj wysyłkę na serwer zamiast console.log

Przykład:
```javascript
const response = await fetch('https://twoj-backend.pl/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
```

## 🚀 Deployment

### GitHub Pages
1. Stwórz repozytorium na GitHub
2. Push projekt
3. Włącz GitHub Pages w Settings

### Netify
1. Przeciągnij folder projektu na Netlify
2. Gotowe!

### Własny hosting
1. Zapakuj wszystkie pliki
2. Wyślij przez FTP na serwer
3. Upewnij się, że index.html jest w głównym katalogu

## 📞 Wsparcie

Stworzone dla **Work Via Recruitment** - Marzec 2026

Masz pytania? Skontaktuj się z developerem lub edytuj pliki według potrzeb!

---

**Autor**: GitHub Copilot  
**Data**: Marzec 2026  
**Wersja**: 1.0
