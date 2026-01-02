import pkg from "@whiskeysockets/baileys";
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = pkg;

import pino from "pino";
import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startAsura() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" })
    });

    // Pairing Code Logic
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('Enter your Phone Number (with Country Code): ');
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n\x1b[32mYOUR PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('✅ Asura MD Connected Successfully!');

            // കണക്ട് ആകുമ്പോൾ അയക്കുന്ന സക്സസ് മെസ്സേജ്
            const successMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*Hello! I'm Asura MD*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙Successfully connected ✅*
╠━━━━━━━━━━━━━❥❥❥
┃ *⊙🫀health:-  100%*
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

            await sock.sendMessage(sock.user.id, { text: successMsg });
        }
    });

    // Command Handler
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const prefix = ".";
        
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Commands ഫോൾഡറിൽ നിന്ന് ഓട്ടോമാറ്റിക് ആയി ഫയൽ എടുക്കുന്നു
        try {
            const cmdFile = `./commands/${commandName}.js`;
            if (fs.existsSync(cmdFile)) {
                const { default: command } = await import(cmdFile);
                await command(sock, msg, args.join(" "));
            }
        } catch (err) {
            console.error(err);
        }
    });
}

startAsura();
