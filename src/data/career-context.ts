// Public context supplied by Lily, edited for clarity without adding claims.
export const careerContext = [
  {
    id: "education-motivation",
    title: "Why did Lily choose Computer Engineering?",
    href: "/manual#education-motivation",
    kind: "Perspective",
    paragraphs: [
      "Robotics first made computing tangible for Lily: changing code changed how a physical machine sensed its environment and behaved. Computer Engineering appealed to her because it connects software with embedded systems, computer architecture, electronics, and hardware-software interaction.",
      "She originally entered Electrical Engineering, then moved to Computer Engineering as internships reinforced her interest in software systems and ML. The change aligned her studies with the problems she most enjoyed while preserving the lower-level systems and hardware foundation she values.",
    ],
  },
  {
    id: "ai-motivation",
    title: "What draws Lily to AI engineering?",
    href: "/manual#ai-motivation",
    kind: "Perspective",
    paragraphs: [
      "Lily is interested in making intelligent systems reliable enough to be useful, not simply generating model output. Sidekick made that concrete: a failure could originate in retrieval, reasoning, tool usage, prompts, reward design, or even the evaluation itself.",
      "She enjoys that combination of software engineering, experimentation, and uncertainty. Agent evaluation, reinforcement learning, retrieval, and the infrastructure that makes model behavior measurable are especially appealing to her.",
    ],
  },
  {
    id: "sidekick-story",
    title: "Sidekick: learning RL through a reliability problem",
    href: "/about#sidekick-story",
    kind: "Experience",
    paragraphs: [
      "Lily considers her Shopify Sidekick work her proudest achievement. It was her first experience with reinforcement learning and training models.",
      "She sought out the opportunity herself. Her SWE role did not usually give her direct access to Sidekick work, so she reached out to the ML team through Shopify Summit's opportunity to join other teams and projects.",
      "During Hack Days, she gravitated toward RL and evaluation for an analytics-subagent prototype. What excited her was the question of how to tell whether an agent is genuinely getting better, rather than simply producing more convincing-looking answers. She took ownership of the rollout and reward infrastructure, combining systems engineering with experimentation and measuring how changes affected agent behavior. This was Hack Days prototype work, not a documented production launch.",
      "The analytics agent could produce plausible-looking answers that still failed task-specific tests, and prompt changes alone were not giving consistent improvements. She tightened retrieval, analyzed failure cases, and introduced more structured evaluation.",
      "The biggest improvement came from a custom rollout and reward pipeline combining deterministic checks, unit-test signals, a bounded LLM judge, and GRPO training. This helped distinguish genuine capability improvements from answers that merely looked better. The agent's unit-test pass rate rose from 43.4% to 87%. The roughly 40% reduction in irrelevant RAG context is a separate retrieval result, not a latency or cost reduction.",
      "What she found especially rewarding was turning a fuzzy AI problem into something rigorous, testable, and iterative. Her main lesson: improving the evaluation loop can be just as important as improving the model itself.",
    ],
  },
  {
    id: "sidekick-evaluation",
    title: "Why not use an LLM judge for everything?",
    href: "/manual#sidekick-evaluation",
    kind: "Perspective",
    paragraphs: [
      "In the Sidekick Hack Days prototype, Lily preferred deterministic reward signals wherever correct tool use or unit-test results could verify behavior directly. Inspectable, reproducible checks made it easier to distinguish real improvements from convincing-looking answers.",
      "A bounded model-based judge had a deliberately limited role for qualities those checks could not capture. An unconstrained judge introduces another probabilistic system: optimizing for its preferences or inconsistencies is not necessarily improving the agent. Her contribution was rollout and reward infrastructure using GRPO and NeMo-RL, not inventing GRPO.",
    ],
  },
  {
    id: "shopify-product-story",
    title: "What did Lily enjoy most at Shopify?",
    href: "/manual#shopify-product-story",
    kind: "Perspective",
    paragraphs: [
      "What Lily enjoyed most at Shopify was the combination of technical depth and tangible merchant impact. Quick Device Login for POS stands out: the scope changed late, and a small team had roughly a week to deliver a reliable solution before launch.",
      "The team worked through authentication fallbacks, coordinated closely, and reduced a device setup flow from roughly five minutes to under 30 seconds. For Lily, the rewarding part was seeing a complicated backend and product problem become something that made a merchant's day noticeably easier. She especially valued the ownership, collaboration, and direct user impact.",
    ],
  },
  {
    id: "meta-motivation",
    title: "Why did Lily pursue the Meta Engineering Fellowship?",
    href: "/manual#meta-motivation",
    kind: "Perspective",
    paragraphs: [
      "Lily's title was Meta Engineering Fellow in a fellowship run in partnership by Meta and Major League Hacking (MLH), with mentorship from Meta engineers. After building product features, she wanted to understand the layer underneath: deployment, testing, observability, and the systems that help other engineers work effectively. That curiosity led her to pursue the fellowship.",
      "She particularly enjoyed reliability work, including replacing eight manual SSH deployment steps with a CI/CD workflow that could run the same process safely in a few minutes. Diagnostics and tests were satisfying because they helped explain why something broke instead of leaving the team guessing.",
      "The experience also clarified her preferences. She values infrastructure work most when she can stay connected to the product or ML system it enables, rather than making operations her entire role.",
    ],
  },
  {
    id: "agf-story",
    title: "What shaped Lily's approach to automation at AGF?",
    href: "/manual#agf-story",
    kind: "Perspective",
    paragraphs: [
      "At AGF, Lily noticed people repeatedly collecting information, transforming it, and producing similar reports. Rather than accepting that repetition as inevitable, she looked for deterministic steps that software could automate.",
      "The resulting systems saved more than 20 staff-hours each week. It was an early, concrete example of engineering giving people time back, and it changed how she notices opportunities: repeated friction now makes her ask whether a better interface, abstraction, or automation could remove it.",
    ],
  },
  {
    id: "asterfind-motivation",
    title: "Why did Lily build AsterFind?",
    href: "/manual#asterfind-motivation",
    kind: "Perspective",
    paragraphs: [
      "AsterFind began with technical curiosity: how much responsibility should an LLM have in a search product? Lily wanted natural-language understanding without invented products, incorrect prices, or recommendations that could not be explained.",
      "She separated structured intent extraction from retrieval and ranking. The model interprets the request; catalogue data, BM25, TF-IDF, personalization, collaborative filtering, constraints, and ranking signals determine the actual results.",
      "Evaluation was her favorite part. She used Recall, MRR, nDCG, chronological holdouts, and real-data sanity checks rather than treating convincing-looking results as proof. A simpler collaborative-filtering approach could outperform a fixed hybrid when metadata was sparse. She valued preserving and understanding that negative result more than making the demo support her original hypothesis.",
    ],
  },
  {
    id: "temporal-maze-motivation",
    title: "Why take Temporal Maze from Python to Unreal?",
    href: "/manual#temporal-maze-motivation",
    kind: "Perspective",
    paragraphs: [
      "Lily liked the idea of solving puzzles by interacting with her own past actions. The Python/Pygame prototype proved the central mechanic: record actions, replay them, and let those echoes affect the present puzzle.",
      "She then imagined that mechanic in a 3D environment with portals, platforming, physical spaces, and multiple synchronized echoes. Rebuilding in Unreal Engine 5 with C++ made more sense than stretching the original prototype beyond its purpose.",
      "The transition was the most creatively satisfying part. Fixed-rate recording, interpolation, teleport discontinuities, portal velocity transformations, collisions, and synchronized replay actors made the creative idea inseparable from the engineering. She enjoyed taking it through reusable components, automated tests, persistent state, connected trials, and a playable campaign rather than stopping at a proof of concept.",
    ],
  },
  {
    id: "ecoland-motivation",
    title: "What interested Lily about Ecoland?",
    href: "/manual#ecoland-motivation",
    kind: "Perspective",
    paragraphs: [
      "Ecoland was completed in 2024. It is a completed project, not an ongoing build.",
      "Lily built Ecoland to explore emergence: how simple local rules for energy, movement, reproduction, predation, inherited traits, and the environment can produce complex ecosystem behavior.",
      "Procedural terrain, multiple species, inherited genes, optional neural-network-driven behavior, population logging, and gene statistics made it possible to observe the system rather than simply watch an animation.",
      "She found that an individual agent's intelligence was not always the dominant factor. Reproduction costs, energy efficiency, resource availability, and interactions between species could change an entire population trajectory. That uncertainty is part of what she enjoys about simulation and ML: local mechanisms can produce global behavior that is difficult to predict.",
    ],
  },
  {
    id: "research-mindset",
    title: "How did physics research shape her engineering?",
    href: "/manual#research-mindset",
    kind: "Perspective",
    paragraphs: [
      "Lily especially enjoyed experimental physics through CaYPT and IYPT because the problems were genuinely open-ended. There was no answer key: her team had to form hypotheses, design experiments, find flaws in its assumptions, and defend its conclusions.",
      "That experience taught her not to trust a result simply because it looks convincing. She looks for reproducibility, controlled variables, noise, confounding factors, and alternative explanations.",
      "She brings the same mindset to ML. A few successful examples are not enough; she wants to understand what changed and whether the improvement survives repeated evaluation. That connection helped draw her toward Sidekick's evaluation infrastructure.",
    ],
  },
  {
    id: "learning-approach",
    title: "How does Lily learn an unfamiliar field?",
    href: "/manual#learning-approach",
    kind: "Perspective",
    paragraphs: [
      "Lily starts by building a map of a new field, not by trying to understand everything at once. With RL, she first mapped the basic objects: rollouts, rewards, GRPO, how trajectories reach training, and which parts were custom versus provided by NeMo-RL.",
      "She reads foundational explanations, then moves into the implementation to connect abstract ideas to actual code and data. Running a small experiment early, such as inspecting one rollout or tracing one example through the pipeline, helps her discover the right questions.",
      "When she asks for help, she tries to bring a precise uncertainty rather than a broad request to explain an entire field. Her approach combines independent investigation, small experiments, and targeted conversations with people who have deeper context.",
    ],
  },
  {
    id: "engineering-judgment",
    title: "When does Lily choose to give an LLM less control?",
    href: "/manual#engineering-judgment",
    kind: "Perspective",
    paragraphs: [
      "In AsterFind, Lily deliberately avoided letting the LLM generate product recommendations directly. That would have made an impressive-looking demo, but availability, price, ratings, and product attributes needed to be grounded in real data, and ranking needed to remain inspectable.",
      "Instead, the model extracts structured intent, such as a breakfast category, budget, and protein or sugar preferences. Every displayed product must come from the catalogue, and explicit retrieval and personalization signals determine ranking.",
      "Giving the model less control made the system more auditable and easier to evaluate. It reinforced her view that adding AI to more parts of a system does not automatically make the system better.",
    ],
  },
  {
    id: "collaboration",
    title: "How does Lily work with a team?",
    href: "/manual#collaboration",
    kind: "Perspective",
    paragraphs: [
      "Lily is comfortable owning a well-defined problem independently, but she does not equate independence with disappearing until the solution is finished. On Shopify's Quick Device Login work, a late scope change and roughly one-week deadline made coordination essential: splitting responsibilities, agreeing on interfaces, surfacing risks early, and checking integration throughout.",
      "She is comfortable acknowledging gaps in her knowledge. In a large codebase, she prefers investigating enough to form a precise question and then consulting someone with context over quietly relying on an untested assumption.",
      "When helping teammates, she tries to explain the reasoning as well as the fix. She values teams where knowledge is shared rather than concentrated around whoever first built a component.",
    ],
  },
  {
    id: "delivery-judgment",
    title: "How does Lily make tradeoffs under time pressure?",
    href: "/manual#delivery-judgment",
    kind: "Perspective",
    paragraphs: [
      "Lily separates correctness and reliability from changes that would merely make a design cleaner or more general. On Quick Device Activation, preserving QR and manual-code fallbacks let the team improve the common case without requiring the optimized flow to replace every existing mechanism at once.",
      "She aims for the smallest change that delivers meaningful value with appropriate validation, observability, and fallback behavior. Good judgment means fitting the actual constraints, not choosing the most technically impressive architecture.",
    ],
  },
  {
    id: "large-codebase-approach",
    title: "How does she navigate a large codebase?",
    href: "/manual#large-codebase-approach",
    kind: "Perspective",
    paragraphs: [
      "At Shopify, Lily worked on a GraphQL migration spanning multiple production codebases. Consumers had different dependencies and release timelines, so the challenge included compatibility and rollout order, not just changing a query.",
      "She worked through the dependency graph, preserved backward compatibility, added automated validation, and staged the rollout. The migration completed without regressions. Her approach is to understand the consumers and contracts before treating a cross-system change as a local edit.",
    ],
  },
  {
    id: "debugging-approach",
    title: "How does Lily debug an unfamiliar problem?",
    href: "/manual#debugging-approach",
    kind: "Perspective",
    paragraphs: [
      "Lily narrows the problem before changing the system. She starts by reproducing the failure and defining what is wrong in observable terms, then inspects boundaries through API requests, logs, metrics, test outputs, database state, model traces, or hardware measurements. She prefers the smallest experiment that can disprove a hypothesis to several plausible changes made at once.",
      "For AI systems, she reasons about failure classes and distributions, not just one incorrect output. Retrieval, prompts, tool interfaces, model behavior, and evaluation can produce similar symptoms. Representative test sets and instrumented pipelines help identify which part is responsible before changing the prompt or model.",
    ],
  },
  {
    id: "testing-approach",
    title: "What does meaningful testing look like to her?",
    href: "/manual#testing-approach",
    kind: "Perspective",
    paragraphs: [
      "Lily treats testing as part of system design. For deterministic software, she focuses on important contracts, edge cases, and failure paths. For AI systems, representative evaluation sets and metrics become part of the test architecture because behavior is probabilistic.",
      "She wants tests close enough to real workflows that passing them means something useful. Instrumentation and small experiments also make it inexpensive to discover an assumption is wrong before committing to a larger implementation.",
    ],
  },
  {
    id: "feedback-and-disagreement",
    title: "How does she handle feedback and technical disagreement?",
    href: "/manual#feedback-and-disagreement",
    kind: "Perspective",
    paragraphs: [
      "Lily prefers specific technical criticism to vague approval. Competitive physics taught her to separate criticism of an argument from criticism of its author. In code review, a comment may expose a real problem or show that the implementation or explanation needs to be clearer.",
      "She tries to turn disagreement into a testable question: identify the assumptions, then find evidence that distinguishes them. A benchmark, small prototype, or failure-case test is more useful to her than settling a technical debate through seniority or confidence. This describes her approach, not a specific conflict with a manager or coworker.",
    ],
  },
  {
    id: "leadership-approach",
    title: "How does Lily approach leadership?",
    href: "/manual#leadership-approach",
    kind: "Perspective",
    paragraphs: [
      "Lily is hands-on early so she can understand the technical constraints, but she does not see leadership as centralizing every decision. She aims to clarify the outcome, divide the problem into areas with clear ownership, and share enough context for teammates to make decisions independently.",
      "Her experience as a CaYPT team captain reinforced the value of constructive challenge: technical disagreement is productive when everyone is improving the explanation rather than defending ownership of an idea.",
    ],
  },
  {
    id: "independent-projects",
    title: "Why build outside work, and when is a project finished?",
    href: "/manual#independent-projects",
    kind: "Perspective",
    paragraphs: [
      "Personal projects let Lily investigate architectural questions that may not fit coursework or internships, from search quality and agent evaluation to simulations, temporal game mechanics, and visualization. She chooses them out of curiosity about the system, not just to add another framework to her resume.",
      "A working demo is a starting point. She wants to understand behavior beyond the happy path through tests, benchmarks, reproducible setup, failure instrumentation, or independently testable components. AsterFind's ranking evaluation and Temporal Maze's automation tests reflect that approach.",
    ],
  },
  {
    id: "work-preferences",
    title: "What kind of work brings out her best?",
    href: "/manual#work-preferences",
    kind: "Perspective",
    paragraphs: [
      "Lily is energized by ambiguity, technical depth, ownership, and measurable outcomes. She enjoys moving between understanding a problem, designing a system, implementing it, and testing whether it works. Sidekick, AsterFind, and Temporal Maze all gave her room to work across layers rather than remain inside one narrow component.",
      "She can do operational work when it is needed, but prolonged repetitive or reactive work is less energizing when she has no opportunity to improve the underlying process.",
      "Her preferred environment combines high trust, direct communication, clear priorities, autonomy, and fast feedback. She appreciates teammates who challenge ideas without making disagreement personal.",
    ],
  },
  {
    id: "career-direction",
    title: "What Lily wants to build next",
    href: "/manual#direction",
    kind: "Goals",
    paragraphs: [
      "Lily is interested in software engineering and ML engineering roles focused on AI systems, developer infrastructure, or technically challenging products. She enjoys combining systems thinking with rapid experimentation, and teams where engineers own problems from architecture and implementation through measuring how they work in production.",
      "She leans toward backend, systems, and ML-intensive work, while remaining comfortable building the frontend to understand and deliver an end-to-end workflow. Longer term, she is interested in intelligent tools that expand what researchers, developers, and students can do, rather than pursuing one fixed job title.",
      "She wants recruiters to remember her ability to learn unfamiliar domains quickly and turn that learning into measurable improvements. Her focus is on making systems measurable, reliable, and extensible, beyond getting a demo to work. These interests do not establish a particular start date or current availability; contact Lily for those details.",
    ],
  },
];

export const assistantBoundaries = [
  "Discuss only intentionally public resume, portfolio, GitHub, published research, approved personal facts, and the high-level technologies and outcomes Lily has chosen to disclose.",
  "Do not disclose or infer confidential or nonpublic information from Shopify, Meta/MLH, AGF, or other employers. This includes internal source code, unreleased product details, undisclosed metrics, merchant or customer data, internal documents, roadmaps, security details, and private coworker conversations.",
  "Redirect requests for private contact or account information; nonpublic family, relationships, health, or finances; confidential recruiting or interview materials; unexpressed opinions about specific people or employers; and speculation about why another person or company made a decision. Lily's explicitly shared work preferences are not permission to invent opinions about colleagues or employers.",
  "When a question crosses these boundaries or requires an invented detail, say that Lily can answer personally if she chooses. Do not imply that contacting her guarantees disclosure. Never fill a gap with a plausible anecdote.",
  "Lily has not supplied specific stories about her biggest professional failure, a production outage, a missed deadline, a conflict with a manager or coworker, or her hardest Shopify bug. Her general debugging, feedback, and delivery principles do not establish that any such incident occurred. Exact user or merchant counts and revenue attributable to her projects have not been provided either; acknowledge those gaps without inventing figures.",
];
