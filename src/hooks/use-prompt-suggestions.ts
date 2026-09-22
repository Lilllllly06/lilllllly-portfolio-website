import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export const samplePrompts = [
  "What did Lily build at Shopify?",
  "How did Lily build this portfolio?",
  "Which projects show her AI experience?",
  "What is Lily looking for in her next role?",
  "What makes Lily a strong engineering hire?",
  "Tell me about her research and awards.",
  "How did she build AsterFind?",
  "Give me the 30-second introduction.",
];

export const resumePrompts = [
  "Explain this in plain English.",
  "What was Lily's role in this work?",
  "What technical skills does this demonstrate?",
  "How does this relate to her projects?",
];

export default function usePromptSuggestions(
  paused: boolean,
  hasExcerpt = false,
) {
  const reduceMotion = useReducedMotion();
  const [hidden, setHidden] = useState(document.hidden);
  const [state, setState] = useState({ index: 0, count: 0, deleting: false });
  const prompts = hasExcerpt ? resumePrompts : samplePrompts;
  const prompt = prompts[state.index % prompts.length];
  useEffect(() => {
    setState({ index: 0, count: 0, deleting: false });
  }, [hasExcerpt]);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (paused || hidden || reduceMotion) return;
    const complete = state.count === prompt.length;
    const delay = state.deleting ? 18 : complete ? 1100 : 42;
    const timer = setTimeout(
      () =>
        setState((previous) => {
          if (previous.deleting && previous.count === 0)
            return {
              index: (previous.index + 1) % prompts.length,
              count: 0,
              deleting: false,
            };
          if (previous.deleting)
            return { ...previous, count: previous.count - 1 };
          if (complete) return { ...previous, deleting: true };
          return { ...previous, count: previous.count + 1 };
        }),
      delay,
    );
    return () => clearTimeout(timer);
  }, [state, prompt, prompts, paused, hidden, reduceMotion]);
  return { prompt, text: reduceMotion ? prompt : prompt.slice(0, state.count) };
}
