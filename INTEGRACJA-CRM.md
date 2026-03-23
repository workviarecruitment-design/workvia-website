# Integracja Strony WorkVia z CRM - Instrukcja

## ✅ Co zostało zrobione?

Strona internetowa WorkVia została połączona z Twoim systemem CRM i teraz automatycznie pobiera aktualne oferty pracy bezpośrednio z bazy danych.

### Połączenie z CRM

**URL API:** `https://workvia-crm2026.onrender.com/api/jobs/public/active`

Strona pobiera tylko oferty które:
- Mają status "active" (aktywne)
- **Są zaznaczone do publikacji** (checkbox "📢 Publikuj na stronie WWW")
- Nie są przeterminowane (deadline nie minął)

System automatycznie filtruje i wyświetla tylko opublikowane oferty.

---

## 📋 Jak dodawać oferty na stronę?

### 1. Zaloguj się do CRM
Adres: https://workvia-crm2026.onrender.com

### 2. Dodaj nową ofertę pracy
W panelu CRM:
- Przejdź do sekcji "Oferty pracy"
- Kliknij "Dodaj ofertę"
- Wypełnij formularz

### 3. Ważne pola do wypełnienia:

**Podstawowe:**
- **Tytuł** - nazwa stanowiska (np. "Operator wózka widłowego")
- **Opis** - szczegółowy opis oferty
- **Kraj** - wybierz kraj (Niemcy, Holandia, etc.)
- **Miasto** - lokalizacja pracy

**Wynagrodzenie:**
- **Minimalne wynagrodzenie** - dolna granica
- **Maksymalne wynagrodzenie** - górna granica
- **Waluta** - EUR, GBP, CHF, PLN
- LUB **Stawka godzinowa** - jeśli płatność za godzinę

**Szczegóły:**
- **Typ zatrudnienia** - pełny etat, część etatu, kontrakt, staż
- **Poziom doświadczenia** - początkujący, mid, senior, expert, brak wymagań
- **Język** - wymagany język komunikacji

**Dodatkowe korzyści:**
- ✅ **Zakwaterowanie** - zaznacz jeśli firmaoferuje zakwaterowanie
- ✅ **Praca zdalna** - zaznacz jeśli możliwa praca zdalna
- ✅ **Liczba stanowisk** - ile osób szukasz

### 4. Grafika do oferty (opcjonalnie)

**Jak dodać zdjęcie:**
1. W formularzu oferty znajdź pole "Zdjęcie oferty"
2. Kliknij "Upload Image"
3. Wybierz plik (JPG, PNG, max 10MB)
4. Zdjęcie automatycznie pojawi się w karcie oferty na stronie

**Zalecenia dla zdjęć:**
- Rozmiar: 800x600px lub podobne proporcje (4:3 lub 16:9)
- Format: JPG lub PNG
- Waga: do 2MB (dla szybszego ładowania)
- Tematyka: miejsce pracy, narzędzia, maszyny, kraj/miasto

### 5. Publikacja na stronie

**Aby oferta pojawiła się na stronie WWW:**

✅ Ustaw status: **"Active"** (aktywna)
✅ **Zaznacz checkbox: "📢 Publikuj na stronie WWW"** (pole obok statusu)
✅ Opcjonalnie ustaw termin: **Deadline** (data zakończenia rekrutacji)

**Zapisz ofertę** - pojawi się na stronie internetowej w ciągu kilku sekund!

**Uwaga:** Aby oferta była widoczna na stronie, MUSISZ zaznaczyć checkbox "Publikuj na stronie WWW". Dzięki temu masz pełną kontrolę nad tym, które oferty są publiczne.

---

## 🎨 Jak wygląda oferta na stronie?

Każda karta oferty pokazuje:
- 🏳️ Flagę kraju
- 📷 Zdjęcie (jeśli dodano)
- 📋 Tytuł stanowiska
- 🏢 Nazwę firmy klienta
- 📍 Lokalizację (miasto, kraj)
- 💼 Typ zatrudnienia
- 👤 Wymagane doświadczenie
- 💰 Wynagrodzenie
- 🏷️ Tagi (do 3): typ pracy, zakwaterowanie, język, praca zdalna

