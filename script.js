/* ============================================================
   YOSCRYPT — script.js
   CRT effects, pixel noise, hooded figure SVG, glitch tick.
   NO jQuery. Vanilla ES6+. Runs immediately on DOMContentLoaded.
   ============================================================ */

'use strict';

(function () {

  /* ── 1. Pixel-noise canvas overlay ── */
  function initNoiseCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'noise-canvas';
    Object.assign(canvas.style, {
      position:      'fixed',
      top:           '0',
      left:          '0',
      width:         '100%',
      height:        '100%',
      pointerEvents: 'none',
      zIndex:        '9997',
      opacity:       '0.025',
      mixBlendMode:  'overlay',
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animId;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function renderNoise() {
      const w = canvas.width;
      const h = canvas.height;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        // dithered 2-bit grain — mostly black, sparse gold-tinted speckles
        const v = Math.random() < 0.12
          ? Math.floor(Math.random() * 60 + 40)   // sparse bright speckle
          : 0;
        data[i]     = Math.floor(v * 0.85);   // R — amber shift
        data[i + 1] = Math.floor(v * 0.65);   // G
        data[i + 2] = Math.floor(v * 0.10);   // B
        data[i + 3] = v > 0 ? 255 : 0;
      }
      ctx.putImageData(imageData, 0, 0);
      animId = requestAnimationFrame(renderNoise);
    }

    resize();
    renderNoise();
    window.addEventListener('resize', resize, { passive: true });
  }

  /* ── 2. Hooded figure — drawn as SVG injected into #bg-character ── */
  function initHoodedFigure() {
    const container = document.getElementById('bg-character');
    if (!container) return;

    // SVG — silhouette: long dark coat, white Scream mask, standing facing viewer
    // Deliberately low-detail (16-bit degraded look) — flat fills, minimal detail
    container.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 340 700"
     preserveAspectRatio="xMidYMax meet"
     style="width:100%;height:auto;display:block;">
  <defs>
    <!-- Amber rim light — subtle glow on figure edges -->
    <filter id="rim-glow" x="-20%" y="-5%" width="140%" height="110%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feColorMatrix in="blur" type="matrix"
        values="1 0.6 0 0 0
                0.5 0.3 0 0 0
                0   0   0 0 0
                0   0   0 0.5 0" result="amber"/>
      <feMerge><feMergeNode in="amber"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- pixel degradation -->
    <filter id="pixelate">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5"
        xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <!-- composite: rim + pixelate -->
    <filter id="figure-filter" x="-15%" y="-5%" width="130%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" result="displaced"/>
      <feGaussianBlur in="displaced" stdDeviation="2.5" result="blurred"/>
      <feColorMatrix in="blurred" type="matrix"
        values="0.8 0.2 0 0 0.05
                0.4 0.2 0 0 0.02
                0   0   0 0 0
                0   0   0 1.2 0" result="tinted"/>
      <feMergeNode in="tinted"/>
    </filter>
  </defs>

  <!-- Long black hooded coat / cloak — full body silhouette -->
  <!-- Coat body — wide, floor-length -->
  <path d="
    M 105 195
    C  95 220, 70 280, 60 360
    C  45 450, 40 530, 42 640
    C  42 680, 60 700, 85 700
    L 255 700
    C 280 700, 298 680, 298 640
    C 300 530, 295 450, 280 360
    C 270 280, 245 220, 235 195
    Z"
    fill="#060606"
    filter="url(#figure-filter)"/>

  <!-- Hood — large, deep, draped -->
  <path d="
    M 90 160
    C  75 140, 70 115, 72 95
    C  74  65, 82  40, 100 25
    C 115  12, 130  8, 170  8
    C 210   8, 225 12, 240 25
    C 258  40, 266 65, 268 95
    C 270 115, 265 140, 250 160
    C 238 178, 222 190, 210 195
    L 130 195
    C 118 190, 102 178, 90 160
    Z"
    fill="#060606"
    filter="url(#figure-filter)"/>

  <!-- Hood inner shadow depth -->
  <ellipse cx="170" cy="135" rx="60" ry="50"
    fill="#020202" opacity="0.85"/>

  <!-- Scream mask — white, elongated teardrop, facing viewer -->
  <!-- Mask base shape -->
  <path d="
    M 170 72
    C 145 72, 128 88, 125 110
    C 122 130, 125 155, 130 172
    C 135 188, 148 198, 170 200
    C 192 198, 205 188, 210 172
    C 215 155, 218 130, 215 110
    C 212  88, 195 72, 170 72
    Z"
    fill="#e8e4dc"
    filter="url(#figure-filter)"/>

  <!-- Mask eye holes — hollow dark ovals -->
  <ellipse cx="154" cy="115" rx="11" ry="14" fill="#0a0a0a"/>
  <ellipse cx="186" cy="115" rx="11" ry="14" fill="#0a0a0a"/>

  <!-- Mask mouth — elongated O, screaming expression -->
  <ellipse cx="170" cy="162" rx="13" ry="19" fill="#0a0a0a"/>

  <!-- Amber rim light edge — barely visible coat outline -->
  <path d="
    M 105 195
    C  95 220, 70 280, 60 360
    C  45 450, 40 530, 42 640
    L 42 700 L 50 700
    C 50 640, 52 520, 65 380
    C 74 280, 98 215, 108 195
    Z"
    fill="none"
    stroke="#7a5010"
    stroke-width="1.5"
    opacity="0.35"/>

  <path d="
    M 235 195
    C 242 215, 266 280, 275 380
    C 288 520, 290 640, 290 700
    L 298 700 L 298 640
    C 296 530, 292 445, 280 355
    C 270 275, 245 215, 232 195
    Z"
    fill="none"
    stroke="#7a5010"
    stroke-width="1.5"
    opacity="0.35"/>

  <!-- Hands — partially emerged from coat, dark, slightly gnarled -->
  <!-- Left hand -->
  <path d="M 78 440 C 65 445, 55 455, 52 468 C 50 478, 56 485, 65 482
    C 62 488, 60 496, 64 500 C 68 504, 74 501, 76 496
    C 74 504, 73 512, 77 515 C 81 518, 86 514, 87 508
    C 86 516, 87 522, 92 523 C 97 524, 100 518, 100 510
    C 100 502, 98 490, 96 480 C 105 475, 110 466, 108 455
    C 106 444, 96 438, 86 438 Z"
    fill="#0e0c08" opacity="0.9" filter="url(#figure-filter)"/>

  <!-- Right hand -->
  <path d="M 262 440 C 275 445, 285 455, 288 468 C 290 478, 284 485, 275 482
    C 278 488, 280 496, 276 500 C 272 504, 266 501, 264 496
    C 266 504, 267 512, 263 515 C 259 518, 254 514, 253 508
    C 254 516, 253 522, 248 523 C 243 524, 240 518, 240 510
    C 240 502, 242 490, 244 480 C 235 475, 230 466, 232 455
    C 234 444, 244 438, 254 438 Z"
    fill="#0e0c08" opacity="0.9" filter="url(#figure-filter)"/>
</svg>`;
  }

  /* ── 3. Subtle glitch tick — periodic horizontal stripe on the page ── */
  function initGlitchTick() {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position:      'fixed',
      left:          '0',
      width:         '100%',
      height:        '3px',
      background:    'rgba(184, 146, 42, 0.15)',
      pointerEvents: 'none',
      zIndex:        '9996',
      opacity:       '0',
      transition:    'opacity 0.05s',
    });
    document.body.appendChild(overlay);

    function tick() {
      const delay = 3000 + Math.random() * 6000;
      setTimeout(() => {
        const top = Math.random() * window.innerHeight;
        overlay.style.top    = top + 'px';
        overlay.style.opacity = '1';
        setTimeout(() => {
          overlay.style.opacity = '0';
          tick();
        }, 60 + Math.random() * 80);
      }, delay);
    }
    tick();
  }

  /* ── 4. Verify all YOSCRYPT text nodes — runtime assertion ── */
  function assertBrand() {
    const bodyText = document.body.innerText || '';
    if (bodyText.includes('UMBRA')) {
      console.warn('[YOSCRYPT] Brand assertion FAILED — "UMBRA" found in DOM.');
    }
    // Confirm identity
    const logos = document.querySelectorAll('[data-text]');
    logos.forEach(el => {
      if (el.getAttribute('data-text') !== 'YOSCRYPT') {
        el.setAttribute('data-text', 'YOSCRYPT');
      }
    });
  }

  /* ── 5. Boot ── */
  document.addEventListener('DOMContentLoaded', function () {
    initNoiseCanvas();
    initHoodedFigure();
    initGlitchTick();
    assertBrand();
  });

})();
