import MiniSearch from "minisearch";
import { projects } from "../data/projects.js";
import { profile } from "../data/profile.js";
import { achievements, skills, workExperiences } from "../data/experience.js";
import { personalFacts } from "../data/personal.js";
import { portfolioProject } from "../data/portfolio.js";
import { careerContext } from "../data/career-context.js";
import { recruiterOverview } from "../data/recruiter-overview.js";

export interface Source {
  id: string;
  title: string;
  href: string;
  kind: string;
  text: string;
  projectId?: string;
}
export interface PortfolioAnswer {
  title: string;
  intro: string;
  sections: { title: string; body: string[] }[];
  sources: Source[];
  followUps: string[];
  mode: "portfolio" | "model";
  prose?: string;
  notice?: string;
}

export const portfolioSources: Source[] = [
  ...careerContext.map(({ paragraphs, ...source }) => ({
    ...source,
    text: paragraphs.join("\n\n"),
  })),
  ...personalFacts.map((fact) => ({
    id: `personal-${fact.id}`,
    title: fact.topic,
    href: "/manual#personal",
    kind: "Personal",
    text: fact.detail,
  })),
  {
    id: "profile",
    title: "About Lily",
    href: "/manual",
    kind: "Profile",
    text: `${profile.name} studies Computer Engineering (BASc) at the ${profile.university}. Her work spans AI tooling, full-stack products, production infrastructure, and experimental physics. She is an International Baccalaureate Diploma Programme graduate.`,
  },
  ...workExperiences.map((item) => ({
    id: item.id,
    title: `${item.company} / ${item.title} (${item.year})`,
    href: `/about#${item.id}`,
    kind: "Experience",
    text: `${item.date}. ${item.role}. ${item.focus}. ${item.description.join(" ")} Tools: ${item.skills.join(", ")}.`,
  })),
  ...projects.map((item) => ({
    id: item.id,
    title: item.title,
    href: `/project/${item.id}`,
    kind: item.category === "Research" ? "Research" : "Project",
    text: `${item.date}. ${item.longDescription} ${item.highlights?.join(" ") || ""} Tools: ${item.technologies.join(", ")}.`,
    projectId: item.id,
  })),
  {
    id: portfolioProject.id,
    title: portfolioProject.title,
    href: portfolioProject.href,
    kind: portfolioProject.kind,
    text: portfolioProject.paragraphs.join("\n\n"),
  },
  ...achievements.map((item) => ({
    id: item.id,
    title: `${item.short} / ${item.title}`,
    href: `/recognition#${item.id}`,
    kind: "Recognition",
    text: `${item.title}, ${item.organization}. ${item.detail}`,
  })),
  {
    id: "skills",
    title: "Technical toolkit",
    href: "/manual#toolkit",
    kind: "Manual",
    text: Object.entries(skills)
      .map(([k, v]) => `${k}: ${v.join(", ")}`)
      .join(". "),
  },
  {
    id: "resume",
    title: "Industry resume",
    href: profile.resumeUrl,
    kind: "PDF",
    text: "Industry resume, CV, curriculum vitae, download, manual, work history.",
  },
  {
    id: "academic-cv",
    title: "Academic CV",
    href: profile.academicCvUrl,
    kind: "PDF",
    text: "Academic CV, research background, physics, education, curriculum vitae.",
  },
  {
    id: "contact",
    title: "Contact Lily",
    href: `mailto:${profile.email}`,
    kind: "Contact",
    text: `Email: ${profile.email}. GitHub: ${profile.githubUrl}. LinkedIn: ${profile.linkedInUrl}. Contact Lily directly about opportunities and availability.`,
  },
];
const index = new MiniSearch<Source>({
  fields: ["title", "text", "kind"],
  storeFields: ["id"],
  searchOptions: {
    boost: { title: 4, kind: 2 },
    prefix: false,
    fuzzy: false,
    combineWith: "AND",
  },
});
index.addAll(portfolioSources);
const stopWords = new Set(
  "a an the is are about what which who where when how me her she you your yours lily yuezhen dong tell show can could would please has have did does do to in of for and with some it this that i my like know more best strongest".split(
    " ",
  ),
);
const find = (ids: string[]) =>
  ids
    .map((id) => portfolioSources.find((s) => s.id === id))
    .filter((s): s is Source => Boolean(s));

