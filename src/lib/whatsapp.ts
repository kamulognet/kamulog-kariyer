import { sendMessage, isConnected, initWhatsApp, getConnectionStatus } from './whatsapp-bot';

// Auto-initialize WhatsApp on module load
let initPromise: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
    if (!initPromise) {
        initPromise = initWhatsApp().catch((error) => {
            console.error('[WhatsApp] Failed to initialize:', error);
            initPromise = null;
        });
    }
    await initPromise;
}

// Start initialization immediately on import
ensureInitialized();

/**
 * Wait for WhatsApp connection with timeout
 * @param maxWaitMs Maximum time to wait in milliseconds
 * @returns true if connected, false if timeout
 */
async function waitForConnection(maxWaitMs: number = 15000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 500; // Check every 500ms

    while (Date.now() - startTime < maxWaitMs) {
        if (isConnected()) {
            return true;
        }
        const status = getConnectionStatus();
        if (status === 'disconnected') {
            // Try to reconnect
            console.log('[WhatsApp] Disconnected, attempting to reinitialize...');
            initPromise = null;
            await ensureInitialized();
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    return isConnected();
}

/**
 * Sends a WhatsApp message using the bot.
 * Waits for connection if bot is still connecting.
 * Returns status indicating if message was sent.
 * 
 * @param to - Phone number in format +90XXXXXXXXXX
 * @param message - Message text to send
 * @returns { sent: boolean, reason?: string }
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    // Ensure bot is initialized
    await ensureInitialized();

    // Wait for connection (up to 15 seconds)
    const connected = await waitForConnection(15000);

    if (!connected) {
        console.log('[WhatsApp] Bot not connected after waiting. Message not sent.');
        console.log(`[WhatsApp] Would send to ${to}: ${message}`);
        return false;
    }

    // Send via bot
    const result = await sendMessage(to, message);

    if (result) {
        console.log(`[WhatsApp] Message sent successfully to ${to}`);
    } else {
        console.error(`[WhatsApp] Failed to send message to ${to}`);
    }

    return result;
}

/**
 * Check if bot is ready to send messages
 */
export function isBotReady(): boolean {
    return isConnected();
}

// Re-export useful functions for admin management
export { getQRCode, getConnectionStatus, isConnected, initWhatsApp, disconnect, clearSession } from './whatsapp-bot';

