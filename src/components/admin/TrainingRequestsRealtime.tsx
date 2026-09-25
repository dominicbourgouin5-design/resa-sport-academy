'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function TrainingRequestsRealtime() {
  const router = useRouter();
  const channelRef = useRef<any>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Realtime (canal WebSocket) ───
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('admin-training-requests-rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'training_requests' },
        (payload) => {
          console.log('[Realtime] training_requests changed:', payload.eventType);
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'camp_registrations' },
        (payload) => {
          console.log('[Realtime] camp_registrations changed:', payload.eventType);
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [router]);

  // ─── Polling de secours (toutes les 10s) ───
  useEffect(() => {
    pollRef.current = setInterval(() => {
      // On ne refresh que si l'onglet est visible
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        router.refresh();
      }
    }, 10_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [router]);

  return null;
}