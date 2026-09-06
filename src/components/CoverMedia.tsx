"use client";
/* eslint-disable @next/next/no-img-element -- brand-supplied URLs, next/image needs an allow-list */
/**
 * Renders a brand's cover: an autoplay-muted-loop <video> when cover_video is
 * a plain MP4 URL, an iframe embed for YouTube or Vimeo links, or the plain
 * cover image (via <Placeholder>) otherwise. Falls back to the cover image on
 * video error so a broken link never leaves a blank frame.
 */
import { useState } from "react";
import { Placeholder } from "./ui";

type Props = {
  cover?: string;
  coverVideo?: string;
  alt: string;
  className?: string;
};

const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/i;

function embedUrl(url: string): string | null {
  const yt = url.match(YT_RE);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${yt[1]}`;
  const vi = url.match(VIMEO_RE);
  if (vi) return `https://player.vimeo.com/video/${vi[1]}?autoplay=1&muted=1&loop=1&background=1`;
  return null;
}

export default function CoverMedia({ cover, coverVideo, alt, className }: Props) {
  const [videoBroken, setVideoBroken] = useState(false);

  if (coverVideo && !videoBroken) {
    const embed = embedUrl(coverVideo);
    if (embed) {
      return (
        <div className={className}>
          <iframe
            src={embed}
            title={alt}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onError={() => setVideoBroken(true)}
          />
        </div>
      );
    }
    return (
      <video
        className={className}
        autoPlay
        muted
        loop
        playsInline
        poster={cover}
        onError={() => setVideoBroken(true)}
        aria-label={alt}
      >
        <source src={coverVideo} />
      </video>
    );
  }

  return <Placeholder src={cover} alt={alt} label="Brand cover · 16:9" wide className={className} />;
}
