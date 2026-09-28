import * as THREE from 'three';
import flipbookData from '../data/flipbookData.json';

// Import all photo, video, and cover assets from src/assets/Photos
const photoModules = import.meta.glob('../assets/Photos/*.{jpg,jpeg,png,mp4}', { eager: true, import: 'default' });

// Build complete flipbook page list: Front Cover -> 27 Photos/Videos (0 through 26)
// NOTE: Backpage removed as requested
export const FLIPBOOK_PAGES = [
  // 1. Front Cover
  {
    id: 'front_cover',
    type: 'cover',
    coverType: 'front',
    label: 'Front Cover',
    image: 'front_cover.png',
    url: photoModules['../assets/Photos/front_cover.png'] || '',
    caption: ''
  },
  // 2. Interior Photo & Video Pages (0 through 26)
  ...flipbookData.map((item, idx) => ({
    ...item,
    photoIndex: idx,
    totalPhotos: flipbookData.length,
    label: `Page ${String(idx + 1).padStart(2, '0')}`,
    url: photoModules[`../assets/Photos/${item.image}`] || ''
  }))
];

// Helper to create high-res transparent caption overlay texture for videos & photos
export function createCaptionOverlayTexture(pageItem) {
  const width = 1024;
  const height = 1280; // 4:5 ratio

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);

  // 1. Soft dark gradient scrim at the bottom
  const scrimHeight = 380;
  const scrimStartY = height - scrimHeight;
  const scrim = ctx.createLinearGradient(0, scrimStartY, 0, height);
  scrim.addColorStop(0, 'rgba(10, 8, 14, 0)');
  scrim.addColorStop(0.3, 'rgba(10, 8, 14, 0.45)');
  scrim.addColorStop(0.7, 'rgba(10, 8, 14, 0.84)');
  scrim.addColorStop(1, 'rgba(6, 4, 10, 0.96)');

  ctx.fillStyle = scrim;
  ctx.fillRect(0, scrimStartY, width, scrimHeight);

  // 2. Page Number Badge
  const padIndex = String(pageItem.photoIndex + 1).padStart(2, '0');
  const padTotal = String(pageItem.totalPhotos).padStart(2, '0');

  ctx.textAlign = 'left';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText(`PAGE ${padIndex} / ${padTotal}`, 70, height - 210);

  // 3. Caption at the bottom of the plane
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  const maxTextWidth = width - 140;
  const words = (pageItem.caption || '').split(' ');
  let line = '';
  let lineY = height - 160;
  const lineHeight = 42;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTextWidth && n > 0) {
      ctx.fillText(line.trim(), 70, lineY);
      line = words[n] + ' ';
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 70, lineY);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Create high-res 4:5 texture for an image page (Cover or Photo with Caption)
export function createPageTexture(pageItem, onUpdate) {
  const width = 1024;
  const height = 1280; // 4:5 ratio

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Placeholder while loading
  ctx.fillStyle = pageItem.type === 'cover' ? '#242028' : '#181a20';
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const renderContent = (img) => {
    const targetRatio = width / height; // 0.8
    const imgRatio = img.width / img.height;
    let sW, sH, sX, sY;

    if (Math.abs(imgRatio - targetRatio) < 0.02) {
      ctx.drawImage(img, 0, 0, width, height);
    } else if (imgRatio > targetRatio) {
      sH = img.height;
      sW = img.height * targetRatio;
      sX = (img.width - sW) / 2;
      sY = 0;
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, width, height);
    } else {
      sW = img.width;
      sH = img.width / targetRatio;
      sX = 0;
      sY = (img.height - sH) / 2;
      ctx.drawImage(img, sX, sY, sW, sH, 0, 0, width, height);
    }

    // Interior photo pages get bottom caption
    if (pageItem.type !== 'cover' && pageItem.caption) {
      const scrimHeight = 380;
      const scrimStartY = height - scrimHeight;
      const scrim = ctx.createLinearGradient(0, scrimStartY, 0, height);
      scrim.addColorStop(0, 'rgba(10, 8, 14, 0)');
      scrim.addColorStop(0.3, 'rgba(10, 8, 14, 0.45)');
      scrim.addColorStop(0.7, 'rgba(10, 8, 14, 0.84)');
      scrim.addColorStop(1, 'rgba(6, 4, 10, 0.96)');

      ctx.fillStyle = scrim;
      ctx.fillRect(0, scrimStartY, width, scrimHeight);

      const padIndex = String(pageItem.photoIndex + 1).padStart(2, '0');
      const padTotal = String(pageItem.totalPhotos).padStart(2, '0');

      ctx.textAlign = 'left';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(`PAGE ${padIndex} / ${padTotal}`, 70, height - 210);

      ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      const maxTextWidth = width - 140;
      const words = pageItem.caption.split(' ');
      let line = '';
      let lineY = height - 160;
      const lineHeight = 42;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxTextWidth && n > 0) {
          ctx.fillText(line.trim(), 70, lineY);
          line = words[n] + ' ';
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 70, lineY);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    texture.needsUpdate = true;
    if (onUpdate) onUpdate();
  };

  if (pageItem.url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => renderContent(img);
    img.src = pageItem.url;
  }

  return texture;
}

// Plain warm beige texture for turned page backsides
export function createPlainBeigeBackTexture() {
  const width = 128;
  const height = 160;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Solid warm matte paper beige
  ctx.fillStyle = '#f3ebe1';
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
