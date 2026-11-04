import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import postcss from "postcss";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Dog } from "lucide-react";

const layout = await readFile(
  "src/components/workspace/WorkspaceLayout.tsx",
  "utf8",
);
const index = await readFile("src/pages/Index.tsx", "utf8");
const projects = await readFile("src/pages/Projects.tsx", "utf8");
const stylesheet = postcss.parse(await readFile("src/workspace.css", "utf8"));
const declarations = (selector) => {
  const values = {};
  stylesheet.walkRules(selector, (rule) => {
    rule.walkDecls((declaration) => {
      values[declaration.prop] = declaration.value;
    });
  });
  return values;
};

test("hover previews use real media and preserve the current Temporal Maze version", async () => {
  const result = await build({
    stdin: {
      contents: 'export { selectProjectPreview } from "./src/lib/project-preview"; export { projects } from "./src/data/projects";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const { selectProjectPreview, projects } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`,
  );
  const maze = selectProjectPreview(projects.find((project) => project.id === "temporal-maze"));
  assert.equal(maze.video, undefined);
  assert.equal(maze.image, "/lovable-uploads/temporal-maze-ue-storybook.jpg");
  assert.equal(
    selectProjectPreview(projects.find((project) => project.id === "magnetostriction")).image,
    "/lovable-uploads/cc2a5bed-a41f-4d31-8404-b4cc2311cb52.png",
  );
  assert.equal(
    selectProjectPreview(projects.find((project) => project.id === "asterfind")).video,
    "/lovable-uploads/asterfind-demo.mp4",
  );
  for (const project of projects) {
    const preview = selectProjectPreview(project);
    assert.ok(preview.image || preview.video, `${project.id} has no preview media`);
    assert.notEqual(preview.image, project.image);
    for (const url of [preview.image, preview.video].filter(Boolean)) {
      if (url.startsWith("/")) await access(`public${url}`);
      else assert.equal(new URL(url).protocol, "https:");
    }
  }
  const unsafe = selectProjectPreview({
    ...projects[0],
    sections: { demonstration: { videos: [{ url: "javascript:alert(1).mp4" }] } },
  });
  assert.equal(unsafe.video, undefined);
});

test("Career Agent uses the updated workflow and captioned walkthrough without breaking its original name", async () => {
  const result = await build({
    stdin: {
      contents: 'export { projects } from "./src/data/projects"; export { answerPortfolio, portfolioSources } from "./src/lib/portfolio-answer";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const { projects, answerPortfolio, portfolioSources } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`,
  );
  const project = projects.find((item) => item.id === "agentic-job-application");
  assert.equal(project.title, "Career Agent");
  assert.match(project.longDescription, /75% skill coverage and 25% keyword coverage/);
  assert.match(project.longDescription, /changes require a fresh review/);
  assert.match(project.longDescription, /deterministic analysis, not a language model/);
  assert.match(project.longDescription, /submitted manually/);
  assert.match(project.githubUrl, /26011f05e67f36e85243669348a6adaa26b643e3$/);
  const video = project.sections.demonstration.videos[0];
  assert.match(video.url, /career-agent-demo\.mp4$/);
  assert.match(video.captions, /career-agent-demo\.vtt$/);
  for (const url of [project.image, video.url, video.poster, video.captions, ...project.sections.demonstration.images.map((item) => item.url)]) {
    await access(`public${url}`);
  }
  assert.match(await readFile(`public${video.captions}`, "utf8"), /^WEBVTT/);
  for (const question of ["Tell me about Career Agent", "Tell me about Agentic Job Application"]) {
    assert.ok(answerPortfolio(question).sources.some((source) => source.id === project.id));
  }
  assert.match(portfolioSources.find((source) => source.id === project.id).text, /validated JSON backup/);
  const demo = await readFile("src/components/project/DemonstrationSection.tsx", "utf8");
  assert.match(demo, /<track kind="captions" src=\{video.captions\} srcLang="en" label="English" \/>/);
});

test("the composer keeps its original reminder without a dedicated privacy popup", () => {
  assert.doesNotMatch(index, /ChatPrivacy|Technical usage may be recorded/);
  assert.match(index, /Questions go to the AI provider\. Don't share sensitive information\. Check sources\./);
  assert.deepEqual(declarations(".chat-privacy-dialog"), {});
});

test("animated suggestions lead with hiring fit and the 30-second introduction", async () => {
  const result = await build({
    entryPoints: ["src/hooks/use-prompt-suggestions.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const { samplePrompts, resumePrompts } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
  assert.deepEqual(samplePrompts.slice(0, 2), [
    "Why is Lily a good engineering hire?",
    "Give me the 30-second introduction.",
  ]);
  assert.equal(samplePrompts.length, 8);
  assert.equal(new Set(samplePrompts).size, samplePrompts.length);
  assert.equal(resumePrompts[0], "Explain this in plain English.");
});

test("mobile navigation uses the left sheet with a focus-restoring trigger", () => {
  assert.match(layout, /<SheetTrigger asChild>/);
  assert.match(layout, /<SheetContent\s+side="left"/);
  assert.doesNotMatch(layout, /<DialogContent|mobile-nav-dialog/);
  const drawer = declarations(".mobile-nav-drawer");
  assert.equal(drawer.height, "100dvh");
  assert.equal(drawer.transform, undefined);
  assert.equal(
    declarations('.mobile-nav-drawer[data-state="open"]')["animation-duration"],
    "240ms",
  );
});

test("both name links reset the active conversation while preserving history", () => {
  assert.match(layout, /startTransition\(\(\) => \{\s*reset\(\);\s*navigate\("\/", \{ state: \{ newConversation: true \} \}\);\s*\}\)/);
  assert.match(layout, /event\.preventDefault\(\);\s*newConversation\(\);/);
  assert.match(layout, /startTransition\(\(\) => openConversation\(chat\.id\)\)/);
  assert.match(
    layout,
    /<Link\s+to="\/"\s+onClick=\{home\}\s+className="workspace-brand"/,
  );
  assert.match(
    layout,
    /<Link to="\/" onClick=\{home\} className="topbar-owner"/,
  );
  assert.doesNotMatch(layout, /sessionStorage\.clear|localStorage\.clear/);
  assert.match(index, /handledNavigation\.current !== navigationKey/);
  assert.match(index, /navigationState\?\.newConversation === true && !chatId && !question/);
  assert.match(index, /if \(activeConversationId\) reset\(\)/);
  assert.match(index, /if \(!question\) handledAsk\.current = ""/);
});

test("page labels are restored and experience entries reveal once without hiding anchor targets", async () => {
  const about = await readFile("src/pages/About.tsx", "utf8");
  const recognition = await readFile("src/pages/Recognition.tsx", "utf8");
  const manual = await readFile("src/pages/Manual.tsx", "utf8");
  assert.match(projects, /<Folder size=\{14\} \/> Project archive/);
  assert.match(about, /<BriefcaseBusiness size=\{14\} \/> Experience/);
  assert.match(recognition, /<Medal size=\{14\} \/> Recognition/);
  assert.match(manual, /<BookOpen size=\{14\} \/> The manual/);
  assert.match(about, /useReducedMotion\(\)/);
  assert.match(about, /once: true/);
  assert.match(about, /duration: reduceMotion \? 0 : 0\.7/);
  assert.match(about, /opacity: 0, y: 28/);
  assert.match(about, /initial=\{reduceMotion \|\| hash === `#\$\{role\.id\}` \? false/);
  assert.match(about, /initial=\{reduceMotion \|\| hash === "#sidekick-story" \? false/);
});

test("the puppy mark keeps its favicon outline and tilts with a wink on interaction", async () => {
  const html = await readFile("index.html", "utf8");
  const icon = await readFile("public/favicon.svg", "utf8");
  assert.match(layout, /className="brand-symbol" aria-hidden="true"/);
  assert.match(
    layout,
    /<Dog size=\{32\} color="#3f5f99" strokeWidth=\{1\.5\}>/,
  );
  assert.match(
    html,
    /rel="icon" type="image\/svg\+xml" href="\/favicon.svg\?v=puppy"/,
  );
  assert.doesNotMatch(layout, /Sparkle/);
  assert.match(icon, /viewBox="0 0 24 24"/);
  assert.match(icon, /stroke="#3f5f99"/);
  assert.match(icon, /stroke-width="1.5"/);
  const iconPaths = (markup) =>
    [...markup.matchAll(/\bd="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(
    iconPaths(icon),
    iconPaths(renderToStaticMarkup(createElement(Dog))),
  );
  assert.doesNotMatch(icon, /<text|<script|<animate|href=/);
  assert.match(layout, /<path className="brand-wink" d="M14\.8 14\.5q1\.2-1\.2 2\.4 0" \/>/);
  assert.ok(iconPaths(icon).includes("M16 14v.5"));
  assert.equal(declarations(".brand-wink").opacity, "0");
  assert.equal(declarations(".brand-symbol svg").width, "32px");
  assert.equal(declarations(".brand-symbol svg").height, "32px");
  assert.equal(
    declarations(".brand-symbol svg")["transform-origin"],
    "50% 90%",
  );
  assert.equal(
    declarations(".brand-symbol svg").transition,
    "transform 220ms ease-out",
  );
  for (const interaction of ["hover", "focus-visible"]) {
    assert.equal(
      declarations(`.workspace-brand:${interaction} .brand-symbol svg`)
        .transform,
      "rotate(-7deg)",
    );
    assert.equal(
      declarations(`.workspace-brand:${interaction} path[d="M16 14v.5"]`).opacity,
      "0",
    );
    assert.equal(
      declarations(`.workspace-brand:${interaction} .brand-wink`).opacity,
      "1",
    );
  }
  stylesheet.walkRules((rule) => {
    if (!/brand-symbol|brand-wink|workspace-brand.*M16/.test(rule.selector)) return;
    rule.walkDecls((declaration) => {
      if (!["transform", "transition"].includes(declaration.prop) &&
          !(declaration.prop === "opacity" && rule.selector.includes(".workspace-brand:"))) return;
      assert.equal(rule.parent.type, "atrule");
      assert.match(rule.parent.params, /prefers-reduced-motion: no-preference/);
    });
  });
});

test("chat companion leaves only a small interactive row and lets its bubble overlay content", () => {
  assert.equal(declarations(".companion-track").height, "102px");
  const chatTrack = declarations(".chat-started .companion-track");
  assert.equal(chatTrack.height, "52px");
  assert.equal(chatTrack.overflow, "visible");
  assert.equal(chatTrack["pointer-events"], "none");
  assert.equal(
    declarations(".chat-started .companion-track button")["pointer-events"],
    "auto",
  );
  const composer = declarations(".chat-started .composer-area");
  assert.match(composer.background, /linear-gradient\(/);
  assert.match(composer.background, /rgba\(var\(--paper-rgb\), 0\) 0/);
  assert.match(composer.background, /rgba\(var\(--paper-rgb\), 0.5\) 24px/);
  assert.match(composer.background, /var\(--paper\) 52px/);
  assert.equal(composer.opacity, undefined);
  assert.equal(declarations(".question-composer").background, "var(--surface-raised, #fff)");
  const puppyBackdrop = declarations(".chat-started .companion-track::before");
  assert.equal(puppyBackdrop["backdrop-filter"], "blur(3px)");
  assert.equal(puppyBackdrop["pointer-events"], "none");
  assert.equal(puppyBackdrop["z-index"], "-1");
  assert.equal(declarations(".chat-started .dog-bubble")["max-width"], "150px");
  assert.equal(declarations(".scroll-latest").right, "0");
  assert.equal(declarations(".scroll-latest").left, undefined);
});

test("home shortcuts and project counts match their visible labels", () => {
  assert.match(index, /ask\("What is Lily's work experience\?"\)/);
  assert.doesNotMatch(index, /ask\("What did Lily build at Shopify\?"\)/);
  assert.match(
    projects,
    /\{filtered.length\} \{filtered.length === 1 \? "project" : "projects"\}/,
  );
  assert.doesNotMatch(projects, /padStart/);
});

test("the home welcome connects Lily to her full name once", () => {
  assert.equal((index.match(/Yuezhen \(Lily\) Dong/g) || []).length, 1);
  assert.match(
    index,
    /<p className="welcome-identity">Yuezhen \(Lily\) Dong<\/p>/,
  );
  assert.match(layout, /<span>Lily Dong<\/span>/);
  assert.match(layout, /Lily's portfolio/);
});

test("page headings name their content directly while keeping the personal welcome", async () => {
  const about = await readFile("src/pages/About.tsx", "utf8");
  const recognition = await readFile("src/pages/Recognition.tsx", "utf8");
  const manual = await readFile("src/pages/Manual.tsx", "utf8");
  assert.match(projects, /<h1>Projects<\/h1>/);
  assert.match(about, /<h1>Work experience<\/h1>/);
  assert.match(about, /<h2>My first reinforcement learning project<\/h2>/);
  assert.match(recognition, /<h1>Awards &amp; competitions<\/h1>/);
  assert.doesNotMatch(recognition, /A few milestones in experimental physics/);
  assert.match(manual, /<h1[^>]*>\s*Resume &amp; background\s*<\/h1>/);
  assert.match(manual, /<h2>Outside work<\/h2>/);
  assert.match(manual, /<h2>Get in touch<\/h2>/);
  assert.match(index, /<h1>\s*Hi, I&rsquo;m/);
  assert.match(index, /<h2>Selected work<\/h2>/);
});

test("page introductions use Lily's wording without redundant subtitles or Q&A labels", async () => {
  const about = await readFile("src/pages/About.tsx", "utf8");
  const manual = await readFile("src/pages/Manual.tsx", "utf8");
  const notes = await readFile("src/components/workspace/CareerNotes.tsx", "utf8");
  assert.doesNotMatch(manual, /Engineer, researcher, and curious person/);
  assert.doesNotMatch(about, /AI systems, merchant-facing software|Want to connect the dots/);
  assert.match(about, /<p>Got questions\?<\/p>/);
  assert.doesNotMatch(projects, /Personal projects and physics research\./);
  assert.match(index, /Ask my assistant about me, or browse my projects below\./);
  assert.doesNotMatch(index, /Computer Engineering at Waterloo\./);
  assert.doesNotMatch(layout, /Made by Lily\./);
  assert.doesNotMatch(index, /I study Computer Engineering|I&rsquo;m interested in/);
  assert.doesNotMatch(index, /Ask my assistant about my experience/);
  assert.match(index, /data-name-trigger/);
  assert.match(notes, /<h2>A few questions about my work<\/h2>/);
  assert.doesNotMatch(notes, /Behind the work|Motivation, decisions, and lessons/);
});

test("the welcome name stays neutral until clicked without a gradient or glow", () => {
  const name = declarations(".conversation-welcome h1 button");
  assert.equal(name["background-image"], undefined);
  assert.equal(name.color, undefined);
  assert.equal(name.filter, undefined);
  assert.equal(declarations(".conversation-welcome h1 button.name-booped").color, "var(--blue)");
  assert.doesNotMatch(stylesheet.toString(), /--name-gradient/);
});

test("page transitions animate only route content and leave same-page state mounted", async () => {
  const transition = await readFile("src/components/workspace/PageTransition.tsx", "utf8");
  const app = await readFile("src/App.tsx", "utf8");
  assert.match(layout, /<main id="main-content"[^>]*>[\s\S]*<Suspense[\s\S]*<PageTransition \/>[\s\S]*<\/Suspense>/);
  assert.match(transition, /key=\{pathname\}/);
  assert.doesNotMatch(transition, /key=\{[^}]*\b(search|hash|location\.key)\b/);
  assert.match(transition, /useReducedMotion\(\)/);
  assert.match(transition, /initial=\{reduceMotion \? false/);
  assert.match(transition, /y: hash \? 0 : 10/);
  assert.match(transition, /duration: reduceMotion \? 0 : 0\.3/);
  assert.doesNotMatch(transition, /AnimatePresence|mode="wait"/);
  assert.match(app, /<BrowserRouter future=\{\{ v7_startTransition: true \}\}>/);
  assert.equal(declarations(".route-transition")["overflow"], undefined);
});

test("home keeps its original typography and balanced recognition spacing", () => {
  assert.equal(declarations(".conversation-welcome h1")["font-size"], "1.875rem");
  assert.equal(declarations(".conversation-welcome > p")["font-size"], "1rem");
  assert.equal(declarations(".home-role-list strong")["font-size"], "1rem");
  assert.equal(declarations(".home-award-copy strong")["font-size"], "0.9375rem");
  assert.equal(declarations(".home-work-item h3")["font-size"], "1rem");
  assert.equal(declarations(".question-composer textarea")["font-size"], "1rem");
  assert.equal(declarations(".animated-prompt")["font-size"], "1rem");
  assert.equal(declarations(".section-line h2")["font-size"], "0.875rem");
  for (const selector of [".chat-empty .question-composer textarea", ".chat-empty .animated-prompt"]) {
    let fontSize;
    stylesheet.walkRules((rule) => {
      if (rule.selectors.includes(selector))
        rule.walkDecls("font-size", (declaration) => { fontSize = declaration.value; });
    });
    assert.equal(fontSize, undefined);
  }
  assert.equal(declarations(".home-recognition")["padding-block"], "20px");
});

test("theme follows the device by default and remembers an explicit visitor choice", async () => {
  const main = await readFile("src/main.tsx", "utf8");
  const toggle = await readFile("src/components/workspace/ThemeToggle.tsx", "utf8");
  assert.match(main, /<ThemeProvider[\s\S]*attribute="class"/);
  assert.match(main, /defaultTheme="system"/);
  assert.match(main, /\benableSystem\s/);
  assert.doesNotMatch(main, /enableSystem=\{false\}|forcedTheme=/);
  assert.match(main, /storageKey="lily-portfolio-theme"/);
  assert.match(main, /disableTransitionOnChange/);
  assert.match(layout, /<div className="topbar-actions">\s*<ThemeToggle \/>/);
  assert.match(toggle, /aria-label=\{label\}/);
  assert.match(toggle, /Switch to light mode/);
  assert.match(toggle, /Switch to dark mode/);
  assert.match(toggle, /setTheme\(isDark \? "light" : "dark"\)/);
  assert.match(toggle, /<TooltipContent>\{label\}<\/TooltipContent>/);
});

test("dark colors keep text legible and leave PDF and project media uninverted", () => {
  const dark = declarations(".dark");
  const luminance = (hex) => {
    const channels = hex.slice(1).match(/../g).map((value) => {
      const channel = parseInt(value, 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (first, second) => {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  for (const foreground of ["--ink", "--subtle", "--blue", "--ink-secondary", "--ink-muted"]) {
    for (const background of ["--paper", "--surface-raised", "--surface-hover"]) {
      assert.ok(contrast(dark[foreground], dark[background]) >= 4.5, `${foreground} on ${background}`);
    }
  }
  for (const award of ["gold", "bronze", "silver"]) {
    assert.ok(contrast(dark[`--${award}-ink`], dark[`--${award}-bg`]) >= 4.5);
  }
  assert.equal(declarations(".resume-page").filter, undefined);
  assert.equal(declarations(".dark img").filter, undefined);
  assert.equal(declarations(".resume-page .react-pdf__Page__textContent ::selection").color, "transparent");
});

test("home recognition has distinct award links and stays secondary to work titles", () => {
  assert.match(index, /to="\/recognition#caypt" className="home-award"/);
  assert.match(index, /to="\/recognition#iypt" className="home-award"/);
  assert.match(index, /<strong>International Bronze Medalist<\/strong>/);
  assert.match(index, /home-award-icon award-gold/);
  assert.match(index, /home-award-icon award-bronze/);
  assert.equal(declarations(".home-award").color, "var(--ink)");
  assert.equal(declarations(".home-award-copy strong")["font-weight"], "600");
  assert.ok(
    parseFloat(declarations(".home-award-copy strong")["font-size"]) <
      parseFloat(declarations(".home-role-list strong")["font-size"]),
  );
  assert.equal(
    declarations(".home-award")["grid-template-columns"],
    "36px minmax(0, 1fr) 15px",
  );
  assert.equal(
    declarations(".home-recognition")["grid-template-columns"],
    "minmax(0, 1fr)",
  );
});

test("assistant-only personal notes stay off the Manual and have no misleading source links", async () => {
  const manual = await readFile("src/pages/Manual.tsx", "utf8");
  const personal = await readFile("src/data/personal.ts", "utf8");
  assert.match(manual, /visiblePersonalFacts\.map/);
  assert.doesNotMatch(manual, /\{personalFacts\.map/);
  assert.match(personal, /personalFacts\.filter\(\(fact\) => !fact\.assistantOnly\)/);
  assert.match(index, /!source\.href \? \(\s+<span key=\{source\.id\} className="answer-source-note"/);
  assert.match(index, /s\.href \? .*new URL\(s\.href, window\.location\.origin\)\.href.* : s\.title/);
});

test("public background copy uses Lily's voice without changing assistant reference notes", async () => {
  const result = await build({
    stdin: {
      contents: 'export { manualCopy } from "./src/data/manual-copy"; export { careerContext } from "./src/data/career-context"; export { visiblePersonalFacts } from "./src/data/personal"; export { portfolioSources } from "./src/lib/portfolio-answer";',
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const { manualCopy, careerContext, visiblePersonalFacts, portfolioSources } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`,
  );
  for (const note of [...careerContext, { id: "portfolio-agent" }]) {
    const copy = manualCopy[note.id];
    assert.ok(copy, `${note.id} needs public-facing copy`);
    assert.ok(copy.title.length > 0);
    assert.ok(copy.paragraphs.length > 0);
    assert.match(copy.paragraphs.join(" "), /\b(I|I'm|I've|my|me)\b/i);
    assert.doesNotMatch(copy.paragraphs.join(" "), /\bLily\b|has not shared|have been shared|does not establish/);
  }
  for (const fact of visiblePersonalFacts) {
    assert.ok(fact.publicDetail, `${fact.id} needs public-facing copy`);
    assert.match(fact.publicDetail, /\b(I|I'm|I've|my|me)\b/i);
    assert.doesNotMatch(fact.publicDetail, /\bLily\b|proficiency ranking|formal music grades/);
    assert.equal(portfolioSources.find((source) => source.id === `personal-${fact.id}`).text, fact.detail);
  }
  assert.match(layout, /label: "Ask Lily"/);
});

test("manual questions are curated without dropping any approved perspectives or source links", async () => {
  const result = await build({
    entryPoints: ["src/lib/manual-notes.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const {
    featuredNoteIds,
    manualNotes,
    noteTopics,
    notesById,
    noteViewFromHash,
    sourceNoteFromHash,
  } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
  assert.equal(featuredNoteIds.length, 3);
  assert.equal(notesById(featuredNoteIds).length, 3);
  const groupedIds = noteTopics.flatMap((topic) => topic.noteIds);
  assert.equal(new Set(groupedIds).size, groupedIds.length);
  assert.deepEqual(
    [...groupedIds].sort(),
    manualNotes.map((note) => note.id).sort(),
  );
  for (const topic of noteTopics) {
    assert.ok(topic.noteIds.length <= 6);
    assert.equal(notesById(topic.noteIds).length, topic.noteIds.length);
  }
  for (const note of manualNotes) {
    const view = noteViewFromHash(note.href.slice(note.href.indexOf("#")));
    assert.equal(view.openNote, note.id);
    assert.equal(view.expanded, !featuredNoteIds.includes(note.id));
    assert.ok(
      noteTopics
        .find((topic) => topic.id === view.topic)
        .noteIds.includes(note.id),
    );
    assert.ok(notesById([note.id])[0].paragraphs.length > 0);
  }
  for (const hash of [
    "",
    "#perspectives",
    "#personal",
    "#unknown-note",
    "#%E0%A4%A",
  ]) {
    const view = noteViewFromHash(hash);
    assert.equal(view.expanded, false);
    assert.equal(view.openNote, "");
  }
  assert.equal(noteViewFromHash("#%6c%65adership-approach").topic, "teamwork");
  for (const [hash, id] of [
    ["#portfolio-agent", "portfolio-agent"],
    ["#direction", "career-direction"],
    ["#%64irection", "career-direction"],
  ]) {
    const note = sourceNoteFromHash(hash);
    assert.equal(note.id, id);
    assert.equal(note.paragraphs.length, 3);
    assert.ok(!manualNotes.some((item) => item.id === id));
  }
  for (const hash of ["", "#personal", "#unknown-note", "#%E0%A4%A"])
    assert.equal(sourceNoteFromHash(hash), undefined);
});

test("the manual keeps discovery notes off its outline but supports explicit citations", async () => {
  const manual = await readFile("src/pages/Manual.tsx", "utf8");
  assert.doesNotMatch(
    manual,
    /Applied AI|What's next|AI systems and engineering ownership/,
  );
  assert.doesNotMatch(
    manual,
    /<section id="direction"|<section id=\{portfolioProject.id\}/,
  );
  assert.match(
    manual,
    /const sourceNote = sourceNoteFromHash\(location.hash\)/,
  );
  assert.match(manual, /open=\{Boolean\(sourceNote\)\}/);
  assert.match(manual, /\{sourceNote && \(/);
  assert.match(manual, /sourceNote.paragraphs.map/);
  assert.match(manual, /replace: true, state: location.state/);
  assert.match(manual, /heading.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.equal(declarations(".manual-source-note")["overflow-y"], "auto");
  assert.equal(
    declarations(".manual-source-note")["max-height"],
    "calc(100dvh - 40px)",
  );
});

test("the manual topic browser keeps accessible controls and automatically reveals cited answers", async () => {
  const manual = await readFile("src/pages/Manual.tsx", "utf8");
  const notes = await readFile(
    "src/components/workspace/CareerNotes.tsx",
    "utf8",
  );
  assert.match(manual, /<CareerNotes \/>/);
  assert.match(notes, /aria-expanded=\{view.expanded\}/);
  assert.match(notes, /aria-controls="manual-note-collection"/);
  assert.match(notes, /aria-label="Question topics"/);
  assert.match(notes, /if \(linkedView.openNote\) setView\(linkedView\)/);
  assert.match(notes, /getElementById\(linkedView.openNote\)/);
  assert.match(notes, /id=\{note.id\}/);
  assert.match(notes, /Featured questions/);
  assert.equal(
    declarations(".note-topics")["grid-template-columns"],
    "repeat(2, minmax(0, 1fr))",
  );
  assert.equal(declarations(".note-topic")["min-height"], "44px");
});

test("resume viewer state validates document navigation for Back, Forward, and reload", async () => {
  const result = await build({
    entryPoints: ["src/lib/resume.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  const { readResumeView } = await import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
  const view = { documentId: "academic", page: 2, returnPath: "/manual" };
  assert.deepEqual(
    readResumeView({ resumeViewer: view, unrelated: true }),
    view,
  );
  for (const state of [null, undefined, {}, { resumeViewer: true }])
    assert.equal(readResumeView(state), null);
  for (const patch of [
    { documentId: "other" },
    { page: 0 },
    { page: 1.5 },
    { page: 51 },
    { returnPath: "https://example.com" },
  ])
    assert.equal(readResumeView({ resumeViewer: { ...view, ...patch } }), null);
});

test("opening a resume keeps its page and only asking about an excerpt enters chat", async () => {
  const provider = await readFile(
    "src/components/workspace/ResumeProvider.tsx",
    "utf8",
  );
  const viewer = await readFile(
    "src/components/workspace/ResumeViewer.tsx",
    "utf8",
  );
  const opening = provider
    .split("const openResume =")[1]
    .split("const setPage =")[0];
  assert.match(opening, /navigate\(location,/);
  assert.match(opening, /replace: Boolean\(view\)/);
  assert.match(
    opening,
    /returnPath: view\?\.returnPath \?\? location.pathname/,
  );
  assert.doesNotMatch(opening, /activeConversationId/);
  assert.match(provider, /if \(view\) navigate\(-1\)/);
  assert.match(provider, /Return to the manual/);
  assert.match(provider, /originScroll.current.y/);
  assert.match(viewer, /fullscreen \? returnLabel : "Close resume"/);
  assert.match(
    provider.split("const quoteResume =")[1],
    /if \(location.pathname !== "\/"\)/,
  );
  assert.match(index, /replace: true, state: navigationState/);
});

test("resume controls open a lazy in-site viewer and quoted questions remain editable", async () => {
  const viewer = await readFile(
    "src/components/workspace/ResumeViewer.tsx",
    "utf8",
  );
  const provider = await readFile(
    "src/components/workspace/ResumeProvider.tsx",
    "utf8",
  );
  const chat = await readFile(
    "src/components/workspace/ConversationProvider.tsx",
    "utf8",
  );
  assert.match(layout, /lazy\(\(\) => import\("\.\/ResumeViewer"\)\)/);
  assert.match(viewer, /renderTextLayer/);
  assert.match(viewer, /layer\?\.contains\(selected.anchorNode\)/);
  assert.match(viewer, /layer.contains\(selected.focusNode\)/);
  assert.match(viewer, /Dialog.Root[\s\S]*?modal=\{fullscreen\}/);
  assert.match(viewer, /selection.length > resumeExcerptLimit/);
  assert.match(provider, /setDraftExcerpt\(excerpt\)/);
  assert.doesNotMatch(provider, /\bask\(/);
  assert.match(index, /Remove selected passage/);
  assert.match(chat, /questionWithExcerpt\(t.question, t.excerpt\)/);
  assert.match(
    chat,
    /turns.find\(\(turn\) => turn.id === replaceId\)\?\.excerpt/,
  );
  assert.match(viewer, /onCloseAutoFocus/);
  assert.match(viewer, /Download PDF/);
  assert.match(viewer, /Open PDF in new tab/);
  assert.equal(
    declarations(".user-question.has-excerpt")["flex-direction"],
    "column",
  );
});
