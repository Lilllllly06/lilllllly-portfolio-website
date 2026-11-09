import type { PortfolioAnswer } from "../src/lib/portfolio-answer.js";

export const retentionReply = "I'm not sure about the site's full data retention policy.";

const chatSubject = /\b(?:(?:my|our|this|these|visitors?['\u2019])\s+(?:chat(?: history)?|conversations?|messages?|prompts?|questions?|inputs?|data)|the (?:questions i ask|messages i send|chat history)|what (?:i|we) (?:type|ask|send))\b/i;
const retentionAction = /\b(?:sav(?:e[ds]?|ing)|stor(?:e[ds]?|ing|age)|retain(?:ed|s|ing)?|retention|log(?:s|ged|ging)?|ke(?:ep(?:s|ing)?|pt)|record(?:s|ed|ing)?|delet(?:e[ds]?|ing)|private|privacy)\b/i;
const directRetention = /\b(?:privacy (?:policy|notice)|(?:this (?:chat|site)|you) (?:sav(?:e|es)|stor(?:e|es)|log(?:s)?|retain(?:s)?|keep(?:s)?|record(?:s)?) (?:chat history|messages|questions|prompts)|(?:what happens to|can lily see) (?:my|our|these) (?:chat|messages|questions|prompts))\b/i;

export function answerChatRetention(question: string): PortfolioAnswer | undefined {
  if (question.length > 240 || !(directRetention.test(question) || (chatSubject.test(question) && retentionAction.test(question)))) return;
  return {
    title: "Chat data retention",
    intro: retentionReply,
    sections: [],
    sources: [],
    followUps: [],
    mode: "portfolio",
  };
}
