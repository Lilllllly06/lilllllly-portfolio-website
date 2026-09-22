import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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
  assert.match(layout, /const home = \(\) => \{\s+reset\(\);\s+close\(\);/);
  assert.match(
    layout,
    /<Link\s+to="\/"\s+onClick=\{home\}\s+className="workspace-brand"/,
  );
  assert.match(
    layout,
    /<Link to="\/" onClick=\{home\} className="topbar-owner"/,
  );
  assert.doesNotMatch(layout, /sessionStorage\.clear|localStorage\.clear/);
});

test("the puppy mark matches the favicon and keeps the gentle interaction-only tilt", async () => {
  const html = await readFile("index.html", "utf8");
  const icon = await readFile("public/favicon.svg", "utf8");
  assert.match(layout, /className="brand-symbol" aria-hidden="true"/);
  assert.match(
    layout,
    /<img src="\/favicon.svg\?v=puppy" width=\{32\} height=\{32\} alt="" \/>/,
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
  assert.equal(declarations(".brand-symbol img").width, "32px");
  assert.equal(declarations(".brand-symbol img").height, "32px");
  assert.equal(
    declarations(".brand-symbol img")["transform-origin"],
    "50% 90%",
  );
  assert.equal(
    declarations(".brand-symbol img").transition,
    "transform 220ms ease-out",
  );
  for (const interaction of ["hover", "focus-visible"])
    assert.equal(
      declarations(`.workspace-brand:${interaction} .brand-symbol img`)
        .transform,
      "rotate(-7deg)",
    );
  stylesheet.walkRules((rule) => {
    if (!rule.selector.includes(".brand-symbol img")) return;
    rule.walkDecls((declaration) => {
      if (!["transform", "transition"].includes(declaration.prop)) return;
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
  assert.match(manual, /<h1[^>]*>\s*Resume &amp; background\s*<\/h1>/);
  assert.match(manual, /<h2>Outside work<\/h2>/);
  assert.match(manual, /<h2>Get in touch<\/h2>/);
  assert.match(index, /<h1>\s*Meet/);
  assert.match(index, /<h2>Selected work<\/h2>/);
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
