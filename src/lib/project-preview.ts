import type { Project } from "@/data/projects";

const preferredPreviewCaptions: Record<string, string> = {
  magnetostriction: "B-H Curve Measurement Setup",
  "faraday-waves": "Faraday Waves Setup",
};

function isPlayableVideo(url: string) {
  try {
    const parsed = new URL(url, "https://portfolio.invalid");
    return ["http:", "https:"].includes(parsed.protocol) &&
      /\.(mp4|webm)$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function selectProjectPreview(project: Project) {
  const demo = project.sections.demonstration;
  const images = [
    ...(demo?.images || []),
    ...(project.sections.pcb?.images || []),
    ...(project.sections.cad?.images || []),
  ].filter((item) => item.url !== project.image);
  const image = images.find((item) => item.caption === preferredPreviewCaptions[project.id]) || images[0];
  // Some projects intentionally lead with their current version's artwork.
  const video = demo?.imagesFirst
    ? undefined
    : demo?.videos?.find((item) => isPlayableVideo(item.url));
  return {
    video: video?.url,
    image: image?.url,
    imageLabel: project.category === "Research" ? "Experiment setup" : "Another view",
  };
}
