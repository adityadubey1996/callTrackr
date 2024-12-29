import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

export default function MediaPlayer({ src, fileType }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const mediaRef = useRef(null);

  useEffect(() => {
    const media = mediaRef.current;

    const updateTime = () => {
      setCurrentTime(media.currentTime);
    };

    const setMediaDuration = () => {
      setDuration(media.duration);
    };

    if (media) {
      media.addEventListener("timeupdate", updateTime);
      media.addEventListener("loadedmetadata", setMediaDuration);
    }

    return () => {
      if (media) {
        media.removeEventListener("timeupdate", updateTime);
        media.removeEventListener("loadedmetadata", setMediaDuration);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="media-player">
      {fileType === "audio" ? (
        <audio ref={mediaRef} src={src} className="w-full" />
      ) : (
        <video ref={mediaRef} src={src} className="w-full" />
      )}
      <div className="controls mt-4 flex items-center justify-between">
        {/* Play/Pause Button */}
        <button onClick={handlePlayPause}>
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </button>

        {/* Time Controls */}
        <div className="time-controls flex items-center space-x-2">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="time-slider w-40"
          />
          <span className="text-sm">{formatTime(duration)}</span>
        </div>

        {/* Volume Controls */}
        <div className="volume-controls flex items-center space-x-2">
          <Volume2 className="h-5 w-5" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider w-24"
          />
        </div>
      </div>
    </div>
  );
}
