import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  Bone,
  Dog,
  Heart,
  Keyboard,
  Music2,
  Pause,
  Pencil,
  Play,
  Search,
  Sparkles,
} from "lucide-react";
import {
  longWaitThreshold,
  waitingMessageAt,
  waitingMessageInterval,
} from "@/data/waiting-messages";

const props = {
  bone: Bone,
  heart: Heart,
  keyboard: Keyboard,
  music: Music2,
  pencil: Pencil,
  search: Search,
  sparkle: Sparkles,
};

export default function WaitingIndicator({ seed }: { seed: string }) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const reducedMotion = useReducedMotion();
  const still = paused || reducedMotion;
  const message = waitingMessageAt(seed, step);
  const Prop = props[message.prop];

  useEffect(() => {
    if (still) return;
    const timer = window.setInterval(
      () => setStep((value) => value + 1),
      waitingMessageInterval,
    );
    return () => window.clearInterval(timer);
  }, [still]);

  useEffect(() => {
    const timer = window.setTimeout(() => setLongWait(true), longWaitThreshold);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`waiting-indicator ${still ? "waiting-still" : ""}`}>
      <span role="status" className="sr-only">
        {longWait
          ? "Still waiting for a response. You can stop the request."
          : "Waiting for Lily's assistant to respond."}
      </span>
      <div className="waiting-scene" aria-hidden="true">
        <Dog className="waiting-puppy" size={32} strokeWidth={1.5} />
        <span
          className={`waiting-prop waiting-prop-${message.prop}`}
          key={message.prop}
        >
          <Prop size={16} strokeWidth={1.6} />
        </span>
        <span className="waiting-shadow" />
      </div>
      <div className="waiting-copy" aria-hidden="true">
        <div className="waiting-message-space">
          <span className="waiting-message" key={step}>
            {message.text}
          </span>
        </div>
        <span className="waiting-note">
          {longWait ? "Still waiting for a response." : "\u00a0"}
        </span>
      </div>
      {!reducedMotion && (
        <button
          type="button"
          className="icon-button waiting-pause"
          onClick={() => setPaused((value) => !value)}
          aria-label={
            paused ? "Resume waiting animation" : "Pause waiting animation"
          }
          title={
            paused ? "Resume waiting animation" : "Pause waiting animation"
          }
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      )}
    </div>
  );
}
