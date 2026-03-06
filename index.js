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
    // 1. Setup Auth State
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    // 2. Initialize Socket
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

    // 3. Pairing Code Logic
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\n📞Enter your Phone Number with Country Code (eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\x1b[32m\nYOUR 🗝 PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    // Save credentials whenever they are updated
    sock.ev.on('creds.update', saveCreds);

let hasAttemptedJoin = false;
    // 4. Connection Handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('\x1b[36m✅ Asura MD Connected Successfully!\x1b[0m');
            const myNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
               
        const activeMsg = `
╭━━〔 *👺 ASURA-MD* 〕━━╮
┃🛠️ STATUS: Online and Ready 
┃👤 OWNER: arun.°Cumar
┃⚙️ MODE: Public
┃📌 PREFIX: [ .,!#$@ ]
┃🤖 BOT Connected Successfully!✅
╰━━━━━━━━━━━━━━━╯

*The Underworld is Active!* 👺`;

        try {
            // 1. Send photo or message
            const imagePath = './media/thumb.jpg'; 
            
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(myNumber, { 
                    image: fs.readFileSync(imagePath), 
                    caption: activeMsg,
                    contextInfo: {
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363422992896382@newsletter',
                            newsletterName: '👺 ASURA-MD', 
                            serverMessageId: -1
                        }
                    }
                });
            } else {
                await sock.sendMessage(myNumber, { text: activeMsg });
            }
        } catch (e) {
            console.log("Login msg error:", e.message);
        }
            setTimeout(async () => {
            if (hasAttemptedJoin) return; 
                try {
            // --- CHANNEL AND GROUP JOIN 
            await sock.newsletterFollow("120363422992896382@newsletter");
            console.log("📢 Channel Followed");

            await sock.groupAcceptInvite("LdNb1Ktmd70EwMJF3X6xPD");
            console.log("👥 Group Join Attempted");
            
            hasAttemptedJoin = true; 
        } catch (e) {
            console.log("ℹ️ Auto-join skipped: Already in or link expired.");
            hasAttemptedJoin = true; 
          }
       }, 100000); 
   }
});

    // 5. Message & Command Handler
    global.isPublic = true;
    sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const msg = chatUpdate.messages[0];
        if (!msg.message) return; 

        const from = msg.key.remoteJid;
        const isLid = from.endsWith('@lid');
        
        const mtype = Object.keys(msg.message).filter(key => 
            !['messageContextInfo', 'senderKeyDistributionMessage'].includes(key)
        )[0];

         const body = (mtype === 'conversation') 
            ? msg.message.conversation 
            : (mtype === 'extendedTextMessage')
            ? msg.message.extendedTextMessage?.text
            : (msg.message[mtype]?.caption || msg.message[mtype]?.text || msg.message[mtype]?.selectedDisplayText || msg.message[mtype]?.title || '');

// --- ANTI-LINK LOGIC START ---
const botNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
const isGroup = from.endsWith('@g.us');
const linkPattern = /chat.whatsapp.com\//gi;
const hasLink = linkPattern.test(body);

if (hasLink && isGroup && !msg.key.fromMe) {
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    
    const sender = msg.key.participant || msg.key.remoteJid;
    const participant = participants.find(p => p.id === sender);
    const bot = participants.find(p => p.id === botNumber);

    const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
    const botIsAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin';

    if (!isAdmin && botIsAdmin) {
        console.log(`🚫 Link detected from ${sender}. Deleting...`);
        
        // 1. മെസ്സേജ് ഡിലീറ്റ് ചെയ്യുന്നു
        await sock.sendMessage(from, { 
            delete: msg.key 
        });

        // 2. വാണിംഗ് നൽകുന്നു
        await sock.sendMessage(from, { 
    text: `👋 *@${sender.split('@')[0]}*, please avoid sending links here. Let’s keep the group clean and spam-free. Thanks! 😊`,
    mentions: [sender]
}, { quoted: msg });
   return; 
    }
}
// --- ANTI-LINK LOGIC END ---

        //public/private mode changer
     
       if (global.isPublic === false && !msg.key.fromMe) {
    return; 
       }

              // prefixes
              const prefixes = ".!@#¢$%^&*()_+-=÷×[]{};':\\\"π¶∆\\•√\₩£€\|,.<>/~₹";
              const firstChar = body.charAt(0);
              const isCmd = prefixes.includes(firstChar);

              if (!isCmd) return; 
              // If only prefix sent
              if (body.trim().length === 1) {
              await sock.sendMessage(from, { 
               text: "👺 *Asura-MD:*  _🔸️Please enter a command after the prefix (Eg., .menu) 🥰_" 
                     }, { quoted: msg });
               return;
               }

               // Now real command parsing
               const prefix = firstChar;
               const args = body.slice(prefix.length).trim().split(/ +/);
               const commandName = args.shift()?.toLowerCase();

               if (!commandName) return;

               // ✅ Typing status 
               if (!isLid) {
               await sock.sendPresenceUpdate('composing', from);
               await new Promise(resolve => setTimeout(resolve, 4000));
              }

              // Command File Execution 
                const commandFile = `${commandName.toLowerCase()}.js`;
                const commandPath = path.join(process.cwd(), 'commands', commandFile);
            if (fs.existsSync(commandPath)) {
                // Dynamic Import with Timestamp to prevent caching issues
                const commandModule = await import(pathToFileURL(commandPath).href + `?update=${Date.now()}`);
                const runCommand = commandModule.default;

                if (typeof runCommand === 'function') {
                    await runCommand(sock, msg, args);
                    console.log(`\x1b[32m[SUCCESS] -> ${commandName} executed\x1b[0m`);
                } else {
                    console.log(`\x1b[31m[ERROR] -> ${commandName}.js missing 'export default'\x1b[0m`);
                }
            } else {
                console.log(`\x1b[31m[NOT FOUND] -> commands/${commandName}.js\x1b[0m`); 
            }        
        } catch (err) {
            console.error("\x1b[31m[CRITICAL ERROR]\x1b[0m", err);
        }
    });
 }
// Start the bot
startAsura();

