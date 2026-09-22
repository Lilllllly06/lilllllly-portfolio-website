import type { PortfolioAnswer } from "./portfolio-answer";

export type ChatEvent =
  | { type: "start"; mode: "model" }
  | { type: "delta"; text: string }
  | { type: "complete"; answer: PortfolioAnswer }
  | { type: "fallback"; answer: PortfolioAnswer };

export async function* readChatStream(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<ChatEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let complete = false;
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      if (buffer.length > 100000) throw new Error("Response exceeds the limit");
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const event = JSON.parse(line) as ChatEvent;
        if (!["start", "delta", "complete", "fallback"].includes(event.type))
          throw new Error("Unexpected response event");
        if (event.type === "delta" && typeof event.text !== "string")
          throw new Error("Invalid text event");
        if (event.type === "complete" || event.type === "fallback") {
          if (
            !event.answer ||
            !Array.isArray(event.answer.sources) ||
            !Array.isArray(event.answer.sections)
          )
            throw new Error("Invalid final answer");
          complete = true;
        }
        yield event;
      }
      if (done) break;
    }
    if (!complete || buffer.trim())
      throw new Error("The response was interrupted");
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
