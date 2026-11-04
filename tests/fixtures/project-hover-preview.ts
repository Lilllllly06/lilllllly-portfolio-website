// Dev-only fixture for media failures and input preferences without changing device settings.
const mode = new URLSearchParams(window.location.search).get("mode");
const originalMatchMedia = window.matchMedia.bind(window);
window.matchMedia = (query) => {
  const forced = mode === "reduce" && query.includes("prefers-reduced-motion")
    ? true
    : mode === "touch" && query.includes("hover")
      ? false
      : undefined;
  if (forced === undefined) return originalMatchMedia(query);
  return {
    matches: forced,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => true,
  };
};

if (mode === "failure") {
  const { projects } = await import("../../src/data/projects");
  projects[0].sections.demonstration.videos = [
    { name: "Unavailable preview", url: "/tests/fixtures/missing-hover-preview.mp4" },
  ];
}

window.history.replaceState(null, "", "/projects");
void import("../../src/main");

export {};
