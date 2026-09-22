import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  Bone,
  CircleDot,
  Dog,
  Heart,
  Pause,
  PawPrint,
  Play,
  SmilePlus,
} from "lucide-react";
import {
  isTreatOverDog,
  nextPuppyDestination,
  puppyBounds,
  shouldOfferTreat,
  treatLanding,
  treatOfferDuration,
} from "@/lib/puppy-interactions";
import { puppyMessages } from "@/data/puppy-messages";

const {
  pets: messages,
  familiar: specialMessages,
  treats: boneMessages,
  fed: happyMessages,
} = puppyMessages;
const pick = <T,>(items: T[]) =>
  items[Math.floor(Math.random() * items.length)];

export default function PetDog({
  showWelcomeBack = false,
}: {
  showWelcomeBack?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const dog = useRef<HTMLButtonElement>(null);
  const treat = useRef<HTMLButtonElement>(null);
  const falling = useRef<ReturnType<typeof animate>[]>([]);
  const landing = useRef<{ x: number; y: number }>();
  const messageTimer = useRef<ReturnType<typeof setTimeout>>();
  const [runwayWidth, setRunwayWidth] = useState(0);
  const movement = useRef<ReturnType<typeof animate>>();
  const seen = useRef(new Set<string>());
  const clicks = useRef(0);
  const dragging = useRef(false);
  const x = useMotionValue(0);
  const boneX = useMotionValue(0);
  const boneY = useMotionValue(0);
  const boneRotation = useMotionValue(0);
  const ballX = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");
  const [showBone, setShowBone] = useState(false);
  const [happy, setHappy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [roaming, setRoaming] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [overDog, setOverDog] = useState(false);
  const [celebration, setCelebration] = useState(0);
  const stopFall = useCallback(() => {
    falling.current.forEach((animation) => animation.stop());
    falling.current = [];
    landing.current = undefined;
  }, []);
  useEffect(() => {
    if ((paused || reduceMotion) && landing.current) {
      const target = landing.current;
      stopFall();
      boneX.set(target.x);
      boneY.set(target.y);
      boneRotation.set(0);
    }
  }, [paused, reduceMotion, stopFall, boneX, boneY, boneRotation]);
  useEffect(() => {
    if (!showBone) stopFall();
    return stopFall;
  }, [showBone, stopFall]);
  const display = useCallback((text: string) => {
    setMessage(text);
    seen.current.add(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => {
      setMessage("");
      setHappy(false);
    }, 4500);
  }, []);
  useEffect(() => {
    if (!container.current) return;
    let measuredWidth = 0;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (width === measuredWidth) return;
      measuredWidth = width;
      setRunwayWidth(width);
      movement.current?.stop();
      stopFall();
      boneX.set(0);
      boneY.set(0);
      boneRotation.set(0);
      setPlaying(false);
      const { left, right } = puppyBounds(width);
      x.set(Math.max(left, Math.min(x.get() || width * 0.36, right)));
    });
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      movement.current?.stop();
      clearTimeout(messageTimer.current);
    };
  }, [x, stopFall, boneX, boneY, boneRotation]);
  useEffect(() => {
    if (showWelcomeBack) display(puppyMessages.welcomeBack);
  }, [showWelcomeBack, display]);
  useEffect(() => {
    if (
      !runwayWidth ||
      reduceMotion ||
      paused ||
      message ||
      showBone ||
      playing
    )
      return;
    let timer: ReturnType<typeof setTimeout>;
    let walking: ReturnType<typeof animate> | undefined;
    let cancelled = false;
    const wander = () => {
      if (cancelled) return;
      const next = nextPuppyDestination(x.get(), runwayWidth, Math.random());
      setDirection(next >= x.get() ? 1 : -1);
      setRoaming(true);
      walking = animate(x, next, {
        duration: Math.min(4, Math.max(0.85, Math.abs(x.get() - next) / 80)),
        ease: "easeInOut",
        onComplete: () => {
          if (cancelled) return;
          setRoaming(false);
          timer = setTimeout(wander, 1600 + Math.random() * 900);
        },
      });
      movement.current = walking;
    };
    timer = setTimeout(wander, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      walking?.stop();
      setRoaming(false);
    };
  }, [runwayWidth, reduceMotion, paused, message, showBone, playing, x]);
  useEffect(() => {
    if (!showBone || isDragging) return;
    const timer = setTimeout(() => {
      setShowBone(false);
      setMessage("");
      setOverDog(false);
    }, treatOfferDuration);
    return () => clearTimeout(timer);
  }, [showBone, isDragging]);
  useEffect(() => {
    if (!playing) return;
    if (reduceMotion || paused) {
      setPlaying(false);
      return;
    }
    const next = ballX.get() - 24;
    movement.current = animate(x, next, {
      duration: Math.min(2.2, Math.max(0.7, Math.abs(x.get() - next) / 110)),
      ease: "easeInOut",
      onComplete: () => {
        setPlaying(false);
        setHappy(true);
        setCelebration((count) => count + 1);
        display(puppyMessages.fetched);
      },
    });
    return () => movement.current?.stop();
  }, [playing, reduceMotion, paused, ballX, x, display]);
  const playFetch = () => {
    movement.current?.stop();
    setShowBone(false);
    setMessage("");
    clearTimeout(messageTimer.current);
    const { left, right } = puppyBounds(runwayWidth);
    const next = x.get() < (left + right) / 2 ? right : left;
    ballX.set(next + 24);
    if (reduceMotion || paused) {
      x.set(next);
      setHappy(true);
      setCelebration((count) => count + 1);
      display(puppyMessages.fetchedWhilePaused);
    } else setPlaying(true);
  };
  const pet = () => {
    movement.current?.stop();
    setPlaying(false);
    clicks.current += 1;
    if (showBone || shouldOfferTreat(clicks.current)) {
      stopFall();
      boneX.set(0);
      boneY.set(0);
      boneRotation.set(0);
      setShowBone(true);
      display(clicks.current <= 3 ? boneMessages[0] : pick(boneMessages));
      return;
    }
    if (clicks.current === 10) {
      display(puppyMessages.tenthPet);
      return;
    }
    const special = specialMessages.filter(
      (item) => clicks.current >= item.minClicks,
    );
    const unseen = messages.filter((text) => !seen.current.has(text));
    display(
      Math.random() < 0.25 && special.length
        ? pick(special).text
        : pick(unseen.length ? unseen : messages),
    );
  };
  const feed = () => {
    stopFall();
    setIsDragging(false);
    setOverDog(false);
    setShowBone(false);
    setHappy(true);
    setCelebration((count) => count + 1);
    display(pick(happyMessages));
    try {
      localStorage.setItem("boneReceived", "true");
    } catch {
      /* The interaction works without storage. */
    }
  };
  const dropTreat = () => {
    const rect = treat.current?.getBoundingClientRect();
    const ground = dog.current?.parentElement?.getBoundingClientRect().bottom;
    if (!rect || ground === undefined) return;
    stopFall();
    const drop = treatLanding(rect, ground, {
      width: window.innerWidth,
      height: window.innerHeight,
    });
    const target = { x: boneX.get() + drop.x, y: boneY.get() + drop.y };
    if (reduceMotion || paused) {
      boneX.set(target.x);
      boneY.set(target.y);
      return;
    }
    landing.current = target;
    falling.current = [
      animate(boneX, target.x, { duration: drop.duration, ease: "easeOut" }),
      animate(boneRotation, [0, 20, 0], { duration: drop.duration + 0.24 }),
      animate(boneY, target.y, {
        duration: drop.duration,
        ease: "easeIn",
        onComplete: () => {
          falling.current.push(
            animate(boneY, [target.y, target.y - drop.bounce, target.y], {
              duration: 0.24,
              ease: ["easeOut", "easeIn"],
              onComplete: () => {
                landing.current = undefined;
              },
            }),
          );
        },
      }),
    ];
  };
  return (
    <div ref={container} className="dog-runway">
      {playing && (
        <motion.span
          className="dog-ball"
          style={{ x: ballX }}
          aria-hidden="true"
        >
          <CircleDot size={17} />
        </motion.span>
      )}
      <motion.div className="dog-position" style={{ x }}>
        {roaming && !reduceMotion && !paused && (
          <span
            className={`dog-tracks ${direction < 0 ? "tracks-right" : ""}`}
            aria-hidden="true"
          >
            <PawPrint size={11} />
            <PawPrint size={11} />
          </span>
        )}
        <motion.button
          ref={dog}
          className={`pet-dog ${overDog ? "is-treat-target" : ""}`}
          onClick={pet}
          aria-label="Pet the dog"
          title="Pet the dog"
          animate={{
            y:
              reduceMotion || paused || isDragging
                ? 0
                : roaming || playing
                  ? [0, -4, 0]
                  : [0, -2, 0],
          }}
          transition={{
            duration: roaming || playing ? 0.4 : 1.8,
            repeat: Infinity,
          }}
        >
          <Dog size={36} strokeWidth={1.4} />
          {happy && <SmilePlus className="dog-happy" size={15} />}
        </motion.button>
        {happy && celebration > 0 && (
          <span className="dog-hearts" key={celebration} aria-hidden="true">
            {[-1, 0, 1].map((offset) => (
              <motion.span
                key={offset}
                initial={{ opacity: 1, x: 0, y: 0 }}
                animate={{
                  opacity: reduceMotion || paused ? 1 : 0,
                  x: offset * 21,
                  y: -22 - (offset === 0 ? 12 : 0),
                }}
                transition={{ duration: reduceMotion || paused ? 0 : 1.1 }}
                style={{ position: "absolute" }}
              >
                <Heart size={11} fill="currentColor" />
              </motion.span>
            ))}
          </span>
        )}
        {(message || overDog) && (
          <div className="dog-bubble" role="status">
            {overDog ? puppyMessages.dropTarget : message}
          </div>
        )}
        {showBone && (
          <motion.button
            ref={treat}
            className="dog-treat"
            title="Feed the dog, or drag the treat over"
            aria-label="Feed the dog"
            style={{
              x: boneX,
              y: boneY,
              rotate: boneRotation,
              left: x.get() > runwayWidth - 202 ? -58 : 65,
            }}
            drag
            dragMomentum={false}
            onDragStart={() => {
              dragging.current = true;
              setIsDragging(true);
            }}
            onDrag={(_, info) => {
              const rect = dog.current?.getBoundingClientRect();
              setOverDog(
                Boolean(
                  rect &&
                  isTreatOverDog(info.point, rect, {
                    x: window.scrollX,
                    y: window.scrollY,
                  }),
                ),
              );
            }}
            onDragEnd={(event, info) => {
              setIsDragging(false);
              setOverDog(false);
              const rect = dog.current?.getBoundingClientRect();
              if (
                event.type !== "pointercancel" &&
                rect &&
                isTreatOverDog(info.point, rect, {
                  x: window.scrollX,
                  y: window.scrollY,
                })
              )
                feed();
              else {
                dropTreat();
                display(puppyMessages.missedDrop);
              }
            }}
            onPointerDown={() => {
              stopFall();
              boneRotation.set(0);
              dragging.current = false;
              setIsDragging(true);
            }}
            onPointerUp={() => {
              if (!dragging.current) setIsDragging(false);
            }}
            onPointerCancel={() => {
              setIsDragging(false);
            }}
            onClick={() => {
              if (!dragging.current) feed();
            }}
          >
            <Bone size={21} strokeWidth={1.5} />
          </motion.button>
        )}
      </motion.div>
      <button
        className="dog-play icon-button"
        disabled={playing}
        aria-label="Play fetch with the puppy"
        title="Play fetch with the puppy"
        onClick={playFetch}
      >
        <CircleDot size={17} />
      </button>
      {!reduceMotion && (
        <button
          className="dog-pause icon-button"
          aria-label={paused ? "Resume dog animation" : "Pause dog animation"}
          title={paused ? "Resume dog animation" : "Pause dog animation"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
}