function careerNoteIds(
  question: string,
  previousQuestion: string,
  hasPersonalTopic: boolean,
): string[] {
  const reflective =
    /\b(why|motivat\w*|inspir\w*|enjoy\w*|excit\w*|rewarding|favorite|favourite|learn|learned|learnt|lessons?|takeaway|challenge|difficult|choose|chose|drawn|decision|tradeoffs?|shape[ds]?)\b/.test(
      question,
    );
  const asksForDepth =
    /\b(tell me more|more (about|details|context)|go deeper|elaborate|expand|beyond (the |this |her )?(resume|cv|bullet)|behind (the |this |her )?(result|experience))\b/.test(
      question,
    );
  const topics = [
    {
      pattern: /\b(sidekick|rl|reinforcement learning|hack days|summit)\b/,
      id: "sidekick-story",
    },
    { pattern: /\b(meta|mlh|fellowship)\b/, id: "meta-motivation" },
    { pattern: /\bagf\b/, id: "agf-story" },
    { pattern: /\basterfind\b/, id: "asterfind-motivation" },
    {
      pattern: /\b(temporal ?maze|puppy portal|pygame|unreal)\b/,
      id: "temporal-maze-motivation",
    },
    { pattern: /\becoland\b/, id: "ecoland-motivation" },
    { pattern: /\b(research|physics|caypt|iypt)\b/, id: "research-mindset" },
    {
      pattern: /\b(shopify|pos|quick device|merchant)\b/,
      id: "shopify-product-story",
    },
  ];
  const namedTopics = topics.filter(({ pattern }) => pattern.test(question));
  const contextualTopics =
    !namedTopics.length &&
    (asksForDepth || /\b(it|that|this|there)\b/.test(question))
      ? topics.filter(({ pattern }) =>
          pattern.test(previousQuestion.toLowerCase()),
        )
      : namedTopics;
  if (
    !namedTopics.length &&
    /\b(projects?|build)\b/.test(question) &&
    /\b(why|motivat\w*|finished|done|complete|outside work|outside of work)\b/.test(
      question,
    )
  )
    return ["independent-projects"];
  if (!hasPersonalTopic) {
    if (
      /\b(computer engineering|electrical engineering|ce|ee|degree|major)\b/.test(
        question,
      ) &&
      /\b(why|choose|chose|switch\w*|move[ds]?|transfer\w*|motivat\w*)\b/.test(
        question,
      )
    )
      return ["education-motivation"];
    if (
      !namedTopics.length &&
      /\b(ai|artificial intelligence|ml|machine learning)\b/.test(question) &&
      /\b(why|draws?|drawn|interested|motivat\w*|appeal\w*)\b/.test(question)
    )
      return ["ai-motivation"];
    if (
      /\b(reward design|design\w* rewards?|llm judge|model-based judg\w*|deterministic rewards?)\b/.test(
        question,
      ) ||
      (contextualTopics.some(({ id }) => id === "sidekick-story") &&
        /\b(production|prototype|ship\w*|rewards?|judge)\b/.test(question))
    )
      return /\b(production|prototype|ship\w*)\b/.test(question)
        ? ["sidekick-story"]
        : ["sidekick-evaluation"];
    if (
      contextualTopics.some(({ id }) => id === "meta-motivation") &&
      /\b(internship|intern|employee|employment|employed|mlh|team lead)\b/.test(
        question,
      )
    )
      return ["meta-motivation"];
    if (
      /\b(leadership|leadership style|lead (a |her |the )?team)\b/.test(
        question,
      )
    )
      return ["leadership-approach"];
    if (
      /\b(feedback|criticism|code reviews?|disagreement|disagree\w*)\b/.test(
        question,
      )
    )
      return ["feedback-and-disagreement"];
    if (/\b(debug\w*|troubleshoot\w*)\b/.test(question))
      return ["debugging-approach"];
    if (
      /\b(large codebases?|multiple codebases?|graphql migration|backward compatibility|staged rollout)\b/.test(
        question,
      )
    )
      return ["large-codebase-approach"];
    if (
      /\b(time pressure|deadline|deadlines|urgency|shipping quickly|speed (and|vs|versus) quality)\b/.test(
        question,
      )
    )
      return ["delivery-judgment"];
    if (
      /\b(testing (approach|philosophy)|approach.*test\w*|design.*tests?|meaningful test\w*|test.*strategy)\b/.test(
        question,
      )
    )
      return ["testing-approach"];
    if (
      /\b(frontend or backend|front[ -]end|back[ -]end|long[ -]term|career direction)\b/.test(
        question,
      ) &&
      /\b(prefer\w*|lean\w*|more|direction|goals?|career|want)\b/.test(question)
    )
      return ["career-direction"];
    if (
      !namedTopics.length &&
      /\b(engineering judgment|engineering tradeoffs?)\b/.test(question)
    )
      return ["delivery-judgment"];
  }
  if (
    /\b(collaborat\w*|teamwork|teammates|work with (a |her |the )?team|ask.*help|help.*others)\b/.test(
      question,
    )
  )
    return ["collaboration"];
  if (
    !hasPersonalTopic &&
    /\b(how.*learn|learning approach|unfamiliar|new (field|domain)|learn (fast|quickly))\b/.test(
      question,
    )
  )
    return ["learning-approach"];
  if (
    (!namedTopics.length ||
      namedTopics.some(({ id }) => id === "asterfind-motivation")) &&
    /\b(engineering judgment|tradeoffs?|less control|not.*(use|let).*llm|decide.*llm)\b/.test(
      question,
    )
  )
    return ["engineering-judgment"];
  if (
    /\b(energiz\w*|drain\w*|work preferences|team culture|best work|work environment)\b/.test(
      question,
    )
  )
    return ["work-preferences"];
  if ((reflective || asksForDepth) && contextualTopics.length) {
    // Sidekick is more specific than Shopify when both are named.
    return contextualTopics
      .filter(
        ({ id }) =>
          id !== "shopify-product-story" ||
          !contextualTopics.some((topic) => topic.id === "sidekick-story"),
      )
      .map(({ id }) => id);
  }
  if (/\b(proud|proudest)\b/.test(question) && !namedTopics.length)
    return ["sidekick-story"];
  return [];
}

