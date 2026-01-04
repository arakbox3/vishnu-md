import axios from 'axios';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imageName = args.join(" ");
    const thumbPath = './media/thumb.jpg';

    if (!imageName) {
        const helpMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙ ɪᴍᴀɢᴇ sᴇᴀʀᴄʜᴇʀ*
┃ *⊙ ᴜsᴀɢᴇ: .image <query>*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        if (fs.existsSync(thumbPath)) {
            return sock.sendMessage(chat, { image: fs.readFileSync(thumbPath), caption: helpMsg });
        } else {
            return sock.sendMessage(chat, { text: helpMsg });
        }
    }

    try {
        await sock.sendMessage(chat, { text: `Searching for *${imageName}*... 🔍` });

        // Using a public API for image searching
        const response = await axios.get(`https://api.fdci.se/sosmed/rep.php?gambar=${imageName}`);
        const results = response.data;
        
        if (results.length > 0) {
            // Pick a random image from top 10 results
            const randomImg = results[Math.floor(Math.random() * Math.min(results.length, 10))];
            
            await sock.sendMessage(chat, { 
                image: { url: randomImg }, 
                caption: `*Result for:* ${imageName}\n*Bot:* Asura MD 👺` 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: "❌ No images found for this name." });
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ Error fetching image. Please try again later." });
    }
};
