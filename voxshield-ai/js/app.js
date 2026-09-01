/* VoxShield AI - Global App Controller & Shared UI */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Hamburger Menu Toggle
  const hamburger = document.getElementById('hamburgerToggle');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close drawer when clicking outside or link
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });
  }

  // Active Link Highlighting based on URL
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Privacy Modal Triggers
  const privacyModal = document.getElementById('privacyModal');
  const btnPrivacyTriggers = document.querySelectorAll('.btn-privacy-modal');
  const privacyModalClose = document.getElementById('privacyModalClose');

  if (privacyModal) {
    btnPrivacyTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        privacyModal.classList.add('active');
      });
    });

    if (privacyModalClose) {
      privacyModalClose.addEventListener('click', () => {
        privacyModal.classList.remove('active');
      });
    }

    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) {
        privacyModal.classList.remove('active');
      }
    });
  }

  // Hero Section Waveform Animation on index.html
  const heroCanvas = document.getElementById('heroWaveformCanvas');
  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let step = 0;

    function resizeCanvas() {
      heroCanvas.width = heroCanvas.parentElement.clientWidth || 400;
      heroCanvas.height = heroCanvas.parentElement.clientHeight || 260;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawHeroWave() {
      const width = heroCanvas.width;
      const height = heroCanvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw animated soundwave spectrum
      const barCount = 36;
      const barWidth = width / barCount;
      step += 0.04;

      for (let i = 0; i < barCount; i++) {
        const factor = Math.sin(step + i * 0.2) * Math.cos(step * 0.7 + i * 0.1);
        const barHeight = Math.abs(factor) * (height * 0.65) + 15;
        
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#00f2fe');
        gradient.addColorStop(0.5, '#7f53ac');
        gradient.addColorStop(1, '#ff0844');

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 3, (height - barHeight) / 2, barWidth - 6, barHeight);
      }

      requestAnimationFrame(drawHeroWave);
    }

    drawHeroWave();
  }
});
