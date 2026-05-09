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
    const loadingZone = document.getElementById('loading-zone');
    const canvas = document.getElementById('pfp-canvas');
    const ctx = canvas?.getContext('2d');
    const downloadBtn = document.getElementById('download-btn');
    const resetBtn = document.getElementById('reset-btn');
    const apiKeyInput = document.getElementById('openai-key');
    const aiResultImg = document.getElementById('ai-result-img');

    // Load saved API key
    if (apiKeyInput) {
        const savedKey = localStorage.getItem('openai_key');
        if (savedKey) apiKeyInput.value = savedKey;
        apiKeyInput.addEventListener('change', (e) => {
            localStorage.setItem('openai_key', e.target.value.trim());
        });
    }

    const logoImg = new Image();
    logoImg.src = 'logo.png'; // Preload logo
    logoImg.crossOrigin = "Anonymous";

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
            loadingZone.style.display = 'none';
            uploadZone.style.display = 'block';
            aiResultImg.src = '';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        downloadBtn.addEventListener('click', async () => {
            try {
                const res = await fetch(aiResultImg.src);
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'ai-aurahouse-pfp.png';
                link.href = url;
                link.click();
                window.URL.revokeObjectURL(url);
            } catch (e) {
                window.open(aiResultImg.src, '_blank');
            }
        });

        function processImage(file) {
            if (!file.type.startsWith('image/')) return alert('Please upload an image file.');
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) return alert('Please enter your OpenAI API key first!');

            uploadZone.style.display = 'none';
            loadingZone.style.display = 'flex';

            const reader = new FileReader();
            reader.onload = (event) => {
                const userImg = new Image();
                userImg.onload = async () => {
                    // 1. Draw base blend on 512x512 canvas for OpenAI
                    canvas.width = 512;
                    canvas.height = 512;
                    const size = Math.min(userImg.width, userImg.height);
                    const startX = (userImg.width - size) / 2;
                    const startY = (userImg.height - size) / 2;
                    ctx.drawImage(userImg, startX, startY, size, size, 0, 0, 512, 512);

                    const drawLogo = () => {
                        const logoSize = 300;
                        const ratio = logoImg.width / logoImg.height || 1;
                        const w = logoSize;
                        const h = logoSize / ratio;
                        ctx.drawImage(logoImg, 512 - w - 20, 512 - h - 20, w, h);
                    };

                    if (logoImg.complete && logoImg.naturalHeight !== 0) drawLogo();
                    else await new Promise(r => { logoImg.onload = () => { drawLogo(); r(); }});

                    // 2. Export and send to API
                    canvas.toBlob(async (blob) => {
                        try {
                            const formData = new FormData();
                            formData.append('image', blob, 'image.png');
                            formData.append('n', 1);
                            formData.append('size', '512x512');

                            const res = await fetch('https://api.openai.com/v1/images/variations', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${apiKey}`
                                },
                                body: formData
                            });

                            const data = await res.json();
                            if (data.error) throw new Error(data.error.message);

                            // 3. Show result
                            aiResultImg.src = data.data[0].url;
                            loadingZone.style.display = 'none';
                            previewZone.style.display = 'flex';

                        } catch (err) {
                            alert('AI Generation failed: ' + err.message);
                            resetBtn.click();
                        }
                    }, 'image/png');
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
