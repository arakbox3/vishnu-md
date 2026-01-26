import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';
import readline from "readline";
import express from "express"; 
import { handleEvents } from './handlers.js';
const sessionData = process.env.SESSION_ID;

if (sessionData) {
    if (!fs.existsSync('./session')) fs.mkdirSync('./session');
    
    fs.writeFileSync('./session/creds.json', sessionData);
    console.log("✅ Session file created from Environment Variable");
}

// 1. Setup Express Server for Render
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Asura MD is Online! 👺'));
app.listen(port, () => console.log(`Server is running on port ${port}`));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startAsura() {
    // 2. Setup Auth State
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    // 3. Initialize Socket
    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // 4. Registration/Pairing Logic (Only if not registered)
    if (!sock.authState.creds.registered) {
        console.log("No session found. Please link your bot first in Termux.");
        const phoneNumber = await question('\nEnter your Phone Number with Country Code (eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\x1b[32m\nYOUR PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    // 5. Connection Handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('\x1b[36m✅ Asura MD Connected Successfully!\x1b[0m');
               handleEvents(sock); 
            const myNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
            await sock.sendMessage(myNumber, { text: "*Asura MD is Online on WhatsApp!* 👺\n\nAll commands are now active." });
        }
    });

    // 6. Message & Command Handler
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return;

            const mtype = Object.keys(msg.message)[0];
            const body = mtype === 'conversation' ? msg.message.conversation :
                         mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
                         mtype === 'imageMessage' ? msg.message.imageMessage.caption :
                         mtype === 'videoMessage' ? msg.message.videoMessage.caption : '';
            
            const prefix = "."; 
            if (!body || !body.startsWith(prefix)) return;

            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            console.log(`\x1b[33m[COMMAND] -> ${commandName} from ${msg.key.remoteJid}\x1b[0m`);

            const commandPath = path.join(process.cwd(), 'commands', `${commandName}.js`);

            if (fs.existsSync(commandPath)) {
                const commandModule = await import(pathToFileURL(commandPath).href + `?update=${Date.now()}`);
                const runCommand = commandModule.default;
                
                if (typeof runCommand === 'function') {
                    await runCommand(sock, msg, args);
                    console.log(`\x1b[32m[SUCCESS] -> ${commandName} executed\x1b[0m`);
                }
            } else {
                console.log(`\x1b[31m[NOT FOUND] -> commands/${commandName}.js\x1b[0m`);
            }
        } catch (err) {
            console.error("\x1b[31m[CRITICAL ERROR]\x1b[0m", err);
        }
    });
}

startAsura();
