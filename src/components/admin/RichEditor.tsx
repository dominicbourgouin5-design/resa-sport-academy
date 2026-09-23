'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { cn } from '@/lib/utils';

export default function RichEditor({
  value,
  onChange,
  placeholder = 'Écrivez votre article…'
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
      }),
      Placeholder.configure({ placeholder }),
      Typography
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose-article focus:outline-none'
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  // Sync externe → éditeur (cas du chargement initial)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-4 text-center text-[12px] text-resa-text/40">
        Chargement de l'éditeur…
      </div>
    );
  }

  return (
    <div className="tiptap-editor overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition focus-within:border-resa-navy/40 focus-within:ring-2 focus-within:ring-resa-navy/10">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Barre d'outils ─────────────────────────────────────────
function Toolbar({ editor }: { editor: Editor }) {
  const handleAddLink = () => {
    const prev = editor.getAttributes('link').href ?? '';
    const url = window.prompt('URL du lien :', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-black/5 bg-resa-gray/40 px-2 py-1.5">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Gras (Ctrl+B)"
      >
        <strong>B</strong>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italique (Ctrl+I)"
      >
        <em>I</em>
      </Btn>

      <Divider />

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Titre H2"
      >
        H2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Titre H3"
      >
        H3
      </Btn>

      <Divider />

      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Liste à puces"
      >
        •≡
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Liste numérotée"
      >
        1≡
      </Btn>

      <Divider />

      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Citation"
      >
        ❝
      </Btn>
      <Btn
        onClick={handleAddLink}
        active={editor.isActive('link')}
        title="Lien"
      >
        🔗
      </Btn>

      <Divider />

      <Btn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Séparateur"
      >
        —
      </Btn>

      <div className="ml-auto flex items-center gap-0.5">
        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler (Ctrl+Z)"
        >
          ↶
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refaire (Ctrl+Shift+Z)"
        >
          ↷
        </Btn>
      </div>
    </div>
  );
}

function Btn({
  children, onClick, active, disabled, title
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'grid h-8 min-w-[32px] place-items-center rounded-md px-1.5 text-[13px] font-semibold transition',
        active
          ? 'bg-resa-navy text-white'
          : 'text-resa-text/60 hover:bg-white hover:text-resa-navy',
        disabled && 'cursor-not-allowed opacity-30 hover:bg-transparent'
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-black/10" />;
}