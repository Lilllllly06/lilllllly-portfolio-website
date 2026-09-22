export interface PersonalFact {
  id: string;
  topic: string;
  keywords: string[];
  detail: string;
}

// Only add facts Lily explicitly approves for her public portfolio assistant.
export const personalFacts: PersonalFact[] = [
  {
    id: "music",
    topic: "Music and instruments",
    keywords: [
      "music",
      "instrument",
      "piano",
      "violin",
      "recorder",
      "flute",
      "oboe",
      "harmonica",
      "guitar",
      "hobbies",
      "hobby",
      "outside engineering",
      "outside work",
    ],
    detail:
      "Lily started playing piano at seven and still plays today. She enjoys learning instruments and can play a little of seven instruments in total, including piano. The six others are violin, recorder, flute, oboe, harmonica, and guitar. No proficiency ranking or formal music grades have been shared. Listening to music on a speaker is one of her favorite ways to relax and switch off.",
  },
  {
    id: "japanese",
    topic: "Learning Japanese",
    keywords: [
      "japanese",
      "language learning",
      "hobbies",
      "hobby",
      "outside engineering",
      "outside work",
    ],
    detail: "Lily has been learning Japanese as a side hobby.",
  },
  {
    id: "weekends",
    topic: "A good weekend",
    keywords: [
      "weekend",
      "free time",
      "relax",
      "relaxing",
      "unwind",
      "friends",
      "hobbies",
      "hobby",
      "outside work",
      "outside engineering",
    ],
    detail:
      "An ideal weekend starts with her work and tasks finished, so she can enjoy time to herself. Lily likes staying home, but also going out with friends. One favorite ritual is ordering small food items from several shops, tasting a bit of everything, and enjoying it while watching shows or FaceTiming friends.",
  },
  {
    id: "food",
    topic: "Food and sweet things",
    keywords: [
      "eat",
      "food",
      "meal",
      "cuisine",
      "snack",
      "sweet",
      "dessert",
      "chicken",
      "nugget",
      "sauce",
      "asian",
      "italian",
      "french",
    ],
    detail:
      "Lily enjoys Asian, Italian, and French food and has a soft spot for sweet snacks and savory food with a little sweetness. Think soy-garlic Korean fried chicken and the sauce for McDonald's chicken nuggets. She likes sampling a little from several places instead of choosing just one.",
  },
  {
    id: "tea",
    topic: "Fruit tea over milk tea",
    keywords: ["eat", "food", "drink", "tea", "boba", "bubble", "cuisine"],
    detail:
      "Lily really likes bubble tea, but usually chooses fruit teas rather than milk tea.",
  },
];

export const assistantVoice = {
  tone: "For personal topics, be friendly, casual, playful, and lightly witty; the conversation should feel relaxing. For work topics, be professional, thoughtful, and specific. Match the subject naturally without announcing a change of tone. Never exaggerate facts to make a joke.",
  examples: [
    {
      question: "What does Lily like to eat?",
      answer:
        "Asian, Italian, and French food all make the list, especially anything with a little sweetness. Soy-garlic Korean fried chicken is a good example. Her ideal order might involve a few different shops, because choosing just one is apparently unnecessary. [source:personal-food]",
    },
    {
      question: "Milk tea or fruit tea?",
      answer:
        "Fruit tea. She loves bubble tea, but usually skips the milk-tea route. [source:personal-tea]",
    },
    {
      question: "What is her favorite movie?",
      answer:
        "She hasn't shared a favorite movie with me, so I won't invent one. That's a good question to ask Lily herself.",
    },
    {
      question: "Is she good at AI?",
      answer:
        "There is concrete work to point to: at Shopify, she built an agentic RL pipeline that raised a Sidekick subagent test pass rate from 43.4% to 87%. [source:shopify-2026] AsterFind shows her work on personalized retrieval. [source:asterfind] She also built this AI-powered portfolio, combining streamed responses, approved source material, and answer-quality checks. [source:portfolio-agent]",
    },
  ],
};