export function answerPortfolio(
  question: string,
  previousQuestion = "",
): PortfolioAnswer {
  const q = question.toLowerCase().trim();
  if (
    /\b(confidential|nonpublic|non-public|unreleased|undisclosed|coworker conversations|merchant data|customer data|private (contact|phone|email|account|messages|metrics)|internal (source|code|documents|roadmap|security)|interview (questions|materials)|password|secret key|home address)\b/.test(
      q,
    )
  ) {
    return {
      title: "That is outside the public portfolio",
      intro:
        "I can discuss Lily's published work, but not confidential employer information or private personal details. Lily can answer personally if she chooses; I won't infer or invent an answer on her behalf.",
      sections: [],
      sources: find(["contact"]),
      followUps: ["What did Lily enjoy most at Shopify?"],
      mode: "portfolio",
    };
  }
  const asksUndocumentedStory = [
    /\b(biggest|worst|greatest) (professional |career |engineering )?failure\b/,
    /\bproduction outage\b/,
    /\bmiss(?:ed|ing)? (a |her |the )?deadline\b/,
    /\b(conflict|disagreed|strongly disagree|biggest disagreement)\b.*\b(manager|coworker|colleague)\b/,
    /\b(manager|coworker|colleague)\b.*\b(conflict|disagreed|strongly disagree|biggest disagreement)\b/,
    /\bhardest bug\b.*\bshopify\b|\bshopify\b.*\bhardest bug\b/,
    /\b(exact (scale|user count)|how many (shopify )?(users|merchants)|how much revenue)\b/,
  ].some((pattern) => pattern.test(q));
  if (asksUndocumentedStory) {
    return {
      title: "That detail has not been shared",
      intro:
        "Lily hasn't shared that specific story or figure in her public portfolio. I can describe her documented work and approach, but I wouldn't want to turn those into an invented anecdote or number.",
      sections: [],
      sources: find(["contact"]),
      followUps: [
        "How does Lily debug?",
        "How does she handle technical disagreement?",
      ],
      mode: "portfolio",
    };
  }
  const personalMatches = personalFacts.filter((fact) =>
    fact.keywords.some((word) => new RegExp(`\\b${word}s?\\b`, "i").test(q)),
  );
  const namedProjects = projects.filter(
    (p) =>
      q.includes(p.title.toLowerCase()) ||
      q.includes(p.id.split("-").join(" ")) ||
      (p.id === "temporal-maze" && /puppy portal|temporalmaze/.test(q)) ||
      (p.id === "ecoland" && /\becoland\b/.test(q)),
  );
  const isHiringPitch =
    /\b((strong|good) (engineering )?(hire|candidate)|why (?:should \w+ )?(hire|choose|pick|consider|interview) (lily|her|you)|hiring pitch|recruiter (pitch|overview)|(?:lily|she|her) stand[ -]?out|(?:lily|she) stands? out|sets? (lily|her|you) apart)\b/.test(
      q,
    );
  const isIntroduction =
    /^(hi|hello|hey)[!.?]*$|\b(introduce|introduction|overview|summary|summarize)\b|who is|tell me about (lily|yourself|her)[?.!]*$/.test(
      q,
    );
  const isBroadIntroduction =
    isIntroduction &&
    !namedProjects.length &&
    !/\b(shopify|meta|agf|fellowship|sidekick|projects?|asterfind|ecoland|maze|puppy portal|research|awards?|caypt|iypt|this (site|website|portfolio)|portfolio agent|resume|cv|skills|toolkit|learning|collaboration|motivation)\b/.test(
      q,
    );
  const careerNotes = find(
    careerNoteIds(q, previousQuestion, personalMatches.length > 0),
  );
  if (
    !personalMatches.length &&
    (isHiringPitch || (isBroadIntroduction && !careerNotes.length))
  ) {
    return {
      title: isHiringPitch ? "Why Lily stands out" : "Meet Lily",
      intro: isHiringPitch
        ? recruiterOverview.hiringPitch
        : recruiterOverview.introduction,
      sections: recruiterOverview.highlights.map(({ title, body }) => ({
        title,
        body: [body],
      })),
      sources: find([
        ...new Set([
          ...recruiterOverview.openingSourceIds,
          ...recruiterOverview.highlights.flatMap((item) => item.sourceIds),
        ]),
      ]),
      followUps: [
        "How did Lily improve Sidekick?",
        "What did she build during the Meta fellowship?",
        "Show me her AI projects",
      ],
      mode: "portfolio",
    };
  }
  if (careerNotes.length) {
    return {
      title: careerNotes[0].title,
      intro: "From the experiences and reflections Lily has shared:",
      sections: careerNotes.map((source) => ({
        title: source.title,
        body: source.text.split("\n\n"),
      })),
      sources: careerNotes,
      followUps: [
        "How does Lily learn an unfamiliar field?",
        "What is her ideal role?",
      ],
      mode: "portfolio",
    };
  }
  const asksPersonal =
    /\b(eat|food|foods|meal|cuisine|snack|drink|coffee|hobbies|hobby|weekend|free time|outside work|outside engineering|favorite|favourite|married|birthday|boyfriend|girlfriend|salary|compensation)\b/.test(
      q,
    );
  if (!namedProjects.length && (asksPersonal || personalMatches.length)) {
    const matchedSources = personalMatches.map((fact) =>
      portfolioSources.find((source) => source.id === `personal-${fact.id}`)!,
    );
    return {
      title: personalMatches.length
        ? "A little more about Lily"
        : "Good question. I do not know that yet.",
      intro: personalMatches.length
        ? personalMatches.map((fact) => fact.detail).join("\n\n")
        : "I don't have that personal detail about Lily, and I wouldn't want to make it up. You can ask her directly, or we can talk about something she has shared in her portfolio.",
      sections: [],
      sources: matchedSources.length ? matchedSources : find(["contact"]),
      followUps: ["What did Lily build at Shopify?", "What are her awards?"],
      mode: "portfolio",
    };
  }
  let ids: string[] = [];
  let title = "From the portfolio";
  let intro = "Here are the most relevant notes from Lily's portfolio.";
  let followUps = [
    "What did Lily build at Shopify?",
    "Show me the AI projects",
    "What are her awards?",
  ];
  if (/\b(this (website|site|portfolio|assistant)|portfolio agent)\b/.test(q)) {
    ids = [portfolioProject.id];
    title = portfolioProject.title;
    intro = "This website is also one of Lily's applied AI projects.";
    followUps = ["Which projects show her AI experience?", "Show me AsterFind"];
  } else if (namedProjects.length) {
    ids = namedProjects.map((p) => p.id);
    title =
      namedProjects.length === 1
        ? namedProjects[0].title
        : "From the project archive";
    intro =
      "A closer look at the implementation, with the full project files linked below.";
    followUps = [
      "Show me the AI projects",
      "Tell me about her research",
      "What did Lily build at Shopify?",
    ];
  } else if (
    !/\b(meta|mlh|agf|shopify)\b/.test(q) &&
    /\b(challenge|challenging problem|difficult problem|learned|lesson|lessons)\b/.test(
      q,
    )
  ) {
    ids = ["sidekick-story"];
    title = "Learning through the Sidekick reliability problem";
    intro =
      "Her Sidekick work is both a technical achievement and the project she is personally proudest of.";
  } else if (
    /\b(next role|next roles|ideal role|ideal team|career goals|looking for|interested in|grow|growth|learn fast|learn quickly)\b/.test(
      q,
    )
  ) {
    ids = ["career-direction", "sidekick-story"];
    title = "What comes next";
    intro =
      "Her interests center on AI systems, developer infrastructure, and end-to-end engineering ownership.";
  } else if (/\b(resume|manual|cv|curriculum)\b/.test(q)) {
    ids = /academic|research/.test(q)
      ? ["academic-cv", "profile"]
      : ["resume", "academic-cv"];
    title = "The manual";
    intro = "The two versions of Lily's background, ready to open.";
  } else if (
    /\b(contact|email|linkedin|reach|available|availability|opportunities)\b/.test(
      q,
    )
  ) {
    ids = ["contact"];
    title = "Start a conversation";
    intro =
      "For opportunities or availability, the best source is Lily herself.";
  } else if (
    /\b(award|awards|accomplishment|accomplishments|recognition|medal|champion|achievements|achievement|captain|caypt|iypt)\b/.test(
      q,
    )
  ) {
    ids = ["caypt", "caypt-best-experiment", "iypt", "first"];
    title = "Recognition, from physics to robotics";
    intro =
      "Team leadership, individual recognition, and highlights from Lily's competitive research and engineering background.";
    followUps = [
      "Tell me about her research",
      "Show me the research reports",
      "What is her engineering experience?",
    ];
  } else if (/\b(shopify|sidekick|grpo|nemo|activation|pos)\b/.test(q)) {
    ids = ["shopify-2026", "shopify-2025"];
    title = "Engineering at Shopify";
    intro =
      "Across two internships, Lily worked on agentic AI, mobile activation, and full-stack retail products.";
    followUps = [
      "What were the measurable results?",
      "What did she do at Meta?",
      "Show me AsterFind",
    ];
  } else if (/\b(meta|sre|reliability|linux|infrastructure)\b/.test(q)) {
    ids = ["meta"];
    title = "The Meta Engineering Fellowship";
    intro =
      "As a Meta Engineering Fellow in the Meta x MLH Fellowship, Lily worked with mentorship from Meta engineers on deployment automation, service health, and diagnostics.";
  } else if (
    /\b(experience|work|worked|career|roles|internship|internships|hire|hiring|fit)\b/.test(
      q,
    ) &&
    !/project|research/.test(q)
  ) {
    ids = ["meta", "shopify-2026", "shopify-2025", "agf"];
    title = "Work experience";
    intro =
      "Lily's recent roles cover infrastructure, AI, full-stack development, and business automation.";
  } else if (
    /\b(research|physics|reports|report|experiment)\b/.test(q) &&
    !projects.some((p) => q.includes(p.title.toLowerCase()))
  ) {
    ids = ["marangoni-flow", "magnetostriction", "faraday-waves"];
    title = "A background in experimental research";
    intro =
      "The research archive brings together fluid dynamics, materials, and instrumentation. Each case study includes its report.";
  } else if (
    /\b(skills|stack|toolkit|languages|technologies)\b/.test(q) &&
    !projects.some((p) => q.includes(p.title.toLowerCase()))
  ) {
    ids = ["skills"];
    title = "A toolkit across the stack";
    intro =
      "Languages, frameworks, and tools documented in Lily's experience and projects.";
  } else if (
    /\b(education|university|waterloo|degree|school|graduation)\b/.test(q)
  ) {
    ids = ["profile"];
    title = "Computer Engineering at Waterloo";
    intro =
      "Lily studies Computer Engineering at the University of Waterloo and is an International Baccalaureate Diploma Programme graduate.";
  } else if (
    /\b(projects|built|builds|portfolio)\b/.test(q) &&
    !/\b(asterfind|ecoland|maze|sandbox|job)\b/.test(q)
  ) {
    ids = /\b(ai|llm|agent|agents|ml)\b/.test(q)
      ? ["asterfind", portfolioProject.id, "agentic-job-application"]
      : ["asterfind", "temporal-maze", "ecoland"];
    title = "A few things Lily has built";
    intro =
      "Selected projects, with their implementations and source material.";
    followUps = [
      "Tell me more about AsterFind",
      "How did Temporal Maze evolve?",
      "Show me research projects",
    ];
  } else {
    if (
      previousQuestion &&
      /^(tell me more|more details|what were the (measurable )?results|what tools did (she|you) use)[?.!]*$/.test(
        q,
      )
    ) {
      return answerPortfolio(previousQuestion);
    }
    const contextual =
      /^(and |what about |more|tell me more|what were|why |how about )/.test(q)
        ? `${previousQuestion} ${q}`
        : q;
    const terms = contextual
      .split(/\W+/)
      .filter((t) => t.length > 1 && !stopWords.has(t))
      .join(" ");
    const results = index.search(terms);
    ids = results
      .filter((r) => r.score >= (results[0]?.score || 0) * 0.45)
      .slice(0, 3)
      .map((r) => r.id);
  }
  const sources = find(ids);
  if (!sources.length)
    return {
      title: "That is not in the portfolio yet",
      intro:
        "I could not find a supported answer in Lily's portfolio. You can ask about her work, projects, research, or awards, or contact her directly.",
      sections: [],
      sources: find(["contact"]),
      followUps,
      mode: "portfolio",
    };
  const sections = sources
    .filter((s) => !["PDF", "Contact"].includes(s.kind))
    .map((source) => {
      const experience = workExperiences.find((e) => e.id === source.id);
      const project = projects.find((p) => p.id === source.id);
      return {
        title: experience
          ? `${experience.company} / ${experience.title} (${experience.date})`
          : source.title,
        body: experience
          ? experience.description
          : project
            ? [
                project.description,
                ...(project.highlights?.slice(0, 2) || [
                  project.longDescription,
                ]),
              ]
            : [source.text],
      };
    });
  return { title, intro, sections, sources, followUps, mode: "portfolio" };
}

