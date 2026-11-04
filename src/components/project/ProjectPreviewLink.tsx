import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { selectProjectPreview } from "@/lib/project-preview";

interface ProjectPreviewLinkProps {
  project: Project;
  className: string;
  mediaClassName: string;
  imageAlt?: string;
  state?: LinkProps["state"];
  children: ReactNode;
}

export function ProjectPreviewArrow() {
  return (
    <span className="project-preview-arrow project-card-arrow" aria-hidden="true">
      <ArrowUpRight size={20} />
      <ArrowUpRight size={20} />
    </span>
  );
}

export default function ProjectPreviewLink({
  project,
  className,
  mediaClassName,
  imageAlt = "",
  state,
  children,
}: ProjectPreviewLinkProps) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  const preview = selectProjectPreview(project);
  const video = preview.video && !videoFailed ? preview.video : undefined;
  const image = !imageFailed ? preview.image : undefined;

  useEffect(() => {
    if (!hovered || reduceMotion) {
      setReady(false);
      if (!active) return;
      // Keep the current frame through the fade and brief pointer exits.
      const exit = window.setTimeout(() => setActive(false), reduceMotion ? 0 : 1200);
      return () => window.clearTimeout(exit);
    }
    if (active) return;
    const delay = window.setTimeout(() => setActive(true), 180);
    return () => window.clearTimeout(delay);
  }, [hovered, reduceMotion, active]);

  useEffect(() => {
    if (!active) {
      setMediaReady(false);
      return;
    }
    const hide = () => {
      if (document.hidden) setHovered(false);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setHovered(false);
    });
    if (link.current) observer.observe(link.current);
    document.addEventListener("visibilitychange", hide);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", hide);
    };
  }, [active]);

  useEffect(() => {
    if (!active || !hovered || !mediaReady || reduceMotion) return;
    let next = 0;
    // Give cached images an initial painted state before starting the reveal.
    const frame = requestAnimationFrame(() => {
      next = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(next);
    };
  }, [active, hovered, mediaReady, reduceMotion]);

  return (
    <Link
      ref={link}
      to={`/project/${project.id}`}
      state={state}
      className={`project-preview-link ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" &&
          window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
          setHovered(true);
        }
      }}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        className={`project-preview-media ${mediaClassName} ${active && ready ? "is-revealed" : ""}`}
        data-preview-state={ready ? "ready" : videoFailed || imageFailed ? "fallback" : active ? "loading" : "idle"}
      >
        <img className="project-preview-poster" src={project.image} alt={imageAlt} loading="lazy" draggable={false} />
        {active && (video || image) && (
          <div className="project-preview-reveal" aria-hidden="true">
            {video ? (
              <VideoPreview
                key={video}
                src={video}
                playing={hovered && !reduceMotion}
                onReady={() => setMediaReady(true)}
                onError={() => {
                  setReady(false);
                  setMediaReady(false);
                  setVideoFailed(true);
                }}
              />
            ) : (
              <img
                src={image}
                alt=""
                draggable={false}
                onLoad={() => setMediaReady(true)}
                onError={() => {
                  setReady(false);
                  setMediaReady(false);
                  setImageFailed(true);
                }}
              />
            )}
          </div>
        )}
        <span className="project-preview-cue" aria-hidden="true">
          <span>View project</span>
          <ArrowUpRight size={14} />
        </span>
      </div>
      {children}
    </Link>
  );
}

function VideoPreview({ src, playing, onReady, onError }: {
  src: string;
  playing: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const failed = useRef(onError);
  failed.current = onError;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!playing) {
      element.pause();
      return;
    }
    let cancelled = false;
    element.muted = true;
    void element.play().catch(() => {
      if (!cancelled && element.isConnected) failed.current();
    });
    return () => {
      cancelled = true;
      element.pause();
    };
  }, [src, playing]);
  return (
    <video
      ref={video}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      tabIndex={-1}
      disablePictureInPicture
      onPlaying={onReady}
      onError={onError}
    />
  );
}
