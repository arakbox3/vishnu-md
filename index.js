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

// --- 1. CONFIGURATION & SESSION SETUP ---
const sessionPath = './session';
if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);

const sessionData = process.env.SESSION_ID;
if (sessionData && !fs.existsSync(path.join(sessionPath, 'creds.json'))) {
    try {
        
        const decoded = sessionData.startsWith('{') ? sessionData : Buffer.from(sessionData, 'base64').toString('utf-8');
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), decoded);
        console.log("✅ Session file successfully restored.");
    } catch (e) {
        console.error("❌ Failed to restore session:", e.message);
    }
}

// --- 2. UPTIME SERVER (For Render/Koyeb) ---
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.status(200).send('Asura MD is Running! 👺'));
app.listen(port, () => console.log(`🚀 Server active on port ${port}`));

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

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
        browser: ["Asura-MD", "Safari", "3.0.0"]
    });

    // Pairing logic for initial setup
    if (!sock.authState.creds.registered) {
        console.log("\n\x1b[31m[!] No Session Found.\x1b[0m");
        const phoneNumber = await question('📞 Enter Phone Number with Country Code (eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n\x1b[32mYOUR 🗝️ PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    // --- 4. CONNECTION HANDLER ---
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`❌ Connection closed. Reason Code: ${reason}`);
            
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnecting in 5 seconds...");
                setTimeout(() => startAsura(), 5000);
            } else {
                console.log("🚫 Session Expired/Logged Out. Please delete 'session' folder and restart.");
                process.exit(1);
            }
        } else if (connection === 'open') {
            console.log('\x1b[36m\n========================================\n✅ ASURA MD CONNECTED SUCCESSFULLY!\n ========================================\x1b[0m');
            
            const myId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
            await sock.sendMessage(myId, { text: "👺 *Asura MD is Online!*\n\nSystem ✅ successfully connected." });
        }
    });

    // --- 5. MESSAGE & COMMAND HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const mtype = Object.keys(msg.message)[0];
            const body = (mtype === 'conversation') ? msg.message.conversation :
                         (mtype === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
                         (mtype === 'imageMessage') ? msg.message.imageMessage.caption :
                         (mtype === 'videoMessage') ? msg.message.videoMessage.caption : '';
            
            // --- PREFIX CHECK ---
                const prefixRegex = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?₹£€÷×+]/;
                const isCmd = prefixRegex.test(body);
                if (!isCmd) return;

                const prefix = body.match(prefixRegex)[0];
                
                // COMMAND & ARGS  
                const args = body.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
            
                if (commandName === '') {
                    await sock.sendMessage(msg.key.remoteJid, { text: "👺 *Asura MD:* Please enter a command after the prefix (eg: .menu)" });
                    return;
                }
            
            // Command Execution
            const commandPath = path.join(process.cwd(), 'commands', `${commandName}.js`);

            if (fs.existsSync(commandPath)) {
                const commandModule = await import(pathToFileURL(commandPath).href + `?update=${Date.now()}`);
                const runCommand = commandModule.default;
                
                if (typeof runCommand === 'function') {
                    console.log(`\x1b[32m[EXEC] -> ${commandName}\x1b[0m`);
                    await runCommand(sock, msg, args);
                }
            } else {
                console.log(`\x1b[31m[SKIP] -> ${commandName} (Not Found)\x1b[0m`);
            }
        } catch (err) {
            console.error("\x1b[31m[ERROR]\x1b[0m", err);
        }
    });
}

startAsura();
