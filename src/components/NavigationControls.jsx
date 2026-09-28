import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { FLIPBOOK_PAGES } from '../utils/photoTextures';
import { paperAudio } from '../utils/audio';

export default function NavigationControls({
  currentPage,
  onFlipNext,
  onFlipPrev
}) {
  const totalPages = FLIPBOOK_PAGES.length;
  const activePage = FLIPBOOK_PAGES[currentPage] || FLIPBOOK_PAGES[0];

  return (
    <footer className="bottom-nav-container">
      <div className="bottom-nav-pill" onClick={(e) => e.stopPropagation()}>
        {/* Left Flip Button */}
        <button
          className={`nav-flip-btn ${currentPage === 0 ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (currentPage > 0) {
              paperAudio.playPageTurn();
              onFlipPrev();
            }
          }}
          disabled={currentPage === 0}
          aria-label="Previous Page"
          title={currentPage === 0 ? 'At front cover' : 'Flip to previous page'}
        >
          <ChevronLeft size={18} />
          <span className="nav-btn-text">Prev</span>
        </button>

        <div className="nav-divider"></div>

        {/* Central Page Counter & Progress Track */}
        <div className="nav-page-indicator">
          <span className="nav-page-counter">
            {activePage.type === 'cover' ? (
              <span className="cover-badge">
                <BookOpen size={13} style={{ marginRight: 4 }} />
                {activePage.coverType === 'front' ? 'Front Cover' : 'Back Cover'}
              </span>
            ) : (
              <>
                <strong className="current-page-num">
                  {String(activePage.photoIndex + 1).padStart(2, '0')}
                </strong>
                <span className="page-slash">/</span>
                <span className="total-pages-num">
                  {String(activePage.totalPhotos).padStart(2, '0')}
                </span>
              </>
            )}
          </span>

          {/* Mini Scrubber Track */}
          <div className="mini-progress-track">
            <div
              className="mini-progress-fill"
              style={{
                width: `${totalPages > 1 ? (currentPage / (totalPages - 1)) * 100 : 0}%`
              }}
            ></div>
          </div>
        </div>

        <div className="nav-divider"></div>

        {/* Right Flip Button */}
        <button
          className={`nav-flip-btn ${currentPage === totalPages - 1 ? 'disabled' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (currentPage < totalPages - 1) {
              paperAudio.playPageTurn();
              onFlipNext();
            }
          }}
          disabled={currentPage === totalPages - 1}
          aria-label="Next Page"
          title={currentPage === totalPages - 1 ? 'At back cover' : 'Flip to next page'}
        >
          <span className="nav-btn-text">
            {currentPage === 0 ? 'Open' : currentPage === totalPages - 2 ? 'End' : 'Next'}
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </footer>
  );
}
