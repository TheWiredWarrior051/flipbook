import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { FLIPBOOK_PAGES, createPageTexture, createCaptionOverlayTexture, createPlainBeigeBackTexture } from '../utils/photoTextures';

export default function FlipBook3D({
  currentPage,
  onFlipNext,
  onFlipPrev,
  mousePos
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const bookGroupRef = useRef(null);
  const pagesRef = useRef([]);
  const videosRef = useRef([]);
  const lightBlueRef = useRef(null);
  const lightPinkRef = useRef(null);
  const animFrameRef = useRef(null);

  const totalPages = FLIPBOOK_PAGES.length;
  const pageAnglesRef = useRef(new Array(totalPages).fill(0));
  const currentAnglesRef = useRef(new Array(totalPages).fill(0));
  const pageSizeRef = useRef({ width: 2.8, height: 3.5 });

  // Update target angles and stacking order whenever currentPage changes
  useEffect(() => {
    // Pages before currentPage are flipped to -Math.PI; others stay flat at 0
    pageAnglesRef.current = FLIPBOOK_PAGES.map((_, i) => (i < currentPage ? -Math.PI : 0));

    // Update target baseZ stacking for right stack and left stack
    // Spacing increased forward so pages never clip behind each other
    if (pagesRef.current.length > 0) {
      pagesRef.current.forEach((pageObj, i) => {
        if (i >= currentPage) {
          // Right stack (active page at z=0, subsequent pages layered behind)
          pageObj.baseZ = -(i - currentPage) * 0.0055;
        } else {
          // Left stack (most recently turned page on top of left stack)
          pageObj.baseZ = -(currentPage - 1 - i) * 0.0055;
        }
      });
    }
  }, [currentPage]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 6.0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08; // Increased lighting exposure
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting (Increased by 2-5% as requested for luminous clarity)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.98); // Increased from 0.85
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.05); // Increased from 0.9
    dirLight.position.set(2, 6, 4.5);
    scene.add(dirLight);

    // Interactive Baby Blue & Pink Point Lights (Illumination boost)
    const pLightBlue = new THREE.PointLight('#a2d2ff', 2.3, 15, 1.2);
    pLightBlue.position.set(-4, 2, 3);
    scene.add(pLightBlue);
    lightBlueRef.current = pLightBlue;

    const pLightPink = new THREE.PointLight('#ffc8dd', 2.3, 15, 1.2);
    pLightPink.position.set(4, -2, 3);
    scene.add(pLightPink);
    lightPinkRef.current = pLightPink;

    // 5. Book Container Group
    const bookGroup = new THREE.Group();
    scene.add(bookGroup);
    bookGroupRef.current = bookGroup;

    // Function to calculate exact 4:5 plane size taking up 70% of screen
    const updateDimensions = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      // Compute visible viewport height at book distance (z=0)
      const vFov = (camera.fov * Math.PI) / 180;
      const visibleH = 2 * Math.tan(vFov / 2) * camera.position.z;
      const visibleW = visibleH * aspect;

      // 4:5 ratio plane taking up 70% of screen height
      let planeHeight = visibleH * 0.70;
      let planeWidth = planeHeight * 0.8; // 4/5 = 0.8

      // Adapt on mobile / narrow viewports
      if (planeWidth > visibleW * 0.82) {
        planeWidth = visibleW * 0.72;
        planeHeight = planeWidth / 0.8;
      }

      pageSizeRef.current = { width: planeWidth, height: planeHeight };

      // Update geometry of existing page meshes
      pagesRef.current.forEach((pageObj) => {
        pageObj.frontMesh.geometry.dispose();
        pageObj.backMesh.geometry.dispose();
        if (pageObj.overlayMesh) {
          pageObj.overlayMesh.geometry.dispose();
        }

        const newGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 16);
        newGeo.translate(planeWidth / 2, 0, 0); // Pivot on left spine edge

        pageObj.frontMesh.geometry = newGeo;
        pageObj.backMesh.geometry = newGeo.clone();
        if (pageObj.overlayMesh) {
          pageObj.overlayMesh.geometry = newGeo.clone();
        }

        pageObj.pivotGroup.position.set(-planeWidth / 2, 0, pageObj.baseZ);
      });
    };

    // 6. Build the Flipbook Pages (Front Cover + 27 Photos/Videos)
    const pages = [];
    const videos = [];
    const baseWidth = pageSizeRef.current.width;
    const baseHeight = pageSizeRef.current.height;
    const sharedBackTex = createPlainBeigeBackTexture();

    FLIPBOOK_PAGES.forEach((item, i) => {
      const pivotGroup = new THREE.Group();
      // Increased forward spacing so pages don't clip the page behind them
      const baseZ = -i * 0.0055;
      pivotGroup.position.set(-baseWidth / 2, 0, baseZ);

      // Geometry translated so local x=0 is the spine hinge
      const geo = new THREE.PlaneGeometry(baseWidth, baseHeight, 32, 16);
      geo.translate(baseWidth / 2, 0, 0);

      let frontMesh;
      let overlayMesh = null;
      let videoEl = null;

      if (item.type === 'video' && item.url) {
        // VIDEO PLANE (22.mp4 & 23.mp4)
        const video = document.createElement('video');
        video.src = item.url;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true; // muted so it doesn't conflict with background music
        video.playsInline = true;
        video.autoplay = true;
        video.play().catch(() => {});
        videoEl = video;
        videos.push(video);

        const videoTex = new THREE.VideoTexture(video);
        videoTex.colorSpace = THREE.SRGBColorSpace;
        videoTex.minFilter = THREE.LinearFilter;
        videoTex.magFilter = THREE.LinearFilter;

        const videoMat = new THREE.MeshStandardMaterial({
          map: videoTex,
          roughness: 0.35,
          metalness: 0.04,
          side: THREE.FrontSide
        });
        frontMesh = new THREE.Mesh(geo, videoMat);

        // Transparent Caption Overlay sitting just in front of the video plane
        const overlayTex = createCaptionOverlayTexture(item);
        const overlayMat = new THREE.MeshBasicMaterial({
          map: overlayTex,
          transparent: true,
          side: THREE.FrontSide,
          depthWrite: false
        });
        overlayMesh = new THREE.Mesh(geo.clone(), overlayMat);
        overlayMesh.position.z = 0.002;
        pivotGroup.add(overlayMesh);
      } else {
        // IMAGE PLANE (Front Cover & Photos 0-26)
        const frontTex = createPageTexture(item);
        const frontMat = new THREE.MeshStandardMaterial({
          map: frontTex,
          roughness: 0.35,
          metalness: 0.04,
          side: THREE.FrontSide
        });
        frontMesh = new THREE.Mesh(geo, frontMat);
      }

      // Back Face - Plain Beige Paper
      const backGeo = geo.clone();
      const backMat = new THREE.MeshStandardMaterial({
        color: '#f3ebe1',
        map: sharedBackTex,
        roughness: 0.65,
        metalness: 0.0,
        side: THREE.BackSide
      });
      const backMesh = new THREE.Mesh(backGeo, backMat);

      pivotGroup.add(frontMesh);
      pivotGroup.add(backMesh);
      bookGroup.add(pivotGroup);

      pages.push({
        pivotGroup,
        frontMesh,
        backMesh,
        overlayMesh,
        videoEl,
        baseZ,
        index: i
      });
    });
    pagesRef.current = pages;
    videosRef.current = videos;

    // Initial sizing
    updateDimensions();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(container);

    // 7. Render Loop with Smooth Spring Easing, Generous Lift & Paper Curl
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Interpolate angles & apply 3D page curl
      pagesRef.current.forEach((pageObj, idx) => {
        const targetAngle = pageAnglesRef.current[idx];
        const currentAngle = currentAnglesRef.current[idx];
        const diff = targetAngle - currentAngle;

        // Animate if moving
        if (Math.abs(diff) > 0.0005) {
          currentAnglesRef.current[idx] += diff * Math.min(delta * 7.5, 0.25);
          const angle = currentAnglesRef.current[idx];
          pageObj.pivotGroup.rotation.y = angle;

          // Generous Z forward elevation during flip so turning page never clips the pages behind it
          const lift = Math.sin(-angle) * 0.58;
          pageObj.pivotGroup.position.z = pageObj.baseZ + Math.max(0, lift);

          // Realistic Page Curl along turning leaf
          const geo = pageObj.frontMesh.geometry;
          const posAttr = geo.attributes.position;
          const width = pageSizeRef.current.width;

          const turnProgress = Math.abs(angle / Math.PI); // 0 to 1
          const bendIntensity = Math.sin(turnProgress * Math.PI) * 0.28;

          for (let v = 0; v < posAttr.count; v++) {
            const vx = posAttr.getX(v);
            const origXRatio = vx / width; // 0 at spine, 1 at free edge
            const curlZ = Math.pow(origXRatio, 1.8) * bendIntensity;
            posAttr.setZ(v, curlZ);
          }
          posAttr.needsUpdate = true;

          // Sync overlay curl if video page
          if (pageObj.overlayMesh) {
            const overPosAttr = pageObj.overlayMesh.geometry.attributes.position;
            for (let v = 0; v < overPosAttr.count; v++) {
              const vx = overPosAttr.getX(v);
              const origXRatio = vx / width;
              const curlZ = Math.pow(origXRatio, 1.8) * bendIntensity;
              overPosAttr.setZ(v, curlZ);
            }
            overPosAttr.needsUpdate = true;
          }
        } else if (currentAngle !== targetAngle) {
          // Snap to exact target when almost done
          currentAnglesRef.current[idx] = targetAngle;
          pageObj.pivotGroup.rotation.y = targetAngle;
          pageObj.pivotGroup.position.z = pageObj.baseZ;

          // Reset vertex displacement to completely flat
          const geo = pageObj.frontMesh.geometry;
          const posAttr = geo.attributes.position;
          for (let v = 0; v < posAttr.count; v++) {
            posAttr.setZ(v, 0);
          }
          posAttr.needsUpdate = true;

          if (pageObj.overlayMesh) {
            const overPosAttr = pageObj.overlayMesh.geometry.attributes.position;
            for (let v = 0; v < overPosAttr.count; v++) {
              overPosAttr.setZ(v, 0);
            }
            overPosAttr.needsUpdate = true;
          }
        } else {
          // Keep baseZ updated for stack ordering
          pageObj.pivotGroup.position.z = pageObj.baseZ;
        }
      });

      // Subtle mouse-reactive parallax tilt
      if (mousePos && bookGroupRef.current) {
        const targetRotY = mousePos.x * 0.07;
        const targetRotX = -mousePos.y * 0.07;
        bookGroupRef.current.rotation.y += (targetRotY - bookGroupRef.current.rotation.y) * 0.06;
        bookGroupRef.current.rotation.x += (targetRotX - bookGroupRef.current.rotation.x) * 0.06;

        // Shift baby blue & pink point lights
        if (lightBlueRef.current) {
          lightBlueRef.current.position.x = -4 + mousePos.x * 2;
          lightBlueRef.current.position.y = 2 + mousePos.y * 2;
        }
        if (lightPinkRef.current) {
          lightPinkRef.current.position.x = 4 + mousePos.x * 2;
          lightPinkRef.current.position.y = -2 + mousePos.y * 2;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();

      videosRef.current.forEach((v) => {
        v.pause();
        v.src = '';
      });

      pages.forEach((p) => {
        p.frontMesh.geometry.dispose();
        p.backMesh.geometry.dispose();
        p.frontMesh.material.dispose();
        p.backMesh.material.dispose();
        if (p.overlayMesh) {
          p.overlayMesh.geometry.dispose();
          p.overlayMesh.material.dispose();
        }
      });
      sharedBackTex.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="flipbook-canvas-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none'
      }}
    />
  );
}
