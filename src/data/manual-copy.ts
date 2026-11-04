// Public copy uses Lily's voice; assistant reference notes stay in third person.
export const manualCopy: Record<string, { title: string; paragraphs: string[] }> = {
  "education-motivation": {
    title: "Why did I choose Computer Engineering?",
    paragraphs: [
      "Robotics was what first made computing click for me: changing code changed how a physical machine sensed its surroundings and behaved. I liked that Computer Engineering connected software with electronics, architecture, and embedded systems.",
      "I started in Electrical Engineering, then switched as my internships drew me toward software systems and ML. I still value the hardware foundation; I just wanted to spend more time on the problems I enjoyed most.",
    ],
  },
  "ai-motivation": {
    title: "What draws me to AI engineering?",
    paragraphs: [
      "I like figuring out what makes an intelligent system useful and reliable. Working on Sidekick showed me how many things can sit behind a bad answer: retrieval, reasoning, tool use, prompts, rewards, or the evaluation itself.",
      "That mix of software engineering and experimentation keeps me interested. I especially enjoy evaluation, reinforcement learning, retrieval, and building the infrastructure to measure whether a change actually helped.",
    ],
  },
  "sidekick-story": {
    title: "My first reinforcement learning project",
    paragraphs: [
      "Sidekick is still the work I'm proudest of. It was my first time working with reinforcement learning and training models. I wanted to get involved, so I reached out to Shopify's ML team and joined the project alongside my SWE work.",
      "I was drawn to the Analytics subagent's evaluation problem. Its answers could look convincing and still fail task-specific tests, and changing prompts wasn't giving us consistent improvements. I took ownership of the rollout and reward infrastructure to make that problem easier to investigate.",
      "After tightening retrieval and looking through failure cases, I built a pipeline that combined deterministic checks, unit-test signals, a bounded LLM judge, and GRPO training. The subagent's unit-test pass rate went from 43.4% to 87%. Separately, the retrieval work reduced irrelevant RAG context by about 40%.",
      "The part I enjoyed most was having a way to tell whether the agent was genuinely improving. It taught me to put as much care into the evaluation loop as the model itself.",
    ],
  },
  "sidekick-evaluation": {
    title: "Why not use an LLM judge for everything?",
    paragraphs: [
      "For Sidekick, I preferred deterministic checks whenever tool use or a unit test could verify the behavior directly. I wanted reward signals I could inspect and reproduce.",
      "The LLM judge had a smaller, bounded role for qualities those checks couldn't capture. Otherwise, we risked optimizing for another model's preferences instead of improving the agent. I worked on the rollout and reward infrastructure using GRPO and NeMo-RL.",
    ],
  },
  "shopify-product-story": {
    title: "What did I enjoy most at Shopify?",
    paragraphs: [
      "I loved working on technically complicated problems that made a visible difference for merchants. Quick Device Login for POS stands out: the scope changed late, and our small team had about a week to deliver before launch.",
      "We worked through authentication fallbacks and coordinated closely to get it ready. The finished flow cut device setup from roughly five minutes to under 30 seconds. Seeing all that engineering turn into a simpler moment in someone's day was very rewarding.",
    ],
  },
  "meta-motivation": {
    title: "Why did I pursue the Meta Engineering Fellowship?",
    paragraphs: [
      "After building product features, I wanted to understand more of what keeps them running: deployments, testing, observability, and the tools other engineers depend on. I joined as a Meta Engineering Fellow through the Meta and MLH partnership, with mentorship from Meta engineers.",
      "I particularly enjoyed replacing eight manual SSH deployment steps with a CI/CD workflow that ran in a few minutes. Diagnostics and tests were satisfying for the same reason: they helped us understand what broke instead of leaving us guessing.",
      "It also helped me understand what I want from infrastructure work. I enjoy it most when I can stay close to the product or ML system it supports.",
    ],
  },
  "agf-story": {
    title: "What shaped my approach to automation at AGF?",
    paragraphs: [
      "At AGF, I kept noticing people collecting the same information, transforming it, and producing similar reports. I started looking for the repeatable steps software could take off their hands.",
      "The systems I built saved more than 20 staff-hours a week. That experience changed what I notice: when a task keeps causing friction, I tend to ask whether a better interface or a little automation could help.",
    ],
  },
  "asterfind-motivation": {
    title: "Why did I build AsterFind?",
    paragraphs: [
      "I wanted to explore how much responsibility an LLM should have in a search product. Understanding a request is useful; inventing a product or getting its price wrong isn't. So I separated intent extraction from retrieval and ranking, with every result grounded in catalogue data.",
      "Evaluation turned out to be my favorite part. I used Recall, MRR, nDCG, chronological holdouts, and real-data checks to test the rankings. A simpler collaborative-filtering approach could beat a fixed hybrid when metadata was sparse. Understanding that result was more interesting to me than making the demo confirm my original idea.",
    ],
  },
  "temporal-maze-motivation": {
    title: "Why take Temporal Maze from Python to Unreal?",
    paragraphs: [
      "I liked the idea of solving a puzzle by interacting with my own past actions. The Python/Pygame version let me try the core mechanic: record actions, replay them, and let those echoes affect the present.",
      "Then I started imagining portals, platforming, and multiple synchronized echoes in a 3D space. Rebuilding in Unreal Engine 5 with C++ gave me room to explore that. Recording, interpolation, teleportation, collisions, and replay timing all became part of making the idea feel right. Taking it into a playable campaign was the most creatively satisfying part.",
    ],
  },
  "ecoland-motivation": {
    title: "What interested me about Ecoland?",
    paragraphs: [
      "I built Ecoland in 2024 because I wanted to see how simple rules could produce complicated ecosystem behavior. Energy, movement, reproduction, inherited traits, and predation all interact in ways that are hard to predict.",
      "Population logs and gene statistics let me investigate what was happening. A smarter individual wasn't always what mattered most: reproduction costs, resources, and interactions between species could change the whole population's trajectory. That's a big part of what I enjoy about simulations.",
    ],
  },
  "research-mindset": {
    title: "How has physics research shaped my engineering?",
    paragraphs: [
      "I loved how open-ended CaYPT and IYPT were. There was no answer key. I had to form a hypothesis, design an experiment, find flaws in my assumptions, and defend what I found.",
      "We each owned our assigned problems and did our own research in preparation. In a tournament stage, one student represented the team in each role, so I needed to understand my work well enough to respond to questions on the spot.",
      "That experience made me careful about results that just look convincing. I look for controlled variables, reproducibility, noise, and alternative explanations. It's the same instinct that drew me toward evaluation work in ML.",
    ],
  },
  "learning-approach": {
    title: "How do I learn an unfamiliar field?",
    paragraphs: [
      "I start by making a map of the field instead of trying to understand everything at once. With RL, that meant figuring out rollouts, rewards, GRPO, how trajectories reach training, and what NeMo-RL already provided.",
      "Then I connect the explanations to actual code and data. A small experiment, like inspecting one rollout or tracing an example through the pipeline, usually helps me find better questions. When I ask someone for help, I try to bring a specific uncertainty rather than ask them to explain the whole field.",
    ],
  },
  "engineering-judgment": {
    title: "When do I give an LLM less control?",
    paragraphs: [
      "In AsterFind, I didn't want the model generating recommendations directly. Prices, availability, and product attributes had to come from real data, and I wanted to be able to inspect the ranking.",
      "The model extracts structured intent, like a budget or a protein preference. Retrieval and personalization then determine which catalogue products appear. Giving the model a narrower job made the system easier to understand and evaluate.",
    ],
  },
  "collaboration": {
    title: "How do I work with a team?",
    paragraphs: [
      "I like owning a problem, but I don't want that to mean disappearing until it's finished. On Quick Device Login, our late scope change and short deadline made it important to agree on interfaces, split responsibilities, surface risks, and keep checking integration.",
      "I'm comfortable saying when I don't know something. I'll investigate enough to ask a useful question, then talk to someone with more context. When I'm the one helping, I try to explain the reasoning along with the fix.",
    ],
  },
  "delivery-judgment": {
    title: "How do I make tradeoffs under time pressure?",
    paragraphs: [
      "I try to separate what affects correctness and reliability from what would simply make the design cleaner. For Quick Device Activation, keeping the QR and manual-code fallbacks let us improve the common case without replacing every existing path at once.",
      "I'm looking for a change that delivers useful value and can be validated, observed, and rolled back if needed. The architecture has to fit the time and constraints we actually have.",
    ],
  },
  "large-codebase-approach": {
    title: "How do I find my way around a large codebase?",
    paragraphs: [
      "At Shopify, I worked on a GraphQL migration across multiple production codebases. The consumers had different dependencies and release timelines, so compatibility and rollout order mattered as much as changing the query.",
      "I worked through the dependency graph, preserved backward compatibility, added automated validation, and staged the rollout. It completed without regressions. I try to understand the consumers and contracts before treating a cross-system change as a local edit.",
    ],
  },
  "debugging-approach": {
    title: "How do I debug an unfamiliar problem?",
    paragraphs: [
      "First I try to reproduce the failure and describe exactly what's wrong. Then I inspect the relevant boundaries: requests, logs, metrics, database state, model traces, or hardware measurements. I prefer one small experiment that can disprove an idea to making several plausible changes at once.",
      "For AI systems, I look for patterns across failures. Retrieval, prompts, tools, model behavior, and evaluation can all produce similar symptoms. A representative test set and an instrumented pipeline help me work out which part needs attention.",
    ],
  },
  "testing-approach": {
    title: "What does useful testing look like to me?",
    paragraphs: [
      "I want passing tests to tell me something about how the system will behave in use. For deterministic software, I focus on contracts, edge cases, and failure paths. For AI systems, representative evaluation sets and metrics are part of the test design.",
      "I also like small experiments early. Finding out that an assumption is wrong gets more expensive the longer I build on top of it.",
    ],
  },
  "feedback-and-disagreement": {
    title: "How do I handle feedback and technical disagreement?",
    paragraphs: [
      "I'd rather get specific technical criticism than vague approval. Competitive physics helped me separate a challenge to an argument from a judgment of the person making it. In code review, a comment can reveal a bug or show me where my explanation needs work.",
      "I try to make disagreements testable: what are we each assuming, and what evidence would help us decide? A benchmark, a small prototype, or a failure-case test is usually more useful than debating who sounds more confident.",
    ],
  },
  "leadership-approach": {
    title: "How do I approach leadership?",
    paragraphs: [
      "I like being hands-on early so I understand the technical constraints. From there, I try to make the goal and ownership clear, and share enough context for people to make decisions without waiting for me.",
      "As a CaYPT captain, I helped teammates with their research and made sure I understood all their problems, not just my own. I wanted to be ready to step in if someone needed support or felt too nervous to present, within the tournament's speaking rules. We each owned our research, but we didn't have to prepare alone.",
    ],
  },
  "independent-projects": {
    title: "Why do I build outside work?",
    paragraphs: [
      "Personal projects give me room to follow questions that don't always fit an internship or a course. That might be search quality, agent evaluation, an ecosystem simulation, or a puzzle built around replaying past actions.",
      "Once a demo works, I usually want to know where it breaks and how to measure it. That's why AsterFind has ranking evaluations and Temporal Maze has automation tests. They're part of understanding what I built.",
    ],
  },
  "work-preferences": {
    title: "What kind of work brings out my best?",
    paragraphs: [
      "I like problems with technical depth and room to take ownership. I enjoy moving from understanding a problem to designing, building, and testing a system. Sidekick, AsterFind, and Temporal Maze all let me work across layers like that.",
      "I work best with clear priorities, direct communication, autonomy, and fast feedback. I appreciate people who challenge an idea without making the disagreement personal. If a task is repetitive, I want the chance to improve the process behind it.",
    ],
  },
  "career-direction": {
    title: "What I'd like to build next",
    paragraphs: [
      "I'm interested in software and ML engineering roles working on AI systems, developer infrastructure, or technically challenging products. I like teams where engineers can own a problem from the architecture through measuring how it works in production.",
      "I lean toward backend, systems, and ML work, but I also enjoy building enough of the frontend to deliver the whole workflow. Longer term, I'm interested in tools that help researchers, developers, and students do more.",
      "I want my work to show that I can pick up an unfamiliar domain and turn what I learn into something useful and measurable. For availability or a specific opportunity, please get in touch.",
    ],
  },
  "portfolio-agent": {
    title: "How I built this portfolio",
    paragraphs: [
      "I built this portfolio with React, TypeScript, and a server-side language-model API. I wanted visitors to be able to ask about my work and follow the answers back to the relevant projects, research, or notes.",
      "The assistant streams responses using approved context and source links. I compare models, tune prompts, and run regression tests to check the answers. If the API is unavailable, it can fall back to local notes. API keys stay on the server.",
      "It uses an existing language model; I haven't trained or fine-tuned its weights. I test factual grounding, privacy boundaries, and follow-up questions, but the assistant can still make mistakes.",
    ],
  },
};
