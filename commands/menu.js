import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 2. ആനിമേഷൻ (Safe Interval 1.2s)
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
            "▰▱▱▱▱▱▱▱▱▱ 10%",
            "▰▰▰▰▱▱▱▱▱▱ 40%",
            "▰▰▰▰▰▰▰▱▱▱ 70%",
            "▰▰▰▰▰▰▰▰▰▰ 100%",
            "🚀 Asura MD Engine Ready!",
            "✅ Sending Menu Now!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 1200)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

        const imagePath = './media/thumb.jpg'; 
        const songPath = './media/song.opus'; 

        const menuText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙  .Ping*
┃ *⊙  .Alive*
┃ *⊙  .Menu*
┃ *⊙  .Song   <name>*
┃ *⊙  .Video  <name>*
┃ *⊙  .Sticker*
┃ *⊙  .Game*
┃ *⊙  .Fun*
┃ *⊙  .Font <text>*
┃ *⊙  .Owner*
┃ *⊙  .Play <name>*
┃ *⊙  .Tagall*
┃ *⊙  .Image <name>* ┃ °☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        // 3. Send Image with Menu Text
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, {
                image: fs.readFileSync(imagePath),
                caption: menuText
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: menuText }, { quoted: msg });
        }

        // 4. Send Opus Audio (As Voice Note with Context Info)
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, {
                audio: { url: songPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: 'Asura MD 👺',
                        body: 'Playing Menu Theme...',
                        thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                        mediaType: 1,
                        sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24'
                    }
                }
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Error in menu command:", error);
    }
};
