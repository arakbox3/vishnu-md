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

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startAsura() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

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

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\nEnter your Phone Number (eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\nYOUR PAIRING CODE: ${code}\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('✅ Asura MD Connected Successfully!');
            await sock.sendMessage("919048044745@s.whatsapp.net", { text: "*Asura MD Online!* Type .ping to test." });
        }
    });

    // 100% Working Command Handler Section
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            // മെസ്സേജ് ബോഡി കൃത്യമായി എടുക്കുന്നു
            const body = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || "";
            
            const prefix = "."; 
            if (!body.startsWith(prefix)) return;

            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // കമാൻഡ് ഫയലിലേക്കുള്ള കൃത്യമായ പാത്ത്
            const commandPath = path.join(process.cwd(), 'commands', `${commandName}.js`);

            if (fs.existsSync(commandPath)) {
                // Dynamic Import (ESM)
                const commandModule = await import(pathToFileURL(commandPath).href);
                
                // ഫയലിനുള്ളിൽ 'export default' ഉണ്ടോ എന്ന് ചെക്ക് ചെയ്യുന്നു
                const runCommand = commandModule.default;
                
                if (typeof runCommand === 'function') {
                    await runCommand(sock, msg, args);
                    console.log(`Executed: ${commandName}`);
                } else {
                    console.log(`Error: ${commandName}.js is not exporting a function.`);
                }
            } else {
                console.log(`File not found: ${commandPath}`);
            }
        } catch (err) {
            console.error("Command error:", err);
        }
    });
}

startAsura();
