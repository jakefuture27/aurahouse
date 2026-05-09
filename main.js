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

    // PFP Maker Logic
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('pfp-upload');
    const uploadZone = document.getElementById('upload-zone');
    const previewZone = document.getElementById('preview-zone');
    const canvas = document.getElementById('pfp-canvas');
    const ctx = canvas?.getContext('2d');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');

    const logoImg = new Image();
    logoImg.src = 'logo.png'; // Preload logo

    if (uploadBtn && ctx) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('click', (e) => {
            if (e.target !== uploadBtn && e.target !== fileInput) fileInput.click();
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processImage(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                processImage(e.target.files[0]);
            }
        });

        resetBtn.addEventListener('click', () => {
            fileInput.value = '';
            previewZone.style.display = 'none';
            uploadZone.style.display = 'block';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'aurahouse-pfp.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });

        function processImage(file) {
            if (!file.type.startsWith('image/')) return alert('Please upload an image file.');

            const reader = new FileReader();
            reader.onload = (event) => {
                const userImg = new Image();
                userImg.onload = () => {
                    uploadZone.style.display = 'none';
                    previewZone.style.display = 'flex';

                    canvas.width = 800;
                    canvas.height = 800;

                    const size = Math.min(userImg.width, userImg.height);
                    const startX = (userImg.width - size) / 2;
                    const startY = (userImg.height - size) / 2;

                    ctx.drawImage(userImg, startX, startY, size, size, 0, 0, canvas.width, canvas.height);

                    const gradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
                    gradient.addColorStop(0, 'rgba(0,0,0,0)');
                    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    const drawLogo = () => {
                        const logoSize = canvas.width * 0.40;
                        const padding = 20;
                        const ratio = logoImg.width / logoImg.height || 1;
                        const w = logoSize;
                        const h = logoSize / ratio;
                        ctx.drawImage(logoImg, canvas.width - w - padding, canvas.height - h - padding, w, h);
                    };

                    if (logoImg.complete && logoImg.naturalHeight !== 0) {
                        drawLogo();
                    } else {
                        logoImg.onload = drawLogo;
                    }
                };
                userImg.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
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
