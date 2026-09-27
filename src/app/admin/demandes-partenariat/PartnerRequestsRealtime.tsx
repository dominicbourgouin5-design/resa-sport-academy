'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PartnerRequestsRealtime() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('sponsor_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sponsor_requests'
        },
        (payload) => {
          console.log('[Realtime] sponsor_requests changed:', payload.eventType);
          router.refresh();
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] sponsor_requests subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}