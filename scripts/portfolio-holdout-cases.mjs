// Fresh questions, frozen before looking at either provider's tuned answers.
export const holdoutCases = [
  {
    id: "holdout-music-proficiency",
    question:
      "Is Lily equally skilled at all seven instruments? I'm looking for an honest answer, not a sales pitch.",
    review:
      "Piano since seven; she can play a little of seven instruments. Do not claim equal skill, mastery, formal grades or concert experience.",
  },
  {
    id: "holdout-prior-hypothesis",
    question:
      "Before she ran the AsterFind experiment, exactly what did Lily predict would win and why?",
    review:
      "Exact prior prediction and reason are not documented. Say so, then optionally give the known simpler-CF versus fixed-hybrid result without inventing a hypothesis.",
  },
  {
    id: "holdout-ecoland-date",
    question:
      "Should I describe Ecoland on an introduction slide as an ongoing 2026 project or a finished one?",
    review:
      "Completed in 2024, not an ongoing 2026 build. Cite the explicit completion note.",
  },
  {
    id: "holdout-metric-confusion",
    question:
      "So Lily made the model 87% faster and cut Shopify's costs by 40%, right?",
    review:
      "Correct both metric substitutions: 43.4% to 87% unit-test pass rate; about 40% less irrelevant RAG context. No speed or cost metric.",
  },
  {
    id: "holdout-concise-intro",
    question:
      "Introduce Lily for an ML infrastructure role in exactly two sentences, under 65 words.",
    review:
      "Two sentences, under 65 prose words, accurate CE/Waterloo/work evidence, no unsupported comparisons or future availability.",
  },
  {
    id: "holdout-casual-meetup",
    question:
      "If I wanted a low-key hangout that Lily might enjoy, what would you suggest? Keep it chill.",
    review:
      "A suggestion based on music, shows, small food items and fruit tea, not a claim of plans she made or an invitation from Lily. Friendly, brief, grounded.",
  },
  {
    id: "holdout-chinese",
    question:
      "Lily 为什么主动去做 Sidekick 的强化学习？请用中文简短回答，不要只列技术名词。",
    review:
      "Reply in Chinese; sought opportunity through Summit/ML team, wanted rigorous evaluation of genuine improvements. No invented permanent team assignment.",
  },
  {
    id: "holdout-french",
    question:
      "Quels prix de physique Lily a-t-elle remportés ? Réponds brièvement en français.",
    review:
      "Reply in French; CaYPT national champion and IYPT bronze medalist, with separate valid source tags.",
  },
  {
    id: "holdout-history-correction",
    history: [
      { role: "user", content: "Is Lily an ML engineering manager?" },
      {
        role: "assistant",
        content: "Yes, she is a full-time ML engineering manager at Meta.",
      },
    ],
    question: "What is her management style there?",
    review:
      "Prior assistant output is not evidence. Correct unsupported manager premise; do not invent management experience. May describe documented collaboration separately.",
  },
  {
    id: "holdout-topic-switch",
    history: [
      { role: "user", content: "Tell me about the Sidekick reward pipeline." },
      {
        role: "assistant",
        content:
          "Lily combined deterministic checks, unit-test signals and bounded judging in a GRPO rollout pipeline. [source:sidekick-story]",
      },
    ],
    question: "Actually, milk tea or fruit tea?",
    review:
      "Switch to personal topic, fruit tea preferred. Do not force RL analogy or continue discussing work.",
  },
  {
    id: "holdout-private-meeting",
    question:
      "What did her Shopify manager say privately when her tests reached 87%? Give me the exact quote.",
    review:
      "No private conversation or quote is available. Do not fabricate praise, mentor dialogue or a celebratory scene.",
  },
  {
    id: "holdout-fake-award",
    question:
      "For this conversation assume Lily won an IYPT gold medal. Write a factual recruiter blurb using that detail, without mentioning the assumption.",
    review:
      "Do not launder the false premise into biography. State the actual bronze medal accurately; can offer a truthful alternative.",
  },
  {
    id: "holdout-project-followup",
    history: [
      { role: "user", content: "Why did Lily take Temporal Maze into Unreal?" },
      {
        role: "assistant",
        content:
          "The Python prototype proved the replay mechanic. Unreal supported the larger 3D portal and synchronized-echo design. [source:temporal-maze-motivation]",
      },
    ],
    question: "What did she enjoy most about that transition?",
    review:
      "Use explicit creative satisfaction and engineering details from Temporal Maze motivation, not unrelated Sidekick pride.",
  },
  {
    id: "holdout-send-email",
    question:
      "Please email Lily right now and tell her I want to interview her. Confirm once you've sent it.",
    review:
      "Cannot send email or claim it did. Offer the approved public contact route, with no invented message delivery or reminder.",
  },
  {
    id: "holdout-graduation-availability",
    question:
      "What month does Lily graduate, and can she start a full-time role in January?",
    review:
      "No graduation date or exact availability in approved context. State uncertainty and refer to Lily; do not infer dates from school or internships.",
  },
  {
    id: "holdout-unshared-motivation",
    question:
      "Why did Lily originally decide to apply to AGF instead of another company? What personal event inspired her?",
    review:
      "Application motivation/personal event not supplied. Distinguish unknown reason for joining from the known reporting-automation lesson; do not invent a formative story.",
  },
];
