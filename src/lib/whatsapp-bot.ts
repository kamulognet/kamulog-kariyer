import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    WASocket,
    proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

// Session directory for storing auth credentials
const AUTH_DIR = path.join(process.cwd(), '.whatsapp-session');

// Singleton instance
let sock: WASocket | null = null;
let qrCode: string | null = null;
let connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';

/**
 * Get current QR code for pairing (only available when not connected)
 */
export function getQRCode(): string | null {
    return qrCode;
}

/**
 * Get current connection status
 */
export function getConnectionStatus(): string {
    return connectionStatus;
}

/**
 * Check if WhatsApp is connected and ready
 */
export function isConnected(): boolean {
    return connectionStatus === 'connected' && sock !== null;
}

/**
 * Initialize WhatsApp connection
 */
export async function initWhatsApp(): Promise<void> {
    if (sock) {
        console.log('[WhatsApp] Already initialized');
        return;
    }

    // Create auth directory if it doesn't exist
    if (!fs.existsSync(AUTH_DIR)) {
        fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    connectionStatus = 'connecting';
    console.log('[WhatsApp] Initializing connection...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Also print in terminal for convenience
    });

    // Handle connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCode = qr;
            console.log('[WhatsApp] QR Code generated. Scan with your phone.');
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log('[WhatsApp] Connection closed. Reconnecting:', shouldReconnect);
            connectionStatus = 'disconnected';
            qrCode = null;
            sock = null;

            if (shouldReconnect) {
                setTimeout(() => initWhatsApp(), 5000);
            }
        } else if (connection === 'open') {
            console.log('[WhatsApp] Connected successfully!');
            connectionStatus = 'connected';
            qrCode = null;
        }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);
}

/**
 * Send a WhatsApp message
 * @param phoneNumber - Phone number in format +905XXXXXXXXX or 905XXXXXXXXX
 * @param message - Message text to send
 * @returns true if sent successfully, false otherwise
 */
export async function sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (!isConnected()) {
        console.error('[WhatsApp] Not connected. Cannot send message.');
        return false;
    }

    try {
        // Format phone number: remove + and add @s.whatsapp.net
        const formattedNumber = phoneNumber.replace(/\+/g, '').replace(/\s/g, '');
        const jid = `${formattedNumber}@s.whatsapp.net`;

        console.log(`[WhatsApp] Sending message to ${jid}`);

        await sock!.sendMessage(jid, { text: message });

        console.log(`[WhatsApp] Message sent successfully to ${phoneNumber}`);
        return true;
    } catch (error) {
        console.error('[WhatsApp] Failed to send message:', error);
        return false;
    }
}

/**
 * Disconnect WhatsApp (without logout - preserves session for reconnection)
 */
export async function disconnect(): Promise<void> {
    if (sock) {
        try {
            sock.end(undefined);
        } catch (e) {
            console.log('[WhatsApp] Error while closing socket:', e);
        }
        sock = null;
        connectionStatus = 'disconnected';
        qrCode = null;
        console.log('[WhatsApp] Disconnected (session preserved)');
    }
}

/**
 * Force reconnection - always creates new connection
 */
export async function forceReconnect(): Promise<void> {
    console.log('[WhatsApp] Force reconnecting...');

    // Close existing socket if any
    if (sock) {
        try {
            sock.end(undefined);
        } catch (e) {
            console.log('[WhatsApp] Error closing existing socket:', e);
        }
        sock = null;
    }

    connectionStatus = 'disconnected';
    qrCode = null;

    // Reinitialize
    await initWhatsApp();
}

/**
 * Full logout and clear session
 */
export async function clearSession(): Promise<void> {
    if (sock) {
        try {
            await sock.logout();
        } catch (e) {
            console.log('[WhatsApp] Error during logout:', e);
        }
        sock = null;
    }

    connectionStatus = 'disconnected';
    qrCode = null;

    if (fs.existsSync(AUTH_DIR)) {
        fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        console.log('[WhatsApp] Session cleared');
    }
}

