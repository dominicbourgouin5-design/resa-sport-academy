'use client';

import { useRef, useState } from 'react';
import { uploadImage, deleteImage, getPathFromUrl, type UploadFolder } from '@/lib/upload';
import { cn } from '@/lib/utils';

export default function ImageUpload({
  value,
  onChange,
  folder,
  label = 'Image',
  aspect = '16/9',
  hint
}: {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label?: string;
  aspect?: '16/9' | '1/1' | '3/1';
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspect === '1/1' ? 'aspect-square' :
    aspect === '3/1' ? 'aspect-[3/1]' : 'aspect-video';

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    // Progress simulé (le SDK Supabase ne donne pas de vrai progress par défaut)
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 10, 90));
    }, 100);

    try {
      // Supprimer l'ancienne image si elle existe
      if (value) {
        const oldPath = getPathFromUrl(value);
        if (oldPath) await deleteImage(oldPath).catch(() => {});
      }

      const { url } = await uploadImage(file, folder);
      setProgress(100);
      onChange(url);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de l\'upload');
    } finally {
      clearInterval(interval);
      setUploading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = async () => {
    if (value) {
      const path = getPathFromUrl(value);
      if (path) await deleteImage(path).catch(() => {});
    }
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        // ─── Preview avec image ───
        <div className={cn('group relative overflow-hidden rounded-xl border border-black/5 bg-resa-gray', aspectClass)}>
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
          />

          {/* Overlay au survol */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-resa-navy transition hover:bg-resa-gray"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="rounded-full bg-red-600 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full bg-resa-red transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-white">
                Upload… {progress}%
              </span>
            </div>
          )}
        </div>
      ) : (
        // ─── Zone de drop vide ───
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition',
            aspectClass,
            dragOver
              ? 'border-resa-red bg-resa-red/5'
              : 'border-black/10 bg-resa-gray/30 hover:border-resa-navy/30 hover:bg-resa-gray/50',
            uploading && 'cursor-wait opacity-60'
          )}
        >
          {uploading ? (
            <>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-black/10">
                <div
                  className="h-full bg-resa-red transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-resa-navy">
                Upload… {progress}%
              </span>
            </>
          ) : (
            <>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-xl shadow-sm">
                📷
              </div>
              <div className="text-center">
                <div className="text-[12px] font-bold text-resa-navy">
                  Cliquez ou glissez une image
                </div>
                <div className="mt-0.5 text-[10px] text-resa-text/40">
                  JPG, PNG, WebP · 5 Mo max
                </div>
              </div>
            </>
          )}
        </button>
      )}

      {/* Erreur */}
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </div>
      )}

      {hint && !error && (
        <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>
      )}
    </div>
  );
}