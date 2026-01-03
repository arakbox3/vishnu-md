import fs from 'fs';

// ബോട്ട് സ്റ്റാർട്ട് ചെയ്ത സമയം കണക്കാക്കാൻ
const startTime = Date.now();

export default async (sock, msg, query) => {
    const from = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';

    // 1. Ping കണക്കാക്കുന്നു
    const timestamp = Date.now();
    const ping = timestamp - (msg.messageTimestamp * 1000);

    // 2. Uptime കണക്കാക്കുന്നു
    const now = Date.now();
    const diff = now - startTime;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`\`\`👺Asura MD\`\`\` 」
*╰─────────────────❂*
*Hello! I'm Asura MD, your fastest Assistant! ✨*

╭╌❲ *ʙᴏᴛ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 : Asura MD
╎ ⊙ 𝙿𝚒𝚗𝚐    : ${ping} 𝚖𝚜
╎ ⊙ 𝚄𝚙𝚝𝚒𝚖𝚎  : ${uptimeString}
╎ ⊙ 𝙾𝚠𝚗𝚎𝚛  : arun.Cumar
╰╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    try {
        // ഇമേജ് ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            });
        } else {
            // ഇമേജ് ഇല്ലെങ്കിൽ ടെക്സ്റ്റ് മാത്രം അയക്കുന്നു
            await sock.sendMessage(from, { text: pingMsg });
        }
    } catch (e) {
        console.error("Ping Error:", e);
        await sock.sendMessage(from, { text: pingMsg });
    }
};
