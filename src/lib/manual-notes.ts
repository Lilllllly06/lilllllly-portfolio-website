import { careerContext } from "../data/career-context";
import { portfolioProject } from "../data/portfolio";

// These notes remain citation targets without appearing in the Manual's outline.
const sourceNotes = [
  portfolioProject,
  ...careerContext.filter((note) => note.id === "career-direction"),
];

export function sourceNoteFromHash(hash: string) {
  try {
    const anchor = decodeURIComponent(hash.replace(/^#/, ""));
    return sourceNotes.find((note) => note.href.split("#")[1] === anchor);
  } catch {
    return undefined;
  }
}

export const manualNotes = careerContext.filter(
  (note) => note.kind === "Perspective",
);

export const featuredNoteIds = [
  "shopify-product-story",
  "meta-motivation",
  "learning-approach",
];

export const noteTopics = [
  {
    id: "work",
    label: "Work",
    noteIds: [
      "shopify-product-story",
      "meta-motivation",
      "agf-story",
      "education-motivation",
      "ai-motivation",
      "work-preferences",
    ],
  },
  {
    id: "projects",
    label: "Projects",
    noteIds: [
      "asterfind-motivation",
      "temporal-maze-motivation",
      "ecoland-motivation",
      "sidekick-evaluation",
      "research-mindset",
      "independent-projects",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    noteIds: [
      "learning-approach",
      "engineering-judgment",
      "delivery-judgment",
      "large-codebase-approach",
      "debugging-approach",
      "testing-approach",
    ],
  },
  {
    id: "teamwork",
    label: "Teamwork",
    noteIds: [
      "collaboration",
      "feedback-and-disagreement",
      "leadership-approach",
    ],
  },
];

export function notesById(ids: string[]) {
  return ids.flatMap((id) => {
    const note = manualNotes.find((item) => item.id === id);
    return note ? [note] : [];
  });
}

export function noteViewFromHash(hash: string) {
  let openNote = "";
  try {
    openNote = decodeURIComponent(hash.replace(/^#/, ""));
  } catch {
    /* An invalid URL fragment should not hide the featured questions. */
  }
  const topic = noteTopics.find((item) => item.noteIds.includes(openNote));
  return {
    expanded: Boolean(topic && !featuredNoteIds.includes(openNote)),
    topic: topic?.id ?? noteTopics[0].id,
    openNote: topic ? openNote : "",
  };
}