export function answerText(answer: PortfolioAnswer): string {
  if (answer.prose) return answer.prose;
  return [
    answer.intro,
    ...answer.sections.map(
      (section) => `**${section.title}**\n\n${section.body.join("\n\n")}`,
    ),
  ].join("\n\n");
}

const knownSourceIds = new Set(portfolioSources.map((source) => source.id));

function readCitation(value: string): string[] | null {
  const explicit = /^\s*source\s*:/i.test(value);
  const ids = value
    .split(/[,;]/)
    .map((id) => id.replace(/^\s*source\s*:\s*/i, "").trim());
  // Bare tags are only annotations when every ID is in our own source registry.
  if (!explicit && !ids.every((id) => knownSourceIds.has(id))) return null;
  return ids.filter((id) => knownSourceIds.has(id));
}

export function withoutCitations(text: string, streaming = false): string {
  let prose = text.replace(/\[([^\]\n]+)\](?!\()/g, (tag, value: string) =>
    readCitation(value) === null ? tag : "",
  );
  if (streaming) {
    const trailing = prose.match(/\[([^\]\n]*)$/);
    if (trailing) {
      const prefix = trailing[1].trim();
      if (
        "source:".startsWith(prefix.toLowerCase()) ||
        [...knownSourceIds].some((id) => id.startsWith(prefix))
      )
        prose = prose.slice(0, trailing.index);
    }
  }
  return prose
    .replace(/\[\s*source\s*:[^\]\n]*(?:\]|$)/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .trimStart();
}

export function citedSources(text: string): Source[] {
  const ids = new Set(
    [...text.matchAll(/\[([^\]\n]+)\](?!\()/g)].flatMap(
      (match) => readCitation(match[1]) || [],
    ),
  );
  // Project answers often mix implementation and personal rationale. Keep both
  // approved pages reachable even when the model only names the project source.
  const directSources = portfolioSources.filter((source) => ids.has(source.id));
  for (const source of directSources) {
    if (!source.projectId) continue;
    const perspective = `${source.projectId}-motivation`;
    if (knownSourceIds.has(perspective)) ids.add(perspective);
  }
  return [
    ...directSources,
    ...portfolioSources.filter(
      (source) => ids.has(source.id) && !directSources.includes(source),
    ),
  ];
}
