// ============================================================
// WhatsApp Service — provider-agnostic messaging layer
//
// Usage today:  WhatsAppStub (logs to console, returns fake IDs)
// Upgrading:    Implement WhatsAppMetaProvider or WhatsAppTwilioProvider,
//               then swap the exported `whatsAppService` singleton.
// ============================================================

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * All concrete providers must implement this interface.
 * Template names must be pre-approved in the provider's business console
 * before being used in production (e.g. Meta Business Manager).
 */
export interface WhatsAppProvider {
  sendMessage(
    to: string,
    templateName: string,
    params: Record<string, string>
  ): Promise<WhatsAppSendResult>;
}

// ============================================================
// Stub — development / placeholder implementation
// ============================================================

class WhatsAppStub implements WhatsAppProvider {
  async sendMessage(
    to: string,
    templateName: string,
    params: Record<string, string>
  ): Promise<WhatsAppSendResult> {
    const fakeId = `stub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log('[WhatsApp Stub] sendMessage called', { to, templateName, params, fakeId });
    return { success: true, messageId: fakeId };
  }
}

// ============================================================
// Meta Cloud API provider (fill in when credentials are ready)
// ============================================================

// class WhatsAppMetaProvider implements WhatsAppProvider {
//   constructor(
//     private readonly accessToken: string,
//     private readonly phoneNumberId: string
//   ) {}
//
//   async sendMessage(
//     to: string,
//     templateName: string,
//     params: Record<string, string>
//   ): Promise<WhatsAppSendResult> {
//     const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
//     const components = Object.entries(params).map(([, value]) => ({
//       type: 'text',
//       text: value,
//     }));
//     const body = {
//       messaging_product: 'whatsapp',
//       to,
//       type: 'template',
//       template: {
//         name: templateName,
//         language: { code: 'en' },
//         components: [{ type: 'body', parameters: components }],
//       },
//     };
//     const res = await fetch(url, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${this.accessToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });
//     if (!res.ok) {
//       const err = await res.json();
//       return { success: false, error: err?.error?.message ?? 'Meta API error' };
//     }
//     const data = await res.json();
//     return { success: true, messageId: data?.messages?.[0]?.id };
//   }
// }

// ============================================================
// Active provider singleton — swap class here to upgrade
// ============================================================

function createProvider(): WhatsAppProvider {
  const provider = process.env.WHATSAPP_PROVIDER ?? 'stub';

  if (provider === 'meta') {
    // Uncomment when Meta credentials are available:
    // return new WhatsAppMetaProvider(
    //   process.env.WHATSAPP_API_TOKEN!,
    //   process.env.WHATSAPP_PHONE_NUMBER_ID!
    // );
    console.warn('[WhatsApp] WHATSAPP_PROVIDER=meta but provider not yet implemented; using stub');
  }

  if (provider === 'twilio') {
    // Uncomment when Twilio credentials are available:
    // return new WhatsAppTwilioProvider(...)
    console.warn('[WhatsApp] WHATSAPP_PROVIDER=twilio but provider not yet implemented; using stub');
  }

  return new WhatsAppStub();
}

export const whatsAppService: WhatsAppProvider = createProvider();

// ============================================================
// High-level helpers — used directly by API routes
// ============================================================

export const INVITATION_EXPIRY_DAYS = 7;

/**
 * Sends a pre-approved WhatsApp template message inviting an external
 * contact to register and claim a property listing on Dropiti.
 *
 * Template name (register in Meta Business Manager / Twilio):
 *   property_ownership_invitation
 *
 * Expected template body (example):
 *   "Hi, your property *{{1}}* has received a rental enquiry on Dropiti.
 *    Register or log in to claim your listing and manage this lead:
 *    {{2}}
 *    This invitation expires in {{3}} days."
 */
export async function sendOwnershipInvitation(
  to: string,
  params: {
    propertyTitle: string;
    invitationUrl: string;
    expiryDays?: number;
  }
): Promise<WhatsAppSendResult> {
  const digits = to.replace(/\D/g, '');
  if (!digits) {
    return { success: false, error: 'Invalid phone number — no digits found' };
  }

  return whatsAppService.sendMessage(digits, 'property_ownership_invitation', {
    property_title: params.propertyTitle,
    invitation_url: params.invitationUrl,
    expiry_days: String(params.expiryDays ?? INVITATION_EXPIRY_DAYS),
  });
}
