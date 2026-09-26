import type { Metadata } from 'next';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Accès restreint — RESA Sport Academy',
  description: 'Environnement de prévisualisation privé',
  robots: {
    index: false,
    follow: false
  }
};

export default function PreviewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}