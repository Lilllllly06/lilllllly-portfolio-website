import { useCallback, useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MessageCircle,
  RotateCcw,
  TextSelect,
  X,
} from "lucide-react";
import {
  normalizeResumeSelection,
  resumeDocuments,
  resumeExcerptLimit,
  type ResumeDocumentId,
} from "@/lib/resume";
import { useResume } from "./resume-context";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function ResumeViewer() {
  const {
    documentId,
    page,
    setPage,
    openResume,
    closeResume,
    returnLabel,
    quoteResume,
  } = useResume();
  const [fullscreen, setFullscreen] = useState(
    () => window.matchMedia("(max-width: 999px)").matches,
  );
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selection, setSelection] = useState("");
  const [textView, setTextView] = useState(false);
  const [pageText, setPageText] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const scroll = useRef<HTMLDivElement | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );
  const measureScroll = useCallback((element: HTMLDivElement | null) => {
    scroll.current = element;
    setScrollElement(element);
  }, []);
  const pageElement = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const doc = resumeDocuments[documentId!];
  useEffect(() => {
    let cancelled = false;
    let url = "";
    setDownloadUrl("");
    if (pdf)
      void pdf
        .getData()
        .then((bytes) => {
          if (cancelled) return;
          url = URL.createObjectURL(
            new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          );
          setDownloadUrl(url);
        })
        .catch(() => {
          if (!cancelled)
            setError(
              "Download unavailable. You can open the PDF in a new tab.",
            );
        });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [pdf]);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 999px)");
    const update = () => setFullscreen(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const element = scrollElement;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setWidth(Math.max(240, element.clientWidth - 32)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollElement]);
  useEffect(() => {
    setSelection("");
    setPageText("");
    scroll.current?.scrollTo({ top: 0, left: 0 });
    let cancelled = false;
    if (pdf)
      void pdf
        .getPage(page)
        .then((item) => item.getTextContent())
        .then((content) => {
          if (!cancelled)
            setPageText(
              content.items
                .map((item) =>
                  "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
                )
                .join(""),
            );
        })
        .catch(() => {
          if (!cancelled)
            setError("Text could not be loaded. Reopen the PDF to try again.");
        });
    return () => {
      cancelled = true;
    };
  }, [pdf, page]);
  useEffect(() => {
    if (textView) return;
    const update = () => {
      const selected = window.getSelection();
      const layer = pageElement.current?.querySelector(".textLayer");
      if (
        selected?.rangeCount &&
        layer?.contains(selected.anchorNode) &&
        layer.contains(selected.focusNode)
      ) {
        setSelection(normalizeResumeSelection(selected.toString()));
      } else setSelection("");
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [textView]);
  const attach = () => {
    if (!selection || selection.length > resumeExcerptLimit) return;
    quoteResume({ documentId: documentId!, page, text: selection }, fullscreen);
    setSelection("");
    window.getSelection()?.removeAllRanges();
  };
  return (
    <Dialog.Root
      open
      modal={fullscreen}
      onOpenChange={(open) => {
        if (!open) closeResume();
      }}
    >
      <Dialog.Portal>
        <Dialog.Content
          className="resume-panel"
          aria-describedby={undefined}
          onInteractOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeButton.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <header className="resume-panel-header">
            <Dialog.Title className="sr-only">Resume viewer</Dialog.Title>
            <FileText size={18} aria-hidden="true" />
            <select
              aria-label="Resume document"
              value={documentId!}
              onChange={(event) =>
                openResume(event.target.value as ResumeDocumentId)
              }
            >
              {Object.entries(resumeDocuments).map(([id, item]) => (
                <option key={id} value={id}>
                  {item.title}
                </option>
              ))}
            </select>
            <div className="resume-file-actions">
              <a
                className="icon-button"
                title="Download PDF"
                aria-label="Download PDF"
                aria-disabled={!downloadUrl}
                href={downloadUrl || undefined}
                download={doc.url.split("/").pop()}
                onClick={(event) => {
                  if (!downloadUrl) event.preventDefault();
                }}
              >
                <Download size={18} />
              </a>
              <a
                className="icon-button"
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                title="Open PDF in new tab"
                aria-label="Open PDF in new tab"
              >
                <ArrowUpRight size={18} />
              </a>
              <button
                ref={closeButton}
                className="icon-button"
                onClick={closeResume}
                title={fullscreen ? returnLabel : "Close resume"}
                aria-label={fullscreen ? returnLabel : "Close resume"}
              >
                {fullscreen ? <ArrowLeft size={18} /> : <X size={18} />}
              </button>
            </div>
          </header>
          <div className="resume-toolbar">
            <div className="resume-page-controls">
              <button
                className="icon-button"
                aria-label="Previous PDF page"
                title="Previous page"
                disabled={!pdf || page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={17} />
              </button>
              <label className="sr-only" htmlFor="resume-page">
                Page
              </label>
              <select
                id="resume-page"
                value={page}
                disabled={!pdf}
                onChange={(event) => setPage(Number(event.target.value))}
              >
                {Array.from({ length: pdf?.numPages || 1 }, (_, index) => (
                  <option key={index} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <span>/ {pdf?.numPages || "-"}</span>
              <button
                className="icon-button"
                aria-label="Next PDF page"
                title="Next page"
                disabled={!pdf || page >= pdf.numPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={17} />
              </button>
            </div>
            <div className="resume-view-controls">
              <select
                aria-label="PDF zoom"
                value={zoom}
                disabled={textView}
                onChange={(event) => {
                  setSelection("");
                  setZoom(Number(event.target.value));
                }}
              >
                <option value={1}>Fit width</option>
                <option value={1.25}>125%</option>
                <option value={1.5}>150%</option>
                <option value={2}>200%</option>
              </select>
              <button
                className="icon-button"
                aria-label={
                  textView ? "Switch to PDF view" : "Switch to text view"
                }
                title={textView ? "PDF view" : "Text view"}
                aria-pressed={textView}
                onClick={() => {
                  setSelection("");
                  setTextView(!textView);
                }}
              >
                {textView ? <FileText size={18} /> : <TextSelect size={18} />}
              </button>
            </div>
          </div>
          <div
            ref={measureScroll}
            className="resume-scroll"
            tabIndex={0}
            aria-label={`${doc.title} pages`}
          >
            <Document
              key={`${documentId}-${retry}`}
              file={doc.url}
              externalLinkTarget="_blank"
              externalLinkRel="noreferrer noopener"
              onLoadSuccess={(document) => {
                setPdf(document);
                setPage(Math.min(page, document.numPages));
              }}
              onLoadError={() => setError("The PDF could not be loaded.")}
              loading={
                <p className="resume-loading" role="status">
                  Opening {doc.title.toLowerCase()}...
                </p>
              }
              error={
                <div className="resume-load-error">
                  <p>The PDF could not be loaded.</p>
                  <button
                    className="text-action"
                    onClick={() => {
                      setPdf(null);
                      setError("");
                      setRetry((count) => count + 1);
                    }}
                  >
                    <RotateCcw size={16} />
                    Try again
                  </button>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    Open PDF in new tab <ArrowUpRight size={15} />
                  </a>
                </div>
              }
            >
              {textView ? (
                <textarea
                  className="resume-text-view"
                  aria-label={`${doc.title}, page ${page} text`}
                  readOnly
                  value={pageText}
                  onSelect={(event) => {
                    const input = event.currentTarget;
                    setSelection(
                      normalizeResumeSelection(
                        input.value.slice(
                          input.selectionStart,
                          input.selectionEnd,
                        ),
                      ),
                    );
                  }}
                />
              ) : (
                width > 0 && (
                  <div ref={pageElement} className="resume-page">
                    <Page
                      pageNumber={page}
                      width={width * zoom}
                      renderTextLayer
                      renderAnnotationLayer
                      onRenderError={() =>
                        setError(
                          "This page could not be rendered. Try text view or open the PDF in a new tab.",
                        )
                      }
                      loading={
                        <p className="resume-loading" role="status">
                          Rendering page {page}...
                        </p>
                      }
                    />
                  </div>
                )
              )}
            </Document>
          </div>
          <footer className="resume-selection-bar">
            <span role="status">
              {selection.length > resumeExcerptLimit
                ? `Choose up to ${resumeExcerptLimit.toLocaleString()} characters.`
                : selection
                  ? `${selection.length} characters selected`
                  : error || "No text selected"}
            </span>
            <button
              className="resume-ask"
              disabled={!selection || selection.length > resumeExcerptLimit}
              onPointerDown={(event) => event.preventDefault()}
              onClick={attach}
            >
              <MessageCircle size={17} />
              Ask about this
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
