// Dev-only fixture: exercise the real chat UI without delaying production or using an API key.
const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  if (String(input) !== "/api/chat") return originalFetch(input, init);
  if (init?.method !== "POST") return Response.json({ configured: true });
  const encoder = new TextEncoder();
  const answer = {
    title: "Local preview",
    intro: "",
    prose:
      "This is a local test response. The waiting animation has stopped and the answer is now streaming.",
    sections: [],
    sources: [],
    followUps: [],
    mode: "model",
  };
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancel = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (event: unknown) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      cancel = () => {
        timers.forEach(clearTimeout);
        controller.error(new DOMException("Preview stopped", "AbortError"));
      };
      init.signal?.addEventListener("abort", cancel, { once: true });
      timers.push(
        setTimeout(
          () => send({ type: "delta", text: answer.prose.slice(0, 51) }),
          14000,
        ),
      );
      timers.push(
        setTimeout(
          () => send({ type: "delta", text: answer.prose.slice(51) }),
          14600,
        ),
      );
      timers.push(
        setTimeout(() => {
          send({ type: "complete", answer });
          init.signal?.removeEventListener("abort", cancel);
          controller.close();
        }, 15000),
      );
    },
    cancel() {
      timers.forEach(clearTimeout);
      init?.signal?.removeEventListener("abort", cancel);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
};

// Use the same route and assets as the app while keeping the fetch stub scoped to this fixture tab.
window.history.replaceState(null, "", "/");
void import("../../src/main");
