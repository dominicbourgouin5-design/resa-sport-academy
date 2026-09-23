'use client';

import { createClient } from './supabase/client';
import { urlBase64ToUint8Array, VAPID_PUBLIC_KEY } from './utils-push';

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker non supporté par ce navigateur.');
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  });

  console.log('[Push] Service Worker enregistré');
  return registration;
}

export async function subscribeToPush(userId: string) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker non supporté.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Push non supporté par ce navigateur.');
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Clé VAPID manquante.');
  }

  // 1. Enregistre le Service Worker
  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  });

  await navigator.serviceWorker.ready;

  // 2. Demande la permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permission refusée.');
  }

  // 3. Crée l'abonnement
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
  }

  // 4. Sauvegarde dans Supabase
  const subJson = subscription.toJSON();
  const supabase = createClient();

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subJson.endpoint!,
      p256dh: subJson.keys!.p256dh,
      auth: subJson.keys!.auth,
      user_agent: navigator.userAgent
    },
    { onConflict: 'endpoint' }
  );

  if (error) throw new Error(error.message);

  return subscription;
}

export async function unsubscribeFromPush(userId: string) {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  // Supprime de la base
  const supabase = createClient();
  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', subscription.endpoint);

  // Désabonne le navigateur
  await subscription.unsubscribe();
}

export async function isPushEnabled(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;
  if (!('PushManager' in window)) return false;

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;

  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined') return 'default';
  if (!('Notification' in window)) return 'default';
  return Notification.permission;
}