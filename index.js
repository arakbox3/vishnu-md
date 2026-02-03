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
const sessionPath = './session';
const sessionData = process.env.SESSION_ID;
//SESSION_ID MANAGE
if (sessionData) {
    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true });
    }
    const credsPath = path.join(sessionPath, 'creds.json');
    
    try {
        fs.writeFileSync(credsPath, sessionData.trim());
        console.log("✅ Session file updated from Environment Variable");
    } catch (error) {
        console.error("❌ Error restoring session:", error.message);
    }
}

// --- 2. UPTIME SERVER (For Render/Koyeb) ---
const app = express();
app.get('/', (req, res) => res.send('Asura MD is Alive! 👺'));
app.listen(process.env.PORT || 3000);

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
    browser: ["Asura-MD", "Chrome", "20.0.04"] 
});
    // Pairing logic for initial setup
        if (!sock.authState.creds.registered) {
        if (process.env.SESSION_ID) {
            console.log("⚠️ Session ID exists but might be invalid. Please check.");
        }

        if (process.env.RENDER || process.env.PORT) {
            console.log("❌ Cannot ask for pairing code on Cloud. Add SESSION_ID to Env.");
        } else {
            const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
            const question = (text) => new Promise((resolve) => rl.question(text, resolve));
            const phoneNumber = await question('📞 Enter Phone Number with Country Code (Eg:91xxxxxxxxxx): ');
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\n\x1b[32mYOUR 🗝 PAIRING CODE: ${code}\x1b[0m\n`);
            rl.close();
        }
    }

    sock.ev.on('creds.update', saveCreds);

    // --- 4. CONNECTION HANDLER ---
    sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !process.env.SESSION_ID) {
        console.log("⚠️ Scan the QR code or provide SESSION_ID.");
    }

    if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.message || "Unknown";
        
        console.log(`\x1b[31m❌ Connection Closed: ${reason} (Code: ${statusCode})\x1b[0m`);

        if (statusCode === DisconnectReason.loggedOut || statusCode === 440) {
            console.log("\x1b[41m⚠️ Session Expired or Conflict. Clearing and Restarting...\x1b[0m");
            if (fs.existsSync(sessionPath)) {
                fs.rmSync(sessionPath, { recursive: true, force: true });
            }
            process.exit(1); 
        } else {
            
            const retryDelay = 5000;
            console.log(`\x1b[33m♻️ Reconnecting in ${retryDelay/1000}s...\x1b[0m`);
            setTimeout(() => startAsura(), retryDelay);
        }

    } else if (connection === 'open') {
        console.log('\x1b[1;32m✅ ASURA MD CONNECTED SUCCESSFULLY!\x1b[0m');

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Channel & Group Auto Join 
        try {
            await sock.newsletterFollow("0029VbB59W9GehENxhoI5l24@newsletter");
            await sock.groupAcceptInvite("JqxtYghmFfR9KGqEwMEa30");
        } catch (e) { /* ignore errors */ }

        const myNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
        const thumbPath = './media/thumb.jpg';

        // --- MODEL BOX DESIGN WITH THUMBNAIL ---
        const statusMsg = {
            image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24' },
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
    }
});

        // --- 5. MESSAGE & COMMAND HANDLER ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        // Support both notify and append to avoid missed messages on Render
        if (!['notify', 'append'].includes(chatUpdate.type)) return;

        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Ensure we handle messages from Groups, Private DMs, and Broadcasts
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // Extract message body across all media types
        const mtype = Object.keys(msg.message)[0];

        let body = (mtype === 'conversation') ? msg.message.conversation :
           (mtype === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
           (mtype === 'imageMessage') ? msg.message.imageMessage.caption :
           (mtype === 'videoMessage') ? msg.message.videoMessage.caption :
           (mtype === 'documentMessage') ? msg.message.documentMessage.caption :
           (mtype === 'pollUpdateMessage') ? msg.message.pollUpdateMessage.pollUpdate.vote.selectedOptions[0] : 
           (mtype === 'templateButtonReplyMessage') ? msg.message.templateButtonReplyMessage.selectedId :
           (mtype === 'interactiveResponseMessage') ? JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
           (mtype === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId :
           (mtype === 'listResponseMessage') ? msg.message.listResponseMessage.singleSelectReply.selectedRowId :
           (msg.message.viewOnceMessageV2) ? msg.message.viewOnceMessageV2.message.imageMessage?.caption || msg.message.viewOnceMessageV2.message.videoMessage?.caption : '';

           // (Quoted/Reply Message)
         if (!body && mtype === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo) {
           body = msg.message.extendedTextMessage.text;
           }

         if (!body) return; 

        // Define allowed prefixes
        const prefixes = ".!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~₹";
        const firstChar = body.charAt(0);
        const isCmd = prefixes.includes(firstChar);

        if (!isCmd) return;

        const prefix = firstChar;
        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        if (!commandName) {
            await sock.sendMessage(from, { text: "👺 *Asura-MD:* Please enter a command after the prefix (e.g., .menu) 🥰" }, { quoted: msg });
            return;
        }

        // Command File Execution 
        const commandFile = `${commandName.toLowerCase()}.js`;
        const commandPath = path.join(process.cwd(), 'commands', commandFile);

        if (fs.existsSync(commandPath)) {
            try {
                // Import with Cache Busting to ensure updates take effect
                const fileUrl = `${pathToFileURL(commandPath).href}?t=${Date.now()}`;
                const commandModule = await import(fileUrl);
                
                // Flexible Export: handles 'export default' and 'module.exports'
                const runCommand = commandModule.default || commandModule;

                if (typeof runCommand === 'function') {
                    console.log(`\x1b[1;32m[SUCCESS]\x1b[0m Executing ${commandName} for ${from}`);
                    
                    // Typing status to make it look professional
                    await sock.sendPresenceUpdate('composing', from);

                    // Execute with a Timeout (Prevent bot from hanging on slow commands)
                    await Promise.race([
                        runCommand(sock, msg, args),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
                    ]);

                } else {
                    throw new Error("Command file does not export a valid function.");
                }

            } catch (err) {
                console.error(`\x1b[1;31m[EXECUTION ERROR]\x1b[0m In ${commandName}:`, err.message);
                
                let errorMsg = "❌ *Asura-MD Error* ❌\n\n";
                errorMsg += `*Command:* ${commandName}\n`;
                errorMsg += `*Reason:* ${err.message === 'Timeout' ? 'Server Busy/Slow' : 'Internal Bug'}`;
                
                await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
            }
        } else {
            console.log(`\x1b[1;33m[IGNORE]\x1b[0m Command not found: ${commandName}`);
        }

    } catch (err) {
        console.error("\x1b[31m[UPSERT ERROR]\x1b[0m", err);
      }
   });
}

startAsura();
