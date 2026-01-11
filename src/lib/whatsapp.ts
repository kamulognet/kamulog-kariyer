import { sendMessage, isConnected, initWhatsApp } from './whatsapp-bot';

// Auto-initialize WhatsApp on first import (in production)
let initialized = false;

async function ensureInitialized(): Promise<void> {
    if (!initialized) {
        initialized = true;
        try {
            await initWhatsApp();
        } catch (error) {
            console.error('[WhatsApp] Failed to initialize:', error);
            initialized = false;
        }
    }
}

/**
 * Sends a WhatsApp message using the bot.
 * Falls back to console logging if not connected.
 * 
 * @param to - Phone number in format +90XXXXXXXXXX
 * @param message - Message text to send
 * @returns true if sent successfully, false otherwise
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<boolean> {
    // Ensure bot is initialized
    await ensureInitialized();

    // Check if connected
    if (!isConnected()) {
        console.log('[WhatsApp] Bot not connected. Message not sent.');
        console.log(`[WhatsApp] Would send to ${to}: ${message}`);
        return false;
    }

    // Send via bot
    return await sendMessage(to, message);
}

// Re-export useful functions for admin management
export { getQRCode, getConnectionStatus, isConnected, initWhatsApp, disconnect, clearSession } from './whatsapp-bot';
