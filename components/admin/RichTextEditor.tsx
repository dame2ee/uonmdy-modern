"use client";

import { useRef, useState, type ClipboardEvent } from "react";
import { FieldError, FieldHelp, FieldLabel } from "@/components/admin/FieldShell";
import type { FieldDef } from "@/lib/admin/resources";
import { uploadImage } from "@/lib/admin/upload-client";
import { sanitizeHtml } from "@/lib/sanitize-html";

/**
 * Visual editor for the body columns. Staff write and format text the way they
 * would in a word processor; the HTML is kept in a hidden input so the existing
 * server action and database columns are untouched.
 */

type Props = {
  field: FieldDef;
  defaultValue: string;
  error?: string;
};

const toolbarButton =
  "rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-body transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-50";

const BLOCK_BUTTONS: { label: string; title: string; block: string }[] = [
  { label: "Paragraph", title: "Normal paragraph", block: "<p>" },
  { label: "Heading", title: "Large heading", block: "<h2>" },
  { label: "Subheading", title: "Smaller heading", block: "<h3>" },
  { label: "Quote", title: "Indented quote", block: "<blockquote>" },
];

const TABLE_HTML =
  "<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead>" +
  "<tbody><tr><td>Text</td><td>Text</td></tr><tr><td>Text</td><td>Text</td></tr></tbody></table>";

