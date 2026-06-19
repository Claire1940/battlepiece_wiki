"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * 视频区域组件：
 * - 使用 IntersectionObserver 监测进入视口时自动播放（autoplay=1&mute=1&loop=1）
 * - 同时保留点击播放按钮作为后备
 * - loop 需配合 playlist=videoId 才能在单视频上生效
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);

  const watchUrl = useMemo(
    () => `https://www.youtube.com/watch?v=${videoId}`,
    [videoId],
  );

  const thumbnailUrl = useMemo(
    () => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    [videoId],
  );

  const embedUrl = useMemo(
    () =>
      `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`,
    [videoId],
  );

  // 进入视口自动播放（仅触发一次）
  useEffect(() => {
    if (activated) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setActivated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActivated(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [activated]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {activated ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Play ${title}`}
            className="group absolute top-0 left-0 h-full w-full"
          >
            <img
              src={thumbnailUrl}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--nav-theme))] shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-white text-white" />
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
