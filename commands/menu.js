import fs from 'fs';

export default async (sock, msg, query) => {
        const from = msg.key.remoteJid;
        
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
┃ *⊙  .Menu* ┃ *⊙  .Song   <name>*
┃ *⊙  .Video  <name>*
┃ *⊙  .sticker*
┃ *⊙  .Game*
┃ *⊙  .Pair   <91XXXXXXXXXX>* 
┃ °☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD* 
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        try {
            // 1. ആദ്യം ഇമേജ് അയക്കുന്നു
            if (fs.existsSync(imagePath)) {
                await sock.sendMessage(from, { 
                    image: fs.readFileSync(imagePath), 
                    caption: menuText 
                });
            } else {
                await sock.sendMessage(from, { text: menuText });
            }

            // 2. ഇമേജിന് ശേഷം ഓഡിയോ (Song) അയക്കുന്നു
            if (fs.existsSync(songPath)) {
                await sock.sendMessage(from, { 
                    audio: fs.readFileSync(songPath), 
                    mimetype: 'audio/mp4', // WhatsApp വോയിസ് മെസ്സേജ് ആയി വരാൻ mp4/ogg നൽകാം
                    ptt: true // ഇത് true ആക്കിയാൽ വോയിസ് നോട്ട് പോലെ കാണപ്പെടും
                }, { quoted: msg });
            }

        } catch (error) {
            console.error("Error in menu command:", error);
            await sock.sendMessage(from, { text: "Error sending menu!" });
        }
    
