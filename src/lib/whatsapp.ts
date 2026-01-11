

/**
 * Sends a WhatsApp message using a simple HTTP API (placeholder).
 * In production you would integrate with Twilio, Meta Business API, etc.
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    try {
        // Placeholder: just log and pretend it's sent
        console.log('Sending WhatsApp message to', to, ':', message);
        // Simulate async call
        await new Promise((resolve) => setTimeout(resolve, 500));
        return true;
    } catch (e) {
        console.error('WhatsApp send error', e);
        return false;
    }
}
