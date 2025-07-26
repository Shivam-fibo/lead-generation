import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Download, Loader2, AlertCircle } from 'lucide-react';

interface ModernAudioPlayerProps {
  src: string;
  recordingId?: string;
  createdAt: string;
  className?: string;
}

interface CallRecordingCardProps {
  selectedLead: {
    call_recording?: {
      audio_r2_url?: string;
      elevenlabs_conversation_id?: string;
      createdAt?: string;
    };
  };
}

const ModernAudioPlayer: React.FC<ModernAudioPlayerProps> = ({ 
  src, 
  recordingId, 
  createdAt, 
  className = "" 
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadStart = (): void => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleLoadedData = (): void => {
      setIsLoading(false);
      setDuration(audio.duration);
    };

    const handleError = (): void => {
      setIsLoading(false);
      setHasError(true);
    };

    const handleTimeUpdate = (): void => {
      setCurrentTime(audio.currentTime);
    };

    const handleProgress = (): void => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
          setLoadProgress((bufferedEnd / duration) * 100);
        }
      }
    };

    const handleEnded = (): void => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('error', handleError);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = (): void => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        setHasError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent: number = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className={`rounded-lg border border-destructive/20 bg-destructive/5 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-destructive/10 p-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Failed to load audio</p>
            <p className="text-xs text-muted-foreground mt-1">
              The recording could not be loaded. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
      />

      {/* Audio Player UI */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        {isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Loading audio...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Preparing your call recording
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Loaded State */
          <>
            {/* Main Controls */}
            <div className="flex items-center gap-4">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors p-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={hasError}
                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>

              {/* Progress Section */}
              <div className="flex-1 space-y-2">
                {/* Time Display */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">{formatTime(currentTime)}</span>
                  <span className="tabular-nums">{formatTime(duration)}</span>
                </div>

                {/* Progress Bar */}
                <div 
                  ref={progressRef}
                  className="relative h-2 bg-secondary rounded-full cursor-pointer group"
                  onClick={handleSeek}
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={duration}
                  aria-valuenow={currentTime}
                  aria-label="Audio progress"
                >
                  {/* Buffer Progress */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-secondary-foreground/20 rounded-full transition-all duration-300"
                    style={{ width: `${loadProgress}%` }}
                  />
                  
                  {/* Play Progress */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                  />
                  
                  {/* Progress Handle */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-2"
                    style={{ left: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-secondary rounded-full appearance-none cursor-pointer slider"
                  aria-label="Volume control"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recording Info */}
      {/* <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
        <div className="flex items-center gap-4">
          <span>
            <span className="font-medium">ID:</span> {recordingId || "N/A"}
          </span>
          <span>
            <span className="font-medium">Created:</span> {createdAt}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">ElevenLabs Recording</span>
        </div>
      </div> */}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

// Updated Card Content Component with TypeScript
const CallRecordingCard: React.FC<CallRecordingCardProps> = ({ selectedLead }) => {
  const formatCreatedAt = (createdAt?: string): string => {
    if (!createdAt) return "-";
    
    try {
      return new Date(createdAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "-";
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-4 pb-3">
        <h3 className="text-md font-semibold leading-none tracking-tight">
          CALL RECORDING
        </h3>
      </div>
      <div className="p-4 pt-0 space-y-4">
        {selectedLead?.call_recording?.audio_r2_url ? (
          <ModernAudioPlayer
            src={selectedLead.call_recording.audio_r2_url}
            recordingId={selectedLead.call_recording.elevenlabs_conversation_id}
            createdAt={formatCreatedAt(selectedLead.call_recording.createdAt)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Volume2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No call recording available
            </p>
            {/* <p className="text-xs text-muted-foreground mt-1">
              Recording will appear here after the call is completed
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
};

export { ModernAudioPlayer, CallRecordingCard };
export default ModernAudioPlayer;