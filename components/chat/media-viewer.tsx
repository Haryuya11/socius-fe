"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  X,
  Download,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/use-chat-store";
import { isMediaFile } from "@/utils/file-utils";

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
};

const CustomVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    const setVideoData = () => setDuration(video.duration);
    const handleEnd = () => setIsPlaying(false);
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", setVideoData);
    video.addEventListener("ended", handleEnd);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("loadedmetadata", setVideoData);
      video.removeEventListener("ended", handleEnd);
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const manualChange = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime =
        (videoRef.current.duration / 100) * manualChange;
      setProgress(manualChange);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      if (!newMutedState && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full h-full flex items-center justify-center bg-black group overflow-hidden"
    >
      <div
        className="w-full h-full relative flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          autoPlay
          onPlay={() => setIsPlaying(true)}
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        )}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 via-black/50 to-transparent px-6 py-4 transition-opacity duration-300 z-20",
            isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          )}
        >
          <input
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleSeek}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer mb-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
          />
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="hover:text-primary transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current" />
                )}
              </button>
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="hover:text-primary transition-colors w-6"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-6 w-6" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-6 w-6" />
                  ) : (
                    <Volume2 className="h-6 w-6" />
                  )}
                </button>
                <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 ease-out flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>
              <span className="text-sm font-medium select-none">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="hover:text-primary transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="h-6 w-6" />
              ) : (
                <Maximize className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  type: "image" | "video";
  fileName: string;
}

export function MediaViewer({
  isOpen,
  onClose,
  url: initialUrl,
  fileName: initialName,
}: MediaViewerProps) {
  const { messages } = useChatStore();

  // 1. Data Logic (Giữ nguyên)
  const mediaList = useMemo(() => {
    const list: {
      url: string;
      type: "image" | "video";
      name: string;
      id: string;
    }[] = [];
    [...messages].reverse().forEach((msg) => {
      if (msg.metadata && msg.metadata.length > 0) {
        msg.metadata.forEach((meta) => {
          if (isMediaFile(meta.mimeType)) {
            list.push({
              url: meta.fileUrl,
              type: meta.mimeType.startsWith("video/") ? "video" : "image",
              name: meta.fileName,
              id: meta.fileUrl,
            });
          }
        });
      }
    });
    return list;
  }, [messages]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen && initialUrl) {
      const idx = mediaList.findIndex((item) => item.url === initialUrl);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [isOpen, initialUrl, mediaList]);

  const thumbnailsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[
        currentIndex
      ] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  const currentItem = mediaList[currentIndex] || {
    url: initialUrl,
    type: "image",
    name: initialName,
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentItem.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = currentItem.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (currentIndex < mediaList.length - 1)
      setCurrentIndex((prev) => prev + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-screen h-screen max-w-none! m-0 p-0 bg-black/95 border-none shadow-none flex flex-col outline-none overflow-hidden"
        showCloseButton={false}
        onDragStart={(e) => e.stopPropagation()}
        onDragOver={(e) => e.stopPropagation()}
        onDrop={(e) => e.stopPropagation()}
      >
        <VisuallyHidden>
          <DialogTitle>{currentItem.name}</DialogTitle>
        </VisuallyHidden>

        <div
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-linear-to-b from-black/80 to-transparent"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col pl-2">
            <span className="text-white font-medium truncate max-w-[300px] select-text">
              {currentItem.name}
            </span>
            {mediaList.length > 0 && (
              <span className="text-xs text-white/60">
                {currentIndex + 1} / {mediaList.length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="rounded-full text-white hover:bg-white/20"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div
          className="flex-1 w-full h-[calc(100vh-100px)] relative flex items-center justify-center overflow-hidden cursor-default"
          onClick={onClose}
        >
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 rounded-full bg-black/20 hover:bg-black/50 text-white h-12 w-12 hidden md:flex"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {currentIndex < mediaList.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 rounded-full bg-black/20 hover:bg-black/50 text-white h-12 w-12 hidden md:flex"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {currentItem.type === "image" ? (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/50 backdrop-blur-md rounded-full p-2 border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => zoomOut()}
                      className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => resetTransform()}
                      className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                      title="Reset"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => zoomIn()}
                      className="text-white hover:bg-white/20 rounded-full h-8 w-8"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>

                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentItem.url}
                      alt={currentItem.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        objectFit: "contain",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CustomVideoPlayer src={currentItem.url} />
            </div>
          )}
        </div>

        {mediaList.length > 1 && (
          <div
            className="h-20 shrink-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={thumbnailsRef}
              className="flex gap-2 px-4 overflow-x-auto w-full max-w-4xl no-scrollbar items-center justify-start md:justify-center h-full"
            >
              {mediaList.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "relative h-14 w-14 shrink-0 rounded-md overflow-hidden transition-all duration-200 border-2",
                      isActive
                        ? "border-primary scale-110 opacity-100"
                        : "border-transparent opacity-50 hover:opacity-80",
                    )}
                  >
                    {item.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt="thumb"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-800 flex items-center justify-center">
                        <Play className="h-5 w-5 text-white/70" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
