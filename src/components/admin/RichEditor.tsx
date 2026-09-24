'use client';

import { useEffect, useState } from 'react';
import { Node } from '@tiptap/core';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import { cn } from '@/lib/utils';
import ImageUpload from './ImageUpload';
import Modal from './Modal';

const IframeNode = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'Vidéo' },
      frameborder: { default: '0' },
      allow: {
        default:
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      },
      allowfullscreen: { default: 'true' }
    };
  },
  parseHTML() {
    return [{ tag: 'iframe[src]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'video-wrapper' },
      ['iframe', { ...HTMLAttributes, class: 'video-iframe' }]
    ];
  },
  addCommands() {
    return {
      setIframe:
        (attrs: { src: string; title?: string }) =>
        ({ commands }: any) =>
          commands.insertContent({ type: this.name, attrs })
    } as any;
  }
});

function toEmbedUrl(rawUrl: string): { url: string; provider: string } | null {
  const url = rawUrl.trim();
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (ytMatch) {
    return {
      url: `https://www.youtube.com/embed/${ytMatch[1]}`,
      provider: 'YouTube'
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      url: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      provider: 'Vimeo'
    };
  }

  const dmMatch = url.match(/dailymotion\.com\/video\/([A-Za-z0-9]+)/);
  if (dmMatch) {
    return {
      url: `https://www.dailymotion.com/embed/video/${dmMatch[1]}`,
      provider: 'Dailymotion'
    };
  }

  if (/\/embed\/|player\./.test(url)) {
    return { url, provider: 'Embed' };
  }

  return null;
}

export default function RichEditor({
  value,
  onChange,
  placeholder = 'Écrivez votre article…'
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isMediaSelected, setIsMediaSelected] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
      }),
      Placeholder.configure({ placeholder }),
      Typography,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'editor-image' }
      }),
      IframeNode
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'prose-article focus:outline-none' }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const update = () => {
      setIsMediaSelected(
        editor.isActive('image') || editor.isActive('iframe')
      );
    };
    editor.on('selectionUpdate', update);
    editor.on('update', update);
    update();
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('update', update);
    };
  }, [editor]);

  const handleDeleteMedia = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  };

  if (!editor) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-4 text-center text-[12px] text-resa-text/40">
        Chargement de l'éditeur…
      </div>
    );
  }

  return (
    <>
      <div className="tiptap-editor flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition focus-within:border-resa-navy/40 focus-within:ring-2 focus-within:ring-resa-navy/10 md:max-h-[calc(100vh-280px)]">
        <Toolbar
          editor={editor}
          isMediaSelected={isMediaSelected}
          onInsertImage={() => setShowImageModal(true)}
          onInsertVideo={() => setShowVideoModal(true)}
          onDeleteMedia={handleDeleteMedia}
        />
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      <ImageModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={(url, alt) => {
          editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run();
          setShowImageModal(false);
        }}
      />

      <VideoModal
        open={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onInsert={(embedUrl, title) => {
          (editor.chain().focus() as any).setIframe({ src: embedUrl, title }).run();
          setShowVideoModal(false);
        }}
      />
    </>
  );
}

function Toolbar({
  editor,
  isMediaSelected,
  onInsertImage,
  onInsertVideo,
  onDeleteMedia
}: {
  editor: Editor;
  isMediaSelected: boolean;
  onInsertImage: () => void;
  onInsertVideo: () => void;
  onDeleteMedia: () => void;
}) {
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
      <Btn onClick={handleAddLink} active={editor.isActive('link')} title="Lien">
        🔗
      </Btn>

      <Divider />

      <Btn onClick={onInsertImage} title="Insérer une image">
        📷
      </Btn>
      <Btn onClick={onInsertVideo} title="Insérer une vidéo (YouTube, Vimeo…)">
        🎥
      </Btn>

      <Btn
        onClick={onDeleteMedia}
        active={isMediaSelected}
        disabled={!isMediaSelected}
        title={
          isMediaSelected
            ? 'Supprimer le média sélectionné'
            : 'Cliquez sur une image ou une vidéo pour la supprimer'
        }
      >
        🗑️
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

function ImageModal({
  open,
  onClose,
  onInsert
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string, alt: string) => void;
}) {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');

  const handleInsert = () => {
    if (!url.trim()) return;
    onInsert(url, alt);
    setUrl('');
    setAlt('');
  };

  const handleClose = () => {
    setUrl('');
    setAlt('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h3 className="font-display text-lg font-black text-resa-navy">
            📷 Insérer une image
          </h3>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-6">
          <ImageUpload
            label="Image"
            value={url}
            onChange={setUrl}
            folder="covers"
            aspect="16/9"
            hint="JPG, PNG ou WebP. 5 Mo max."
          />

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              Légende / texte alternatif (optionnel)
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Ex : Session d'entraînement au stade"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-black/5 pt-4">
            <button
              onClick={handleClose}
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
            >
              Annuler
            </button>
            <button
              onClick={handleInsert}
              disabled={!url}
              className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-50"
            >
              Insérer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function VideoModal({
  open,
  onClose,
  onInsert
}: {
  open: boolean;
  onClose: () => void;
  onInsert: (embedUrl: string, title: string) => void;
}) {
  const [rawUrl, setRawUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleInsert = () => {
    const result = toEmbedUrl(rawUrl);
    if (!result) {
      setError('Lien non reconnu. Utilisez un lien YouTube, Vimeo ou Dailymotion.');
      return;
    }
    onInsert(result.url, `${result.provider} video`);
    setRawUrl('');
    setError(null);
  };

  const handleClose = () => {
    setRawUrl('');
    setError(null);
    onClose();
  };

  const preview = rawUrl ? toEmbedUrl(rawUrl) : null;

  return (
    <Modal open={open} onClose={handleClose}>
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <h3 className="font-display text-lg font-black text-resa-navy">
            🎥 Insérer une vidéo
          </h3>
          <button
            onClick={handleClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-xl border border-resa-royal/15 bg-resa-royal/5 px-4 py-3 text-[12px] leading-relaxed text-resa-royal">
            💡 <strong>Comment faire ?</strong> Uploadez votre vidéo sur YouTube
            (gratuit, illimité), puis collez le lien ci-dessous.
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              Lien de la vidéo
            </label>
            <input
              type="text"
              value={rawUrl}
              onChange={(e) => {
                setRawUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />
            <div className="mt-1 text-[10px] text-resa-text/40">
              Formats acceptés : YouTube · Vimeo · Dailymotion
            </div>
          </div>

          {preview && (
            <div className="overflow-hidden rounded-xl border border-black/5 bg-resa-gray/40">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                Aperçu — {preview.provider}
              </div>
              <div className="relative aspect-video">
                <iframe
                  src={preview.url}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-black/5 pt-4">
            <button
              onClick={handleClose}
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
            >
              Annuler
            </button>
            <button
              onClick={handleInsert}
              disabled={!preview}
              className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-50"
            >
              Insérer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Btn({
  children,
  onClick,
  active,
  disabled,
  title
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