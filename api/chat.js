export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { message, jobsContext } = req.body;

        if (!message || typeof message !== 'string' || message.length > 1000) {
            return res.status(400).json({ error: 'Invalid message' });
        }

        const systemPrompt = `Jesteś e-Via — wirtualnym asystentem firmy WorkVIA Recruitment. Odpowiadasz WYŁĄCZNIE po polsku, krótko, przyjaźnie i z emoji.

INFORMACJE O FIRMIE:
- Nazwa: WorkVIA Recruitment 
- Specjalizacja: Rekrutacja do pracy w Zachodniej Europie (Niemcy, Holandia, Belgia, Francja, Austria, Szwajcaria)
- Email: workvia.recruitment@gmail.com
- Telefon: +48 453 310 569
- Adres: WorkVia Recruitment, Magdalena Syrnicka, 89356 Haldenwang, Deutschland
- Godziny pracy: Pon-Pt 8:00-18:00, Sob 9:00-14:00
- Strona z ofertami: oferty.html
- Firma jest legalna, zarejestrowana w Niemczech
- Nie pobiera opłat od kandydatów
- Pomaga z zakwaterowaniem, legalizacją, umowami
- Oferuje wsparcie przez cały okres zatrudnienia

USŁUGI:
- Rekrutacja do pracy w krajach UE
- Pomoc w legalizacji zatrudnienia
- Organizacja zakwaterowania
- Wsparcie podczas procesu rekrutacji
- Doradztwo zawodowe

JAK APLIKOWAĆ:
1. Wejdź na oferty.html
2. Wybierz ofertę
3. Kliknij "Aplikuj teraz"
4. Wypełnij formularz
5. Rekruter skontaktuje się w ciągu 24h

${jobsContext ? `AKTUALNE OFERTY PRACY:\n${jobsContext}` : 'Aktualnie ładuję oferty pracy...'}

ZASADY:
- Odpowiadaj TYLKO na pytania związane z pracą za granicą, ofertami, firmą WorkVIA, rekrutacją, kontaktem
- Jeśli pytanie nie dotyczy tych tematów, grzecznie przekieruj rozmowę na temat pracy
- NIGDY nie wymyślaj ofert pracy — korzystaj TYLKO z listy powyżej
- Odpowiedzi max 3-4 zdania, chyba że ktoś pyta o szczegóły
- Używaj emoji i formatowania markdown (**pogrubienie**, listy z •)
- Kiedy ktoś pyta o oferty, wymieniaj konkretne z listy (max 5)
- Zawsze zachęcaj do kontaktu lub odwiedzenia oferty.html`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('OpenAI error:', err);
            return res.status(502).json({ error: 'AI service error' });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || '';

        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
