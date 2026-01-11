import { sendMessage, isConnected, initWhatsApp, getConnectionStatus } from './whatsapp-bot';
import { prisma } from '@/lib/prisma';

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
 * Log WhatsApp message to database
 */
async function logWhatsAppMessage(
    phoneNumber: string,
    message: string,
    status: 'SENT' | 'FAILED',
    errorMessage?: string,
    userEmail?: string
): Promise<void> {
    try {
        await prisma.whatsAppLog.create({
            data: {
                phoneNumber,
                message,
                messageType: 'VERIFICATION',
                status,
                userEmail,
                errorMessage,
            }
        });
    } catch (error) {
        console.error('[WhatsApp] Failed to log message:', error);
    }
}

/**
 * Sends a WhatsApp message using the bot.
 * Waits for connection if bot is still connecting.
 * Logs message to database.
 * 
 * @param to - Phone number in format +90XXXXXXXXXX
 * @param message - Message text to send
 * @param userEmail - Optional user email for logging
 * @returns true if sent successfully, false otherwise
 */
export async function sendWhatsAppMessage(to: string, message: string, userEmail?: string): Promise<boolean> {
    // Ensure bot is initialized
    await ensureInitialized();

    // Wait for connection (up to 15 seconds)
    const connected = await waitForConnection(15000);

    if (!connected) {
        console.log('[WhatsApp] Bot not connected after waiting. Message not sent.');
        console.log(`[WhatsApp] Would send to ${to}: ${message}`);
        await logWhatsAppMessage(to, message, 'FAILED', 'Bot not connected', userEmail);
        return false;
    }

    // Send via bot
    const result = await sendMessage(to, message);

    if (result) {
        console.log(`[WhatsApp] Message sent successfully to ${to}`);
        await logWhatsAppMessage(to, message, 'SENT', undefined, userEmail);
    } else {
        console.error(`[WhatsApp] Failed to send message to ${to}`);
        await logWhatsAppMessage(to, message, 'FAILED', 'Send failed', userEmail);
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
export { getQRCode, getConnectionStatus, isConnected, initWhatsApp, disconnect, clearSession, forceReconnect } from './whatsapp-bot';
