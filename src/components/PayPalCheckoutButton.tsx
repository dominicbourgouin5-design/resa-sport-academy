'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

export default function PayPalCheckoutButton({
  type,
  id,
  amount,
  currency = 'USD',
  description,
  onSuccess
}: {
  type: 'camp' | 'training';
  id: string;
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '';

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency,
        intent: 'capture'
      }}
    >
      <div className="space-y-2">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
            {error}
          </div>
        )}

        <PayPalButtons
          style={{ layout: 'vertical', shape: 'pill', label: 'pay' }}
          disabled={processing}
          createOrder={async () => {
            setError(null);
            setProcessing(true);
            try {
              const res = await fetch('/api/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type,
                  id,
                  amount,
                  currency,
                  description
                })
              });
              const data = await res.json();
              if (!data.orderId) throw new Error(data.error ?? 'Erreur création commande');
              return data.orderId;
            } catch (err: any) {
              setError(err.message);
              setProcessing(false);
              throw err;
            }
          }}
          onApprove={async (data) => {
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  type,
                  id
                })
              });
              const result = await res.json();
              if (result.ok) {
                onSuccess?.();
              } else {
                setError(result.error ?? 'Erreur capture');
              }
            } catch (err: any) {
              setError(err.message);
            }
            setProcessing(false);
          }}
          onCancel={() => {
            setProcessing(false);
            setError('Paiement annulé.');
          }}
          onError={(err) => {
            setError('Erreur PayPal : ' + String(err));
            setProcessing(false);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}