---

## 🔍 Mapowanie danych CRM → Strona

| Pole w CRM | Co pokazuje na stronie |
|------------|------------------------|
| `title` | Tytuł stanowiska |
| `company_name` | Nazwa firmy |
| `country` | Kraj + flaga emoji |
| `city` / `location` | Miasto/Lokalizacja |
| `salary_min` - `salary_max` | "3000 - 4000 EUR" |
| `hourly_rate` | "18.50 EUR/godz" |
| `employment_type` | "Pełny etat" / "Kontrakt" itp. |
| `experience_level` | Poziom doświadczenia |
| `accommodation` | Tag "Zakwaterowanie" |
| `remote_option` | Tag "Praca zdalna" |
| `language` | Tag "Język: Niemiecki" |
| `image_url` | Zdjęcie w karcie oferty |

---

## ⚙️ Pliki zmodyfikowane

1. **js/main.js** - zaktualizowana funkcja `loadJobs()`:
   - Pobiera dane z API CRM zamiast z lokalnego pliku JSON
   - Mapuje pola z backendu na format strony
   - Obsługuje zdjęcia ofert
   - Ma fallback na przykładowe dane jeśli API nie działa

2. **css/styles.css** - dodane style dla `.job-image`:
   - Wyświetlanie zdjęć w kartach ofert
   - Efekt powiększenia przy hover

---

## 🔧 Rozwiązywanie problemów

### Oferty nie pojawiają się na stronie?

**Sprawdź:**
1. **Czy zaznaczono checkbox "📢 Publikuj na stronie WWW"?** (to najczęstsza przyczyna!)
3. Czy deadline nie minął?
4. Czy backend CRM działa? (https://workvia-crm2026.onrender.com)
5. Czy wypełnione są wymagane pola (tytuł, opis, kraj, miasto)?
6. Otwórz konsolę przeglądarki (F12) i sprawdź komunikatym)
4. Czy wypełnione są wymagane pola (tytuł, opis, kraj, miasto)?

**Konsola przeglądarki:**
- Otwórz stronę
- Naciśnij F12
- Zakładka "Console"
- Sprawdź czy są błędy

### Zdjęcia nie wyświetlają się?

1. Sprawdź czy URL zdjęcia jest poprawny w CRM
2. Upewnij się że zdjęcie jest publiczne (Supabase Storage)
3. Sprawdź format (JPG, PNG)

### Strona pokazuje przykładowe oferty zamiast z CRM?

To oznacza że API nie odpowiada (fallback). Możliwe przyczyny:
- Backend CRM jest wyłączony
- Problem z połączeniem internetowym
- CORS (blokada cross-origin) - powinno być ustawione poprawnie

---

## 📊 Statystyki i liczniki

Liczby w sekcji hero (5000 / 150 / 12) są statyczne w HTML.
Jeśli chcesz aby liczba aktywnych ofert ("150") była dynamiczna:

```javascript
// Automatycznie policzy oferty z API
document.querySelector('[data-target="150"]').setAttribute('data-target', jobs.length);
```

---

## 🚀 Następne kroki (opcjonalne)

1. **Strona szczegółów oferty** - kliknięcie w kartę → pełny opis oferty
2. **Filtrowanie ofert** - kraj, typ zatrudnienia, wynagrodzenie
3. **Wyszukiwarka** - szukaj po tytule lub lokalizacji
4. **Formularz aplikacyjny** - wysyłanie CV bezpośrednio do CRM

---

## 📞 Wsparcie techniczne - zobaczysz ile ofert zostało pobranych
2. Upewnij się że backend CRM działa
3. **Sprawdź czy oferta ma zaznaczony checkbox "Publikuj na stronie WWW"**
4. Sprawdź czy status to "Active"
5. Sprawdź czy wypełnione są wszystkie wymagane pola

**Wszystko działa automatycznie!** 
Dodajesz ofertę w CRM → zaznaczasz "Publikuj na stronie WWWmagane pola

**Wszystko działa automatycznie!** 
Dodajesz ofertę w CRM ze statusem "Active" → pojawia się na stronie w czasie rzeczywistym. 🎉
