'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CampRegistrationsRealtime({
  campId
}: {
  campId: string;
}) {
  const router = useRouter();
  const channelRef = useRef<any>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Realtime WebSocket ───
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`camp-registrations-rt-${campId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camp_registrations',
          filter: `camp_id=eq.${campId}`
        },
        (payload) => {
          console.log('[Realtime] camp_registrations changed:', payload.eventType);
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] camp subscription status:', status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [router, campId]);

  // ─── Polling de secours (10s) ───
  useEffect(() => {
    pollRef.current = setInterval(() => {
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