function normaliseLink(value: string): string {
  const url = value.trim();
  if (!url) return "";
  if (/^[/#]/.test(url) || /^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  return `https://${url}`;
}

export default function RichTextEditor({ field, defaultValue, error }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const initialHtml = useRef(defaultValue);

  const [panel, setPanel] = useState<"link" | "photo" | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function sync() {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  function rememberSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer)) return;
    savedRange.current = range.cloneRange();
  }

  /** Falls back to the end of the text when the caret is not inside the editor. */
  function ensureSelection() {
    const editor = editorRef.current;
    if (!editor) return;

    const range = savedRange.current;
    if (range && editor.contains(range.startContainer)) return;

    const next = document.createRange();
    next.selectNodeContents(editor);
    next.collapse(false);
    savedRange.current = next;
  }

  function restoreSelection() {
    const range = savedRange.current;
    if (!range) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  /** Toolbar buttons keep the caret inside the editor before running a command. */
  function exec(command: string, value?: string) {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    ensureSelection();
    restoreSelection();
    document.execCommand(command, false, value);
    sync();
    rememberSelection();
  }

  async function sendFile(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const url = await uploadImage(file);
      insertPhoto(url);
      setPanel(null);
    } catch (uploadError) {
      setMessage(uploadError instanceof Error ? uploadError.message : "The upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function insertPhoto(url: string) {
    const src = url.trim();
    if (!src) return;
    exec("insertHTML", `<img src="${src}" alt="">`);
  }

  function insertLink() {
    const url = normaliseLink(linkUrl);
    if (!url) return;

    const range = savedRange.current;
    const hasSelection = range ? !range.collapsed : false;

    if (hasSelection) {
      exec("createLink", url);
    } else {
      exec("insertHTML", `<a href="${url}">${url}</a>`);
    }

    setLinkUrl("");
    setPanel(null);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");
    if (!html && !text) return;

    event.preventDefault();
    if (html) {
      document.execCommand("insertHTML", false, sanitizeHtml(html));
    } else {
      document.execCommand("insertText", false, text);
    }
    sync();
  }

  const minHeight = (field.rows ?? 10) * 22;

  return (
    <div>
      <FieldLabel field={field} />

      <div className="rounded-xl border border-line bg-white transition focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-mist/60 px-2.5 py-2">
          <button
            type="button"
            title="Bold"
            aria-label="Bold"
            className={`${toolbarButton} font-black`}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("bold")}
          >
            B
          </button>
          <button
            type="button"
            title="Italic"
            aria-label="Italic"
            className={`${toolbarButton} italic`}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("italic")}
          >
            I
          </button>
          <button
            type="button"
            title="Underline"
            aria-label="Underline"
            className={`${toolbarButton} underline`}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("underline")}
          >
            U
          </button>

          <span className="mx-0.5 h-5 w-px bg-line" />

          {BLOCK_BUTTONS.map((button) => (
            <button
              key={button.label}
              type="button"
              title={button.title}
              className={toolbarButton}
              onMouseDown={(event) => {
                event.preventDefault();
                rememberSelection();
              }}
              onClick={() => exec("formatBlock", button.block)}
            >
              {button.label}
            </button>
          ))}

          <span className="mx-0.5 h-5 w-px bg-line" />

          <button
            type="button"
            title="Bulleted list"
            className={toolbarButton}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("insertUnorderedList")}
          >
            Bullets
          </button>
          <button
            type="button"
            title="Numbered list"
            className={toolbarButton}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("insertOrderedList")}
          >
            Numbers
          </button>
          <button
            type="button"
            title="Insert a table"
            className={toolbarButton}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("insertHTML", TABLE_HTML)}
          >
            Table
          </button>

          <span className="mx-0.5 h-5 w-px bg-line" />

          <button
            type="button"
            title="Add a link"
            className={toolbarButton}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => {
              setPanel(panel === "link" ? null : "link");
              setMessage("");
            }}
          >
            Link
          </button>
          <button
            type="button"
            title="Add a photo"
            className={toolbarButton}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => {
              setPanel(panel === "photo" ? null : "photo");
              setMessage("");
            }}
          >
            Photo
          </button>
          <button
            type="button"
            title="Remove formatting"
            className={toolbarButton}
            onMouseDown={(event) => {
              event.preventDefault();
              rememberSelection();
            }}
            onClick={() => exec("removeFormat")}
          >
            Clear
          </button>
        </div>

        {panel === "link" ? (
          <div className="flex flex-wrap items-end gap-2 border-b border-line bg-brand-soft/40 px-3 py-2.5">
            <div className="min-w-[240px] flex-1">
              <label className="mb-1 block text-xs font-semibold text-ink" htmlFor={`${field.name}-link`}>
                Link address
              </label>
              <input
                id={`${field.name}-link`}
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
            </div>
            <button
              type="button"
              onClick={insertLink}
              className="rounded-lg bg-navy px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-deep"
            >
              Insert link
            </button>
            <p className="w-full text-xs text-muted">
              Select some text first to turn it into a link, or leave nothing selected to insert the
              address itself.
            </p>
          </div>
        ) : null}

        {panel === "photo" ? (
          <div className="space-y-2 border-b border-line bg-brand-soft/40 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => fileRef.current?.click()}
                className="rounded-lg bg-navy px-3.5 py-2 text-xs font-semibold text-white hover:bg-navy-deep disabled:opacity-60"
              >
                {busy ? "Uploading…" : "Choose a photo"}
              </button>
              <span className="text-xs text-muted">or paste a link</span>
              <input
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="min-w-[220px] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => {
                  insertPhoto(photoUrl);
                  setPhotoUrl("");
                  setPanel(null);
                }}
                className="rounded-lg border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
              >
                Insert photo
              </button>
            </div>
            <p className="text-xs text-muted">
              JPG, PNG, GIF or WebP up to 5 MB. You can also drag a photo straight onto the page
              text below.
            </p>
          </div>
        ) : null}

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={field.label}
          data-placeholder={`Write the ${field.label.toLowerCase()} here…`}
          className="uon-editor uon-prose px-3.5 py-3"
          style={{ minHeight }}
          onInput={sync}
          onBlur={() => {
            sync();
            rememberSelection();
          }}
          onKeyUp={rememberSelection}
          onMouseUp={rememberSelection}
          onPaste={handlePaste}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const file = event.dataTransfer.files?.[0];
            if (!file) return;
            event.preventDefault();
            void sendFile(file);
          }}
          dangerouslySetInnerHTML={{ __html: initialHtml.current }}
        />
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void sendFile(file);
      }} />

      <input ref={hiddenRef} type="hidden" name={field.name} defaultValue={initialHtml.current} />

      {message ? <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p> : null}
      <FieldHelp>{field.help}</FieldHelp>
      <FieldError message={error} />
    </div>
  );
}
