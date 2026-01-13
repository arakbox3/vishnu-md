import fs from 'fs';

const dbPath = './welcome_db.json';
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

export default async (sock) => {

    // 1. കമാൻഡ് ഹാൻഡ്ലർ (Admins Only)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            
            if (text.toLowerCase() === '.welcome on' || text.toLowerCase() === '.welcome off') {
                const metadata = await sock.groupMetadata(chat);
                const participants = metadata.participants;
                const sender = msg.key.participant || msg.key.remoteJid;
                
                // അഡ്മിൻ ആണോ എന്ന് പരിശോധിക്കുന്നു
                const isAdmin = participants.find(p => p.id === sender)?.admin;
                
                if (!isAdmin) {
                    return sock.sendMessage(chat, { text: "❌ *This command is only for Group Admins!*" }, { quoted: msg });
                }

                let db = JSON.parse(fs.readFileSync(dbPath));
                if (text.toLowerCase() === '.welcome on') {
                    db[chat] = true;
                    await sock.sendMessage(chat, { text: "✅ *Welcome System Activated by Admin!*" }, { quoted: msg });
                } else {
                    db[chat] = false;
                    await sock.sendMessage(chat, { text: "❌ *Welcome System Deactivated by Admin!*" }, { quoted: msg });
                }
                fs.writeFileSync(dbPath, JSON.stringify(db));
            }
        } catch (e) {
            console.log("Cmd Error: ", e);
        }
    });

    // 2. വെൽക്കം ഹാൻഡ്ലർ (No Spam & Direct DP)
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            const chat = anu.id;
            let db = JSON.parse(fs.readFileSync(dbPath));
            if (!db[chat]) return;

            if (anu.action === 'add') {
                const metadata = await sock.groupMetadata(chat);
                const thumbPath = "./media/thumb.jpg";

                // ഒരേസമയം ഒരുപാട് പേർ വന്നാൽ സ്പാം ഒഴിവാക്കാൻ ഒരാളുടെ മാത്രം അയക്കുന്നു (അല്ലെങ്കിൽ ലൂപ്പ് നിയന്ത്രിക്കാം)
                const jid = anu.participants[0]; 
                const userName = jid.split('@')[0];
                const groupName = metadata.subject;

                let ppUrl;
                try {
                    ppUrl = await sock.profilePictureUrl(jid, 'image');
                } catch {
                    ppUrl = null;
                }

                const welcomeText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 👺 *Welcome to Group*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *New Member!* ❳•°•
 ⊙👤 *USER:* @${userName}
 ⊙🏰 *GROUP:* ${groupName}
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

                const finalImage = ppUrl ? { url: ppUrl } : (fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://i.imgur.com/your-image.jpg' });

                await sock.sendMessage(chat, {
                    image: finalImage,
                    caption: welcomeText,
                    mentions: [jid]
                });
            }
        } catch (err) {
            console.log('Welcome Error: ', err);
        }
    });
};
