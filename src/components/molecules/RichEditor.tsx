"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Code,
  Code2,
  Minus,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface RichEditorProps {
  /** Initial title value */
  title?: string;
  /** Initial HTML content */
  content?: string;
  /** Title placeholder */
  titlePlaceholder?: string;
  /** Editor body placeholder */
  contentPlaceholder?: string;
  /** Character limit */
  characterLimit?: number;
  /** Fires when title changes */
  onTitleChange?: (title: string) => void;
  /** Fires when content changes — receives HTML string */
  onContentChange?: (html: string) => void;
  /** Read-only mode (display rendered content only) */
  readOnly?: boolean;
  /** Hide the title input (useful for inline editors) */
  hideTitle?: boolean;
  /** Additional className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export default function RichEditor({
  title = "",
  content = "",
  titlePlaceholder = "Announcement title",
  contentPlaceholder = "Start typing...",
  characterLimit = 2000,
  onTitleChange,
  onContentChange,
  readOnly = false,
  hideTitle = false,
  className,
}: RichEditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we configure separately
        codeBlock: {
          HTMLAttributes: {
            class:
              "bg-bg-sunken border border-border-subtle rounded-md p-4 my-4 font-mono text-body-sm",
          },
        },
        code: {
          HTMLAttributes: {
            class:
              "bg-bg-sunken border border-border-subtle rounded px-1.5 py-0.5 font-mono text-body-sm text-brand-primary",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class:
              "border-l-4 border-brand-primary pl-4 my-6 italic text-text-secondary bg-brand-primary/5 py-3 rounded-r",
          },
        },
        bulletList: {
          HTMLAttributes: { class: "my-4 ml-6 list-disc space-y-1" },
        },
        orderedList: {
          HTMLAttributes: { class: "my-4 ml-6 list-decimal space-y-1" },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: { class: "font-bold mt-6 mb-3" },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-brand-primary underline underline-offset-2 hover:opacity-80 transition-opacity",
        },
      }),
      Placeholder.configure({
        placeholder: contentPlaceholder,
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-text-muted before:float-left before:pointer-events-none before:h-0",
      }),
      CharacterCount.configure({
        limit: characterLimit,
      }),
    ],
    content,
    editable: !readOnly,
    immediatelyRender: false, // Next.js SSR safety
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "editor-prose",
          "min-h-[400px] px-6 py-6 outline-none",
          "text-text-primary font-sans text-body-lg leading-relaxed",
        ),
      },
    },
  });

  // Sync external content changes back to editor
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
    // We only want to update if the external `content` prop changes,
    // not on every editor update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const charCount = editor?.storage.characterCount.characters() ?? 0;

  return (
    <div
      className={cn(
        // Container — matches your Stitch design
        "bg-bg-elevated border border-border-default rounded-xl overflow-hidden",
        "flex flex-col shadow-2xl",
        // Focus glow ring (4px violet)
        "transition-shadow duration-(--duration-fast)",
        "focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.20)]",
        "focus-within:border-brand-primary",
        className,
      )}
    >
      {/* Title Input */}
      {!hideTitle && (
        <div className="px-6 pt-6">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            placeholder={titlePlaceholder}
            readOnly={readOnly}
            maxLength={200}
            className={cn(
              "w-full bg-transparent border-none outline-none",
              "text-h2 font-bold text-text-primary",
              "placeholder:text-text-muted",
              "p-0",
              // Custom violet caret
              "caret-brand-primary",
              readOnly && "cursor-default",
            )}
          />
        </div>
      )}

      {/* Toolbar */}
      {!readOnly && editor && <Toolbar editor={editor} />}

      {/* Editor content area */}
      <div className="rich-editor-content caret-brand-primary">
        <EditorContent editor={editor} />
      </div>

      {/* Footer with character count */}
      {!readOnly && (
        <div
          className={cn(
            "px-6 py-3 border-t border-border-subtle",
            "bg-bg-sunken/40 flex justify-end items-center",
          )}
        >
          <div className="font-mono text-micro uppercase tracking-wider text-text-muted">
            <span
              className={cn(
                charCount > characterLimit * 0.9 && "text-warning",
                charCount >= characterLimit && "text-danger",
              )}
            >
              {charCount.toLocaleString()}
            </span>
            <span className="text-text-muted">
              {" "}
              / {characterLimit.toLocaleString()} characters
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Toolbar
// ─────────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10",
        "bg-bg-sunken border-b border-border-subtle",
        "h-12.5 flex items-center px-3 gap-1",
        "custom-scrollbar",
      )}
    >
      {/* Group 1: Text formatting */}
      <div className="flex items-center pr-2 border-r border-border-subtle gap-0.5">
        <ToolbarButton
          icon={<Bold className="w-4.5 h-4.5" />}
          label="Bold"
          shortcut="⌘B"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<Italic className="w-4.5 h-4.5" />}
          label="Italic"
          shortcut="⌘I"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<UnderlineIcon className="w-4.5 h-4.5" />}
          label="Underline"
          shortcut="⌘U"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={<Strikethrough className="w-4.5 h-4.5" />}
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
      </div>

      {/* Group 2: Block format */}
      <div className="flex items-center px-2 border-r border-border-subtle gap-0.5">
        <HeadingDropdown editor={editor} />
        <ToolbarButton
          icon={<List className="w-4.5 h-4.5" />}
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={<ListOrdered className="w-4.5 h-4.5" />}
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={<Quote className="w-4.5 h-4.5" />}
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
      </div>

      {/* Group 3: Inline */}
      <div className="flex items-center px-2 border-r border-border-subtle gap-0.5">
        <ToolbarButton
          icon={<LinkIcon className="w-4.5 h-4.5" />}
          label="Insert link"
          active={editor.isActive("link")}
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href;
            const url = window.prompt("URL", previousUrl);
            if (url === null) return; // cancelled
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
        />
        <ToolbarButton
          icon={<Code className="w-4.5 h-4.5" />}
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
      </div>

      {/* Group 4: Block elements */}
      <div className="flex items-center pl-2 gap-0.5">
        <ToolbarButton
          icon={<Code2 className="w-4.5 h-4.5" />}
          label="Code block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          icon={<Minus className="w-4.5 h-4.5" />}
          label="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Toolbar Button
