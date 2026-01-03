import fs from 'fs';

export default async (sock, msg, args) => {
const searchQuery = args.join(" ");
const chat = msg.key.remoteJid;
const imagePath = './media/thumb.jpg'; 
const songPath = './media/song.ogg'; 

    const menuText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙  .Ping*
┃ *⊙  .Alive*
┃ *⊙  .Menu*
┃ *⊙  .Song   <name>*
┃ *⊙  .Video  <name>*
┃ *⊙  .sticker*
┃ *⊙  .Game*
┃ *⊙  .Pair   <91XXXXXXXXXX>* 
┃ °☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD* > 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

    try {
        // 1. Send Image
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: menuText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: menuText }, { quoted: msg });
        }

        // 2. Send Audio (Voice Note)
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: fs.readFileSync(songPath), 
                mimetype: 'audio/mp4', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Error in menu command:", error);
    }
};

