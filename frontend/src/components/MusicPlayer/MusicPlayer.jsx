// 🎵 YouTube Music Player Komponenti
import { useState, useEffect, useRef } from 'react';

function MusicPlayer({ playlist, currentIndex, onNext, onPrev, onSelectSong, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerContainerRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const lastVideoIdRef = useRef(null);
  const onNextRef = useRef(onNext); // ← onNext'i ref'te tut

  // onNext her değiştiğinde ref'i güncelle
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  const currentSong = playlist[currentIndex];

  const startProgressInterval = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      if (playerInstanceRef.current) {
        try {
          const cur = playerInstanceRef.current.getCurrentTime();
          const dur = playerInstanceRef.current.getDuration();
          if (!isNaN(cur)) setCurrentTime(cur);
          if (!isNaN(dur) && dur > 0) setDuration(dur);
        } catch (e) {}
      }
    }, 500);
  };

  const stopProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const loadVideo = (videoId) => {
    if (!playerInstanceRef.current) return;
    if (lastVideoIdRef.current === videoId) return;
    lastVideoIdRef.current = videoId;
    setCurrentTime(0);
    setDuration(0);
    try {
      playerInstanceRef.current.loadVideoById({ videoId, startSeconds: 0 });
      setIsPlaying(true);
      startProgressInterval();
    } catch (e) {
      console.error('loadVideoById hatası:', e);
    }
  };

  // YouTube IFrame API + player oluşturma (sadece bir kez)
  useEffect(() => {
    const initPlayer = (videoId) => {
      const container = playerContainerRef.current;
      if (!container || playerInstanceRef.current) return;

      const div = document.createElement('div');
      container.appendChild(div);

      playerInstanceRef.current = new window.YT.Player(div, {
        height: '0',
        width: '0',
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            lastVideoIdRef.current = videoId;
            event.target.playVideo();
            setIsPlaying(true);
            startProgressInterval();
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressInterval();
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressInterval();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              stopProgressInterval();
              setCurrentTime(0);
              onNextRef.current(); // ← ref üzerinden çağır, her zaman güncel
            }
          },
          onError: (event) => {
            console.error('YouTube Player hatası:', event.data);
          }
        }
      });
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    if (currentSong) {
      if (window.YT && window.YT.Player) {
        initPlayer(currentSong.id);
      } else {
        window.onYouTubeIframeAPIReady = () => initPlayer(currentSong.id);
      }
    }

    return () => stopProgressInterval();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Şarkı değiştiğinde videoyu yükle
  useEffect(() => {
    if (!currentSong) return;
    if (!playerInstanceRef.current) return;
    loadVideo(currentSong.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]);

  const togglePlay = () => {
    if (!playerInstanceRef.current) return;
    try {
      if (isPlaying) {
        playerInstanceRef.current.pauseVideo();
      } else {
        playerInstanceRef.current.playVideo();
      }
    } catch (error) {
      console.error('Play/Pause hatası:', error);
    }
  };

  const handleSeek = (e) => {
    if (!playerInstanceRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = ratio * duration;
    setCurrentTime(seekTime);
    try {
      playerInstanceRef.current.seekTo(seekTime, true);
    } catch (e) {}
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentSong) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">YouTube Music</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
        </div>
        <div className="p-8 text-center">
          <div className="text-4xl mb-3">🎵</div>
          <h3 className="text-gray-900 font-semibold mb-2">Playlist Boş</h3>
          <p className="text-gray-600 text-sm mb-4">Şarkı eklemek için aşağıdaki gibi yazın:</p>
          <div className="bg-gray-50 rounded-lg p-3 text-left space-y-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Örnek:</p>
              <p className="text-xs text-gray-700">
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">Sanatçı adı şarkı adı çal</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Örnek:</p>
              <p className="text-xs text-gray-700">
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">Sanatçı adı şarkı adı ekle</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">YouTube Music</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      {/* Current Song Card */}
      <div className="p-4">
        <div className="flex gap-3 items-start">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-16 h-16 rounded object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
              {currentSong.title}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {currentSong.artist} • {playlist.length} şarkı
            </p>

            {/* Mini Controls */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-full p-2"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={onNext}
                disabled={currentIndex === playlist.length - 1}
                className="text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 18h2V6h-2zm-11-7 8.5 6V6z"/>
                </svg>
              </button>

              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="ml-auto text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
              >
                📋 {playlist.length}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div
            className="relative h-1.5 bg-gray-200 rounded-full cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gray-900 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-1.5"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playlist */}
        {showPlaylist && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {playlist.map((song, index) => (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(index)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    index === currentIndex
                      ? 'bg-gray-100 border border-gray-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {index === currentIndex && isPlaying ? '🔊' : '🎵'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{song.title}</p>
                      <p className="text-xs text-gray-600 truncate">{song.artist}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hidden YouTube Player Container */}
      <div ref={playerContainerRef} style={{ display: 'none' }} />
    </div>
  );
}

export default MusicPlayer;