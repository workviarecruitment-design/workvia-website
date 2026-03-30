// Contact Form Handler - REWRITTEN to match working application form
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            const msgContainer = document.getElementById('contactFormMessage') || createMessageContainer();
            
            // Show loading
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Wysyłanie...';
            msgContainer.innerHTML = '';
            
            try {
                const formData = new FormData(contactForm);
                
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    msgContainer.innerHTML = '<div class="form-message form-message-success">✅ Wiadomość wysłana! Skontaktujemy się z Tobą wkrótce.</div>';
                    contactForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Form error:', error);
                msgContainer.innerHTML = '<div class="form-message form-message-error">❌ Błąd wysyłania. Spróbuj ponownie lub zadzwoń: +48 453 310 569</div>';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
    
    function createMessageContainer() {
        const container = document.createElement('div');
        container.id = 'contactFormMessage';
        contactForm.appendChild(container);
        return container;
    }
});
