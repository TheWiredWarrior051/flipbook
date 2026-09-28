import { useState, useRef, useCallback, useEffect } from 'react';
import FlipBook3D from './components/FlipBook3D';
import NavigationControls from './components/NavigationControls';
import AudioPlayer from './components/AudioPlayer';
import IntroSlideshow from './components/IntroSlideshow';
import { FLIPBOOK_PAGES } from './utils/photoTextures';
import { paperAudio } from './utils/audio';
import { Mail } from 'lucide-react';
import './App.css';

export default function App() {
  const [showIntro, setShowIntro] = useState(true); // Intro slideshow shown first
  const [currentPage, setCurrentPage] = useState(0); // 0 to FLIPBOOK_PAGES.length - 1
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // normalized -1 to +1

  const totalPages = FLIPBOOK_PAGES.length;

  // Gesture tracking refs
  const touchStartRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Master Flip Functions
  const flipNext = useCallback(() => {
    if (showIntro) return;
    setCurrentPage((prev) => {
      if (prev < totalPages - 1) {
        paperAudio.playPageTurn();
        return prev + 1;
      }
      return prev;
    });
  }, [showIntro, totalPages]);

  const flipPrev = useCallback(() => {
    if (showIntro) return;
    setCurrentPage((prev) => {
      if (prev > 0) {
        paperAudio.playPageTurn();
        return prev - 1;
      }
      return prev;
    });
  }, [showIntro]);

  const flipTo = useCallback((pageIdx) => {
    if (showIntro) return;
    if (pageIdx !== currentPage) {
      paperAudio.playPageTurn();
      setCurrentPage(Math.max(0, Math.min(totalPages - 1, pageIdx)));
    }
  }, [showIntro, currentPage, totalPages]);

  // Handle pointer movement for reactive baby blue & pink gradient
  const handlePointerMove = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Normalized coords (-1 to 1) for 3D parallax
    const normX = (e.clientX / width) * 2 - 1;
    const normY = -(e.clientY / height) * 2 + 1;
    setMousePos({ x: normX, y: normY });

    // CSS variables for background radial gradient focal points
    const pctX = (e.clientX / width) * 100;
    const pctY = (e.clientY / height) * 100;

    const root = document.documentElement;
    root.style.setProperty('--mouse-x', `${pctX}%`);
    root.style.setProperty('--mouse-y', `${pctY}%`);
    root.style.setProperty('--mouse-invert-x', `${100 - pctX}%`);
    root.style.setProperty('--mouse-invert-y', `${100 - pctY}%`);
  };

  // Start touch or click gesture
  const handlePointerDown = (e) => {
    if (showIntro) return;
    // Ignore interactive UI controls (buttons, volume slider, audio pill)
    if (e.target.closest('button, input, .audio-control-pill, .bottom-nav-pill')) return;

    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    isDraggingRef.current = true;
  };

  // End gesture: evaluate swipe vs. left/right screen half click
  const handlePointerUp = (e) => {
    if (showIntro || !isDraggingRef.current || !touchStartRef.current) return;
    isDraggingRef.current = false;

    // Ignore interactive UI controls
    if (e.target.closest('button, input, .audio-control-pill, .bottom-nav-pill')) {
      touchStartRef.current = null;
      return;
    }

    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    touchStartRef.current = null;

    // 1. SWIPE GESTURE DETECTION (swiping in direction of swipe)
    if (absX > 40 && absX > absY && deltaTime < 800) {
      if (deltaX < 0) {
        // Swiped Left -> flip forward
        flipNext();
      } else {
        // Swiped Right -> flip backward
        flipPrev();
      }
      return;
    }

    // 2. PRESSING LEFT OR RIGHT SIDE OF SCREEN
    if (absX < 15 && absY < 15) {
      const screenMid = window.innerWidth / 2;
      if (e.clientX < screenMid) {
        // Clicked left side -> flip previous
        flipPrev();
      } else {
        // Clicked right side -> flip next
        flipNext();
      }
    }
  };

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showIntro) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        flipNext();
      } else if (e.key === 'ArrowLeft') {
        flipPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntro, flipNext, flipPrev]);

  return (
    <div
      className="flipbook-app"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Reactive Baby Blue & Baby Pink Gradient Background */}
      <div className="reactive-gradient-background">
        <div className="ambient-orb blue-orb"></div>
        <div className="ambient-orb pink-orb"></div>
        <div className="gradient-noise-layer"></div>
      </div>

      {/* Top Audio Player with Play/Pause & Volume Control */}
      <AudioPlayer />

      {/* Re-read Letter Button (when flipbook is open) */}
      {!showIntro && (
        <button
          className="reopen-intro-btn"
          onClick={() => {
            paperAudio.playPageTurn();
            setShowIntro(true);
          }}
          title="Re-read opening letter"
          aria-label="Re-read opening letter"
        >
          <Mail size={16} />
          <span>Letter</span>
        </button>
      )}

      {/* INTRO SLIDESHOW: Shown first before the flipbook */}
      {showIntro ? (
        <IntroSlideshow
          onStartFlipbook={() => {
            paperAudio.playPageTurn();
            setShowIntro(false);
          }}
        />
      ) : (
        <>
          {/* Screen Click-Zone Cues (Subtle hover guidance for left/right press) */}
          <div className="screen-zone-hints">
            <div className="zone-hint left-zone" title="Click left half to go back">
              <span className="zone-indicator">‹ Flip Left</span>
            </div>
            <div className="zone-hint right-zone" title="Click right half to go forward">
              <span className="zone-indicator">Flip Right ›</span>
            </div>
          </div>

          {/* 3D Flipbook WebGL Viewport */}
          <FlipBook3D
            currentPage={currentPage}
            onFlipNext={flipNext}
            onFlipPrev={flipPrev}
            mousePos={mousePos}
          />

          {/* Navigation Controls, Buttons & Bottom Pagination */}
          <NavigationControls
            currentPage={currentPage}
            onFlipNext={flipNext}
            onFlipPrev={flipPrev}
            onSelectPage={flipTo}
          />
        </>
      )}
    </div>
  );
}
