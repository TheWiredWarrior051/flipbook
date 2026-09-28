import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Music, SkipForward, SkipBack } from 'lucide-react';
import track1 from '../assets/music/Late-Night Groove.mp3';
import track2 from '../assets/music/Late-Night Groove2.mp3';

const PLAYLIST = [
  {
    id: 0,
    title: 'Late-Night Groove',
    src: track1
  },
  {
    id: 1,
    title: 'Late-Night Groove 2',
    src: track2
  }
];

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.5); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.5);

  const audioRef = useRef(null);
  const hasUserStartedRef = useRef(false);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    // Load initial track
    audio.src = PLAYLIST[0].src;

    // On track end: play next song in loop (0 -> 1 -> 0 -> 1...)
    const handleEnded = () => {
      setCurrentTrackIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % PLAYLIST.length;
        audio.src = PLAYLIST[nextIndex].src;
        audio.play().catch(() => {});
        return nextIndex;
      });
    };

    audio.addEventListener('ended', handleEnded);

    // Auto-start on first user interaction if browser blocked initial autoplay
    const handleFirstGesture = () => {
      if (!hasUserStartedRef.current && audio.paused) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            hasUserStartedRef.current = true;
          })
          .catch(() => {});
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);

    // Try initial playback immediately (works if allowed)
    audio.play()
      .then(() => {
        setIsPlaying(true);
        hasUserStartedRef.current = true;
      })
      .catch(() => {
        // Autoplay policy prevented; will start on first gesture
        setIsPlaying(false);
      });

    return () => {
      audio.removeEventListener('ended', handleEnded);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Sync volume & mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Toggle Play / Pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    hasUserStartedRef.current = true;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying]);

  // Next Track
  const playNextTrack = useCallback(() => {
    if (!audioRef.current) return;
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    audioRef.current.src = PLAYLIST[nextIndex].src;
    if (isPlaying || hasUserStartedRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [currentTrackIndex, isPlaying]);

  // Previous Track
  const playPrevTrack = useCallback(() => {
    if (!audioRef.current) return;
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
    audioRef.current.src = PLAYLIST[prevIndex].src;
    if (isPlaying || hasUserStartedRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [currentTrackIndex, isPlaying]);

  // Volume Change
  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(prevVolume || 0.5);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
    }
  };

  const currentTrack = PLAYLIST[currentTrackIndex];
  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <header className="top-audio-bar">
      <div className="audio-control-pill" onClick={(e) => e.stopPropagation()}>
        {/* Track Title & Animated Equalizer Icon */}
        <div className="audio-track-info" title={`Playing track ${currentTrackIndex + 1} of ${PLAYLIST.length}`}>
          <div className={`audio-icon-wrap ${isPlaying ? 'playing' : ''}`}>
            <Music size={15} />
            {isPlaying && (
              <span className="equalizer-bars">
                <span className="eq-bar bar-1"></span>
                <span className="eq-bar bar-2"></span>
                <span className="eq-bar bar-3"></span>
              </span>
            )}
          </div>
          <div className="track-text">
            <span className="track-title">{currentTrack.title}</span>
            <span className="track-loop-badge">Loop ({currentTrackIndex + 1}/2)</span>
          </div>
        </div>

        <div className="audio-divider"></div>

        {/* Playback Buttons: Prev, Play/Pause, Next */}
        <div className="playback-btns">
          <button
            className="audio-mini-btn"
            onClick={playPrevTrack}
            title="Previous song"
            aria-label="Previous song"
          >
            <SkipBack size={15} />
          </button>

          <button
            className={`audio-play-btn ${isPlaying ? 'active' : ''}`}
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause music' : 'Play music'}
            aria-label={isPlaying ? 'Pause music' : 'Play music'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
          </button>

          <button
            className="audio-mini-btn"
            onClick={playNextTrack}
            title="Next song"
            aria-label="Next song"
          >
            <SkipForward size={15} />
          </button>
        </div>

        <div className="audio-divider"></div>

        {/* Volume Control */}
        <div className="audio-volume-group">
          <button
            className="audio-vol-icon-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label="Toggle mute"
          >
            {effectiveVolume === 0 ? (
              <VolumeX size={16} />
            ) : effectiveVolume < 0.4 ? (
              <Volume1 size={16} />
            ) : (
              <Volume2 size={16} />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={effectiveVolume}
            onChange={handleVolumeChange}
            className="volume-slider"
            title={`Volume: ${Math.round(effectiveVolume * 100)}%`}
            aria-label="Volume slider"
          />

          <span className="volume-pct">{Math.round(effectiveVolume * 100)}%</span>
        </div>
      </div>
    </header>
  );
}
