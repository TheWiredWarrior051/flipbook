import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, BookOpen, Sparkles } from 'lucide-react';
import introSlides from '../data/introSlides.json';
import { paperAudio } from '../utils/audio';

export default function IntroSlideshow({ onStartFlipbook }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = introSlides.length;
  const touchStartRef = useRef(null);

  const handleNext = () => {
    paperAudio.playPageTurn();
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onStartFlipbook();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      paperAudio.playPageTurn();
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 600) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const slide = introSlides[currentSlide];
  const isLast = currentSlide === totalSlides - 1;

  return (
    <div className="intro-slideshow-overlay">
      <div className="intro-card-wrap">
        <div
          className="intro-card"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Badge */}
          <div className="intro-card-header">
            <span className="intro-badge">
              <Heart size={13} className="heart-icon" />
              <span>A Note For You</span>
            </span>
            <span className="intro-step-counter">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>

          {/* Slide Title */}
          <h2 className="intro-title">{slide.title}</h2>

          {/* Slide Message Text */}
          <div className="intro-text-box">
            <p className="intro-paragraph">{slide.text}</p>
          </div>

          {/* Progress Indicator Dots */}
          <div className="intro-dots">
            {introSlides.map((_, idx) => (
              <button
                key={idx}
                className={`intro-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => {
                  paperAudio.playPageTurn();
                  setCurrentSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Footer Actions */}
          <div className="intro-card-footer">
            <button
              className={`intro-nav-btn ${currentSlide === 0 ? 'disabled' : ''}`}
              onClick={handlePrev}
              disabled={currentSlide === 0}
              aria-label="Previous slide"
            >
              <ChevronLeft size={18} />
              <span>Back</span>
            </button>

            {isLast ? (
              <button className="intro-start-btn" onClick={handleNext}>
                <BookOpen size={18} />
                <span>Open Flipbook</span>
                <Sparkles size={16} />
              </button>
            ) : (
              <button className="intro-next-btn" onClick={handleNext}>
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
