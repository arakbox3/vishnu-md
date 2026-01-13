import fs from 'fs';

let welcomeStatus = {}; 

export default async (sock) => {

    // 1. കമാൻഡ് ഹാൻഡ്ലർ (Welcome On/Off ചെയ്യാൻ)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

            if (text.toLowerCase() === '.welcome on') {
                welcomeStatus[chat] = true;
                await sock.sendMessage(chat, { text: "*🔛*" }, { quoted: msg });
            } else if (text.toLowerCase() === '.welcome off') {
                welcomeStatus[chat] = false;
                await sock.sendMessage(chat, { text: "❌ *Asura MD Welcome System Deactivated!*" }, { quoted: msg });
            }
        } catch (e) {
            console.log("Command Error: ", e);
        }
    });

    // 2. വെൽക്കം ഹാൻഡ്ലർ (DP സഹിതം)
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            const chat = anu.id;
            
            // ചെക്ക്: ഈ ഗ്രൂപ്പിൽ വെൽക്കം ഓൺ ആണോ എന്ന് നോക്കുന്നു
            if (!welcomeStatus[chat]) return;

            if (anu.action === 'add') {
                const metadata = await sock.groupMetadata(chat);
                const thumbPath = "./media/thumb.jpg";

                for (let jid of anu.participants) {
                    const userName = jid.split('@')[0];
                    const groupName = metadata.subject;
                    const groupDesc = metadata.desc || "Welcome to our group!";

                    
                    let ppUrl;
                    try {
                        ppUrl = await sock.profilePictureUrl(jid, 'image');
                    } catch {
                        
                        ppUrl = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : 'https://i.imgur.com/your-image.jpg';
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

                
                    await sock.sendMessage(chat, {
                        image: typeof ppUrl === 'string' ? { url: ppUrl } : ppUrl,
                        caption: welcomeText,
                        mentions: [jid]
                    });
                }
            }
        } catch (err) {
            console.log('Welcome Error: ', err);
        }
    });
};
