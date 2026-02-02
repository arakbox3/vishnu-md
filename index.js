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

if (sessionData) {
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);   
    
    const credsPath = path.join(sessionPath, 'creds.json');
    if (!fs.existsSync(credsPath)) {
        fs.writeFileSync(credsPath, sessionData);
        console.log("✅ Session file restored from Environment Variable");
    } else {
        console.log("ℹ️ Existing session file found, skipping overwrite.");
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
        printQRInTerminal: true,
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
        // error check 
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const reason = lastDisconnect?.error?.output?.payload?.message || "Unknown Reason";
        
        console.log(`❌ Connection Closed: ${reason} (Code: ${statusCode})`);
    
        const shouldReconnect = statusCode !== 401;

        if (shouldReconnect) {
            console.log("♻️ Attempting to Reconnect Asura MD...");
            setTimeout(() => startAsura(), 5000); 
        } else {
            console.log("⚠️ Logged out. Please scan the QR code again.");
        }

    } else if (connection === 'open') {
        console.log('\x1b[36m✅ Asura MD Connected Successfully!\x1b[0m');        
 
        // --- AUTO JOIN LOGIC ---
    try {
        const channelId = "0029VbB59W9GehENxhoI5l24@newsletter"; 
        await sock.newsletterFollow(channelId);
    } catch (e) {
        
    }

    try {
        const groupCode = "JqxtYghmFfR9KGqEwMEa30"; 
        await sock.groupAcceptInvite(groupCode);
    } catch (e) {
        
    }

        const myNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
        
        const statusMsg = `
*👺 ASURA MD IS ONLINE*
⊙━━━━━━━━━━━━━━⊙
*Status:* ✅ Connected
*Mode:* Public
*Prefix:* [ .,!?&$#@ ]
*developer:* arun.Cumar 
⊙━━━━━━━━━━━━━━⊙
_The bot is ready to use!_`;

        await sock.sendMessage(myNumber, { text: statusMsg });
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
