import * as THREE from 'three';

export const PAGE_DATA = [
  {
    id: 1,
    pageNumber: '01',
    title: 'I. Serene Dawn',
    subtitle: 'The Awakening Sky',
    caption: 'The dawn awakens in gentle coral light, breathing warmth into the quiet stillness of the day.',
    themeColor: '#ff7a59',
    bgColor: '#ffe8e1',
    gradientEnd: '#ffd1c2',
    accentColor: '#d64024',
    textColor: '#3d160e'
  },
  {
    id: 2,
    pageNumber: '02',
    title: 'II. Whispering Canopy',
    subtitle: 'Verdant Solitude',
    caption: 'Beneath emerald boughs, morning dewdrops catch sunlight as gentle leaves whisper timeless melodies.',
    themeColor: '#2a9d8f',
    bgColor: '#e0f4f0',
    gradientEnd: '#b7e4dc',
    accentColor: '#1d7368',
    textColor: '#0f312c'
  },
  {
    id: 3,
    pageNumber: '03',
    title: 'III. Stellar Nightfall',
    subtitle: 'Celestial Amethyst',
    caption: 'As twilight cascades into amethyst, the heavens unfurl a celestial tapestry of distant dreams.',
    themeColor: '#9d4edd',
    bgColor: '#f4eafc',
    gradientEnd: '#e4cbf8',
    accentColor: '#6a1b9a',
    textColor: '#2e0854'
  }
];

