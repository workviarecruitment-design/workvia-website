// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Check for job application context in URL
        checkJobApplicationContext();
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Wysyłanie...';
            
            // Get form data
            const formData = new FormData(contactForm);
            
            try {
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
    
    function checkJobApplicationContext() {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('job_id');
        const jobTitle = urlParams.get('job_title');
        const jobLocation = urlParams.get('job_location');
        
        if (jobId && jobTitle) {
            // Fill hidden fields
            document.getElementById('jobId').value = jobId;
            document.getElementById('jobTitle').value = jobTitle;
            document.getElementById('jobLocation').value = jobLocation || '';
            
            // Auto-select "Pytanie o ofertę pracy" in subject dropdown
            const subjectSelect = document.getElementById('subject');
            if (subjectSelect) {
                subjectSelect.value = 'Pytanie o ofertę pracy';
            }
            
            // Pre-fill message with job info
            const messageField = document.getElementById('message');
            if (messageField && !messageField.value) {
                messageField.value = `Dzień dobry,\n\nChciałbym/Chciałabym aplikować na stanowisko:\n\n📋 ID Oferty: ${jobId}\n📌 Stanowisko: ${jobTitle}\n📍 Lokalizacja: ${jobLocation || 'N/A'}\n\n`;
                messageField.focus();
                // Move cursor to end
                messageField.setSelectionRange(messageField.value.length, messageField.value.length);
            }
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'job-application-notice';
            notification.innerHTML = `
                <strong>📋 Aplikujesz na:</strong> ${jobTitle} (ID: ${jobId})<br>
                <small>Informacje o ofercie zostały automatycznie dodane poniżej</small>
            `;
            contactForm.insertBefore(notification, contactForm.firstChild);
        }
    }
});
