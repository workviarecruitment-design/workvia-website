// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Wysyłanie...';
            
            try {
                // Use FormData directly - browser collects values natively
                // This works even with autofill when .value is empty
                const formData = new FormData(contactForm);
                
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success message
                    showMessage('✅ Wiadomość wysłana! Skontaktujemy się z Tobą wkrótce.', 'success');
                    contactForm.reset();
                } else {
                    throw new Error('Submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage('❌ Błąd wysyłania. Spróbuj ponownie lub zadzwoń: +48 453 310 569', 'error');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    
    function showMessage(text, type) {
        // Remove existing message
        const existingMsg = document.querySelector('.form-message');
        if (existingMsg) existingMsg.remove();
        
        // Create message element
        const message = document.createElement('div');
        message.className = `form-message form-message-${type}`;
        message.textContent = text;
        
        // Insert after form
        contactForm.parentNode.insertBefore(message, contactForm.nextSibling);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    }
});
