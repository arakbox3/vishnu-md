import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import readline from "readline";
import express from "express"; 
// Modular Handlers
import { handleConnection } from './connection/connection.js';
import { handleMessages } from './message.js';

const sessionPath = './session';
const sessionData = process.env.SESSION_ID;

// --- 1. SESSION ID MANAGEMENT ---
if (sessionData) {
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }
    const credsPath = path.join(sessionPath, 'creds.json');
    if (!fs.existsSync(credsPath)) {
        try {
            fs.writeFileSync(credsPath, sessionData.trim());
            console.log("✅ Session file updated from Environment Variable");
        } catch (error) {
            console.error("❌ Error restoring session:", error.message);
        }
    }
}

// --- 2. UPTIME SERVER ---
const app = express();
app.get('/', (req, res) => res.send('Asura MD is Alive! 👺'));
app.listen(process.env.PORT || 3000);

async function startAsura() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`\x1b[33mConnecting with Baileys v${version.join('.')} (Latest: ${isLatest})\x1b[0m`);

    // --- 3. SOCKET INITIALIZATION ---
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Asura-MD", "Chrome", "20.0.04"] 
    });

    // --- 4. CONNECTION & MESSAGE HANDLERS ---
    // connection.js
    await handleConnection(sock, startAsura, sessionPath);

    // messages.js
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        await handleMessages(sock, chatUpdate);
    });

    // --- 5. PAIRING LOGIC (For Local Setup) ---
    if (!sock.authState.creds.registered) {
        if (process.env.RENDER || process.env.PORT) {
            console.log("❌ Cloud environment detected. Add SESSION_ID to Env.");
        } else {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            const question = (text) => new Promise((resolve) => rl.question(text, resolve));
            const phoneNumber = await question('📞 Enter Phone Number with Country Code (Eg:91xxxxxxxxxx): ');
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\n\x1b[32mYOUR 🗝 PAIRING CODE: ${code}\x1b[0m\n`);
            rl.close();
        }
    }

    // Save credentials whenever they update
    sock.ev.on('creds.update', saveCreds);

    // --- 6. ON CONNECTION OPEN TASKS ---
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            try {
                // Channel & Group Auto Join 
                await sock.newsletterFollow("0029VbB59W9GehENxhoI5l24@newsletter");
                await sock.groupAcceptInvite("JqxtYghmFfR9KGqEwMEa30");

                const myNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
                const thumbPath = './media/thumb.jpg';

                const statusMsg = {
                    image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://i.imgur.com/your-image.jpg' },
                    caption: `
                    ╭━━━〔 *👺 ASURA-MD* 〕━╮
                    ┃ 🛠️ *STATUS:* Online
                    ┃ 👤 *OWNER:* arun.°Cumar
                    ┃ ⚙️ *MODE:* Public
                    ┃ 📌 *PREFIX:* [ .,!#$@ ]
                    ╰━━━━━━━━━━━━━━━━━━━━╯
                    *The Underworld is Active!* 👺`,
                    contextInfo: {
                        externalAdReply: {
                            title: "ASURA MD WHATSAPP BOT",
                            body: "System: Online 🟢",
                            thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                            sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                };
                await sock.sendMessage(myNumber, statusMsg);
            } catch (e) { console.log("Init Message Error: ", e.message); }
        }
    });
}

startAsura();
