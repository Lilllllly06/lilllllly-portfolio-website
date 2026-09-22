export const waitingMessages = [
  { text: "A little thought. A little tail wag.", prop: "sparkle" },
  { text: "Fetching a useful answer.", prop: "bone" },
  { text: "Less fluff, more substance.", prop: "pencil" },
  { text: "Paws on the keyboard.", prop: "keyboard" },
  { text: "No elevator music. Just this dog.", prop: "music" },
  { text: "A brief pause for a good question.", prop: "heart" },
  { text: "Small assistant. Big curiosity.", prop: "search" },
  { text: "Putting an answer together.", prop: "sparkle" },
] as const;

export const waitingMessageInterval = 2800;
export const longWaitThreshold = 10000;

export function waitingMessageAt(seed: string, step: number) {
  const offset = Array.from(seed).reduce(
    (sum, letter) => sum + letter.charCodeAt(0),
    0,
  );
  return waitingMessages[
    (offset + Math.max(0, Math.floor(step))) % waitingMessages.length
  ];
}
