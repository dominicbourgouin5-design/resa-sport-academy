'use client';

import { useState } from 'react';

export default function HeroVideo({
  src = '/videos/hero.mp4',
  poster = '/images/hero-poster.jpg'
}: {
  src?: string;
  poster?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Si la vidéo échoue (fichier absent, codec non supporté, etc.),
  // on n'affiche rien — le dégradé de fond prend le relais.
  if (failed) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      onError={() => setFailed(true)}
      onLoadedData={() => setLoaded(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}