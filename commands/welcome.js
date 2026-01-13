import fs from 'fs';

// സെറ്റിംഗ്സ് സേവ് ചെയ്യാൻ ഒരു ഫയൽ ഉപയോഗിക്കുന്നു (Permanent Storage)
const dbPath = './welcome_db.json';
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}));

export default async (sock) => {

    // 1. കമാൻഡ് ഹാൻഡ്ലർ (.welcome on / off)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

            if (text.toLowerCase() === '.welcome on') {
                let db = JSON.parse(fs.readFileSync(dbPath));
                db[chat] = true;
                fs.writeFileSync(dbPath, JSON.stringify(db));
                await sock.sendMessage(chat, { text: "✅ *Asura MD Welcome System Activated!*" }, { quoted: msg });
            } 
            else if (text.toLowerCase() === '.welcome off') {
                let db = JSON.parse(fs.readFileSync(dbPath));
                db[chat] = false;
                fs.writeFileSync(dbPath, JSON.stringify(db));
                await sock.sendMessage(chat, { text: "❌ *Asura MD Welcome System Deactivated!*" }, { quoted: msg });
            }
        } catch (e) {
            console.log("Welcome Cmd Error: ", e);
        }
    });

    // 2. വെൽക്കം ഹാൻഡ്ലർ (DP സഹിതം)
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            const chat = anu.id;
            let db = JSON.parse(fs.readFileSync(dbPath));
            
            // ഈ ഗ്രൂപ്പിൽ ഓൺ ആണെങ്കിൽ മാത്രം പ്രവർത്തിക്കുക
            if (!db[chat]) return;

            if (anu.action === 'add') {
                const metadata = await sock.groupMetadata(chat);
                const thumbPath = "./media/thumb.jpg";

                for (let jid of anu.participants) {
                    const userName = jid.split('@')[0];
                    const groupName = metadata.subject;
                    const groupDesc = metadata.desc || "Welcome to our group!";

                    // മെമ്പറുടെ DP എടുക്കുന്നു (No local download)
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
> *📜 DESCRIPTION:*
${groupDesc}

> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

                    // അയക്കേണ്ട ചിത്രം തീരുമാനിക്കുന്നു (No storage use)
                    const finalImage = ppUrl ? { url: ppUrl } : (fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://i.imgur.com/your-image.jpg' });

                    await sock.sendMessage(chat, {
                        image: finalImage,
                        caption: welcomeText,
                        mentions: [jid]
                    });
                }
            }
        } catch (err) {
            console.log('Welcome Process Error: ', err);
        }
    });
};