// ─────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  active?: boolean;
  onClick: () => void;
}

function ToolbarButton({
  icon,
  label,
  shortcut,
  active,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "p-1.5 rounded",
        "transition-colors duration-(--duration-fast)",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand-primary/30",
        active
          ? "bg-brand-primary/15 text-brand-primary"
          : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
      )}
    >
      {icon}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
//  Heading Dropdown
// ─────────────────────────────────────────────────────────────

function HeadingDropdown({ editor }: { editor: Editor }) {
  const currentLevel = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
      ? "H2"
      : editor.isActive("heading", { level: 3 })
        ? "H3"
        : "Text";

  return (
    <div className="relative group">
      <button
        type="button"
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-body-sm font-medium",
          "transition-colors duration-(--duration-fast)",
          "text-text-secondary hover:bg-white/5 hover:text-text-primary",
        )}
      >
        {currentLevel}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {/* Dropdown menu */}
      <div
        className={cn(
          "absolute top-full left-0 mt-1 min-w-35",
          "bg-bg-elevated border border-border-default rounded-md shadow-lg",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
          "transition-all duration-(--duration-fast)",
          "z-20",
        )}
      >
        {[
          { label: "Text", level: 0 },
          { label: "Heading 1", level: 1 },
          { label: "Heading 2", level: 2 },
          { label: "Heading 3", level: 3 },
        ].map((item) => (
          <button
            key={item.level}
            type="button"
            onClick={() => {
              if (item.level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: item.level as 1 | 2 | 3 })
                  .run();
              }
            }}
            className={cn(
              "w-full px-3 py-2 text-left text-body-sm",
              "transition-colors duration-(--duration-fast)",
              "hover:bg-bg-sunken",
              "first:rounded-t-md last:rounded-b-md",
              (item.level === 0 && currentLevel === "Text") ||
                (item.level > 0 && currentLevel === `H${item.level}`)
                ? "text-brand-primary"
                : "text-text-primary",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
