import { createContext, useContext } from "react";
import type { ResumeDocumentId, ResumeExcerpt } from "@/lib/resume";

export const ResumeContext = createContext<{
  documentId: ResumeDocumentId | null;
  page: number;
  setPage: (page: number) => void;
  openResume: (id?: ResumeDocumentId, page?: number) => void;
  closeResume: () => void;
  returnLabel: string;
  quoteResume: (excerpt: ResumeExcerpt, fullscreen: boolean) => void;
  composerFocusRequest: number;
} | null>(null);

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) throw new Error("ResumeProvider is missing");
  return context;
}
