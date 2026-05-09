document.addEventListener('DOMContentLoaded', () => {
    // Copy CA to clipboard
    const copyBtn = document.getElementById('copy-btn');
    const caText = document.getElementById('ca-text').innerText;

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(caText);
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'Copied!';
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy!', err);
                // Fallback for older browsers
                const tempInput = document.createElement("input");
                tempInput.value = caText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand("copy");
                document.body.removeChild(tempInput);
                
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'Copied!';
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                }, 2000);
            }
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => observer.observe(el));
});
