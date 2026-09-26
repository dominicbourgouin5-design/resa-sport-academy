import { Suspense } from 'react';
import PreviewForm from './PreviewForm';

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewForm />
    </Suspense>
  );
}