import React, { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
    src: string;
    poster: string;
}

// --- SVG Icons for Controls ---

const PlayIcon = ({ className = 'w-16 h-16' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = ({ className = 'w-8 h-8' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm9 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

const VolumeUpIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 12c0-1.455-.653-2.775-1.7-3.718v7.436c1.047-.943 1.7-2.263 1.7-3.718z" />
    </svg>
);

const VolumeOffIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 12c0-1.455-.653-2.775-1.7-3.718v7.436c1.047-.943 1.7-2.263 1.7-3.718zm-6.255 8.35a.75.75 0 001.06-1.06l-9-9a.75.75 0 00-1.06 1.06l9 9z" />
    </svg>
);


export const VideoPlayer = ({ src, poster }: VideoPlayerProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isControlsVisible, setIsControlsVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsTimeoutRef = useRef<number | null>(null);

    // --- Playback Controls ---
    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused || videoRef.current.ended) {
            videoRef.current.play().catch(() => setError("Video playback failed."));
        } else {
            videoRef.current.pause();
        }
    };
    
    // --- Seek/Progress Controls ---
    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(currentProgress);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const seekTime = (e.nativeEvent.offsetX / e.currentTarget.offsetWidth) * duration;
        videoRef.current.currentTime = seekTime;
    };
    
    // --- Volume Controls ---
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        if (videoRef.current) videoRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0) setIsMuted(false);
    };
    
    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    // --- Metadata and Formatting ---
    const handleLoadedMetadata = () => {
        if (videoRef.current) setDuration(videoRef.current.duration);
    };

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // --- Controls Visibility ---
    const showControls = () => {
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        setIsControlsVisible(true);
    };
    
    const hideControls = () => {
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) setIsControlsVisible(false);
        }, 3000);
    };

    useEffect(() => {
        // Show controls when playback state changes
        if (!isPlaying) showControls();
        else hideControls();
        
        return () => { // Cleanup timeout on unmount
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, [isPlaying]);

    const hasStarted = progress > 0;
    const shouldShowControls = isControlsVisible || !isPlaying;

    return (
        <div 
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg border border-gray-200"
            onMouseMove={showControls}
            onMouseLeave={hideControls}
            aria-label="Video Player"
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-cover"
                onClick={togglePlayPause}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={() => setError("This video could not be loaded.")}
                playsInline
            />
            
            {/* Initial Play Overlay & Error Message */}
            {!hasStarted && (
                <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    onClick={togglePlayPause}
                >
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
                    <div className="relative text-white z-10">
                        {error ? (
                             <p className="text-red-400 bg-black/50 p-3 rounded-lg font-semibold">{error}</p>
                        ) : (
                             <button 
                                className="bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-4 transition-all duration-300 transform group-hover:scale-110"
                                aria-label="Play video tour"
                            >
                                <PlayIcon />
                            </button>
                        )}
                    </div>
                </div>
            )}

             {/* Custom Controls Overlay */}
             <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transition-opacity duration-300 ${shouldShowControls && hasStarted ? 'opacity-100' : 'opacity-0'}`}>
                {/* Seek Bar */}
                <div 
                    className="w-full h-1.5 bg-white/30 cursor-pointer group mb-2" 
                    onClick={handleSeek}
                    role="slider"
                    aria-label="Video progress bar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                >
                    <div className="relative h-full">
                        <div style={{ width: `${progress}%` }} className="h-full bg-secondary transition-all duration-100"></div>
                        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${progress}% - 8px)` }}></div>
                    </div>
                </div>

                {/* Bottom Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlayPause} aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <PauseIcon /> : <PlayIcon className="w-8 h-8"/>}
                        </button>
                        <div className="flex items-center gap-2 group">
                            <button onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                                {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-0 group-hover:w-24 transition-all duration-300 h-1.5 accent-white"
                                aria-label="Volume control"
                            />
                        </div>
                    </div>
                    <div className="font-mono text-sm">
                        <span>{formatTime(videoRef.current?.currentTime ?? 0)}</span> / <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