// Helper to draw geometric/botanical artwork on page canvas
function drawArtwork(ctx, pageIndex, cx, cy) {
  ctx.save();
  if (pageIndex === 0) {
    // Page 1 Artwork: Rising Sun & Horizon Arches
    // Background glow
    const radial = ctx.createRadialGradient(cx, cy, 20, cx, cy, 240);
    radial.addColorStop(0, 'rgba(255, 122, 89, 0.45)');
    radial.addColorStop(1, 'rgba(255, 122, 89, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    // Central Sun
    ctx.fillStyle = '#ff6b4a';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 110, Math.PI, 0); // half circle sun
    ctx.fill();

    // Inner sun detail
    ctx.fillStyle = '#ff8e72';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 75, Math.PI, 0);
    ctx.fill();

    // Geometric concentric rings
    ctx.strokeStyle = '#e05335';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 150, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(214, 64, 36, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 185, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Horizon line & wave ripples
    ctx.strokeStyle = '#3d160e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 200, cy + 20);
    ctx.lineTo(cx + 200, cy + 20);
    ctx.stroke();

    // Gentle ripple lines below
    for (let i = 1; i <= 3; i++) {
      ctx.strokeStyle = `rgba(61, 22, 14, ${0.4 - i * 0.1})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 160 + i * 20, cy + 20 + i * 22);
      ctx.lineTo(cx + 160 - i * 20, cy + 20 + i * 22);
      ctx.stroke();
    }
  } else if (pageIndex === 1) {
    // Page 2 Artwork: Botanical Leaves & Zen Rings
    const radial = ctx.createRadialGradient(cx, cy, 20, cx, cy, 240);
    radial.addColorStop(0, 'rgba(42, 157, 143, 0.4)');
    radial.addColorStop(1, 'rgba(42, 157, 143, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    // Soft organic oval
    ctx.fillStyle = '#2a9d8f';
    ctx.beginPath();
    ctx.ellipse(cx - 30, cy + 20, 90, 130, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Floating sage circle
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.arc(cx + 60, cy - 40, 70, 0, Math.PI * 2);
    ctx.fill();

    // Delicate botanical stem
    ctx.strokeStyle = '#0f312c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy + 160);
    ctx.quadraticCurveTo(cx - 20, cy + 30, cx + 50, cy - 100);
    ctx.stroke();

    // Zen geometric circle
    ctx.strokeStyle = 'rgba(15, 49, 44, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy + 10, 170, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Page 3 Artwork: Crescent Moon & Celestial Cosmos
    const radial = ctx.createRadialGradient(cx, cy, 20, cx, cy, 240);
    radial.addColorStop(0, 'rgba(157, 78, 221, 0.45)');
    radial.addColorStop(1, 'rgba(157, 78, 221, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(cx, cy, 240, 0, Math.PI * 2);
    ctx.fill();

    // Golden / Amethyst Crescent Moon
    ctx.fillStyle = '#9d4edd';
    ctx.beginPath();
    ctx.arc(cx - 20, cy + 10, 100, 0, Math.PI * 2);
    ctx.fill();

    // Cutout to form crescent
    ctx.fillStyle = PAGE_DATA[2].bgColor;
    ctx.beginPath();
    ctx.arc(cx + 25, cy - 20, 90, 0, Math.PI * 2);
    ctx.fill();

    // Orbital ring
    ctx.strokeStyle = '#6a1b9a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 190, 65, Math.PI / 5, 0, Math.PI * 2);
    ctx.stroke();

    // Little twinkling stars
    const stars = [
      { x: cx + 110, y: cy - 90, s: 7 },
      { x: cx - 120, y: cy - 60, s: 5 },
      { x: cx + 70, y: cy + 120, s: 6 },
      { x: cx - 90, y: cy + 100, s: 4 },
      { x: cx + 140, y: cy + 40, s: 5 }
    ];

    ctx.fillStyle = '#2e0854';
    stars.forEach((st) => {
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.restore();
}

// Generate high-resolution 4:5 texture for front of page
export function createPageTexture(pageIndex) {
  const width = 1024;
  const height = 1280; // 4:5 aspect ratio (1024/1280 = 0.8)

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const page = PAGE_DATA[pageIndex];

  // 1. Base gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, page.bgColor);
  bgGrad.addColorStop(1, page.gradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle luxury paper border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Inner fine border
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 44, width - 88, height - 88);

  // 3. Top Header / Page Index
  ctx.textAlign = 'left';
  ctx.fillStyle = page.accentColor;
  ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(`PAGE ${page.pageNumber} OF 03`, 80, 110);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('COLLECTION 2026', width - 80, 110);

  // Top header rule
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, 135);
  ctx.lineTo(width - 80, 135);
  ctx.stroke();

  // 4. Center Artwork Illustration
  const artCenterY = 510;
  drawArtwork(ctx, pageIndex, width / 2, artCenterY);

  // 5. Divider above caption section
  const captionTopY = 880;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(80, captionTopY);
  ctx.lineTo(width - 80, captionTopY);
  ctx.stroke();

  // Decorative accent pip on divider
  ctx.fillStyle = page.themeColor;
  ctx.beginPath();
  ctx.arc(width / 2, captionTopY, 6, 0, Math.PI * 2);
  ctx.fill();

  // 6. Caption Section with generous bottom spacing
  ctx.textAlign = 'center';

  // Subtitle badge
  ctx.fillStyle = page.accentColor;
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(page.subtitle.toUpperCase(), width / 2, captionTopY + 55);

  // Caption Title
  ctx.fillStyle = page.textColor;
  ctx.font = '800 46px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(page.title, width / 2, captionTopY + 120);

  // Caption Body Text (word wrapped)
  ctx.fillStyle = page.textColor;
  ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';

  const maxWidth = width - 200;
  const words = page.caption.split(' ');
  let line = '';
  let lineY = captionTopY + 180;
  const lineHeight = 38;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), width / 2, lineY);
      line = words[n] + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), width / 2, lineY);

  // NOTE: Generous space at the bottom of captions (from lineY ~ 1060 down to height 1280 = over 200px breathing room!)

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// Generate plain beige texture for turned page backsides
export function createPageBackTexture() {
  const width = 128;
  const height = 160;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Plain natural warm paper beige
  ctx.fillStyle = '#f3ebe1';
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
