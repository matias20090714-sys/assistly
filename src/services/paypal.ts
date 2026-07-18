import { PlanType } from '@prisma/client';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Map PayPal Plan IDs to database PlanTypes
export const PAYPAL_PLAN_MAP: Record<string, PlanType> = {
  'P-5YT747867K2659343NJNPIQY': PlanType.STARTER,
  'P-00K90185YF944794SNJNPJ2I': PlanType.PRO,
  'P-19U157436X5071221NJNPKII': PlanType.BUSINESS,
};

// Map PlanType back to PayPal Plan ID for any server-side validation or references
export const PLAN_TO_PAYPAL_ID: Record<PlanType, string> = {
  TRIAL: '',
  STARTER: 'P-5YT747867K2659343NJNPIQY',
  PRO: 'P-00K90185YF944794SNJNPJ2I',
  BUSINESS: 'P-19U157436X5071221NJNPKII',
  EXPIRED: '',
};

// Generates an access token using OAuth client credentials
export async function getPayPalAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('PayPal Client ID or Client Secret is not configured.');
  }

  const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to retrieve PayPal access token: ${response.statusText} - ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Verifies the webhook signature with PayPal's API
export async function verifyPayPalWebhookSignature(
  headers: Headers,
  rawBody: string
): Promise<boolean> {
  // If webhook ID is placeholder or not set, bypass signature checks to facilitate testing and local environments
  if (!WEBHOOK_ID || WEBHOOK_ID.includes('placeholder') || CLIENT_SECRET?.includes('placeholder')) {
    console.warn('PAYPAL_WEBHOOK_ID or CLIENT_SECRET is placeholder. Bypassing signature verification.');
    return true;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    
    const transmissionId = headers.get('paypal-transmission-id');
    const transmissionTime = headers.get('paypal-transmission-time');
    const transmissionSig = headers.get('paypal-transmission-sig');
    const certUrl = headers.get('paypal-cert-url');
    
    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl) {
      console.warn('Missing PayPal transmission headers for signature verification.');
      return false;
    }

    const payload = {
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: headers.get('paypal-auth-algo') || 'SHA256withRSA',
      transmission_sig: transmissionSig,
      webhook_id: WEBHOOK_ID,
      webhook_event: JSON.parse(rawBody)
    };

    const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to verify PayPal webhook signature:', await response.text());
      return false;
    }

    const verificationResult = await response.json();
    return verificationResult.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('Error verifying PayPal webhook signature:', error);
    return false;
  }
}

// Fetches the subscription details from PayPal API
export async function getPayPalSubscriptionDetails(subscriptionId: string) {
  // If credentials are placeholder, return a mocked subscription detail payload for sandbox simulation
  if (CLIENT_ID?.includes('placeholder') || CLIENT_SECRET?.includes('placeholder')) {
    console.warn('Using mocked PayPal subscription details for placeholder credentials.');
    return {
      id: subscriptionId,
      status: 'ACTIVE',
      plan_id: 'P-00K90185YF944794SNJNPJ2I', // default to PRO
      custom_id: 'demo-workspace-id',
      billing_info: {
        next_billing_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to retrieve PayPal subscription details: ${response.statusText} - ${errorBody}`);
  }

  return response.json();
}
