import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "⏰", key: msg.key } });

        // 2. ആനിമേഷൻ (Safe Interval 1.3s)
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
            "🚀 ▰▱▱▱▱▱▱▱▱▱ 🔸️10%",
            "🚀 ▰▰▰▰▱▱▱▱▱▱ 🔸️40%",
            "🚀 ▰▰▰▰▰▰▰▱▱▱ 🔸️70%",
            "🚀 ▰▰▰▰▰▰▰▰▰▰ 🔸️100%",
            "👺 Asura MD Engine Ready!",
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 1200)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        await sock.sendMessage(chat, { react: { text: "✔", key: msg.key } });

        const imagePath = './media/thumb.jpg'; 
        const songPath = './media/song.opus'; 

        const helpText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
╔━━━━━━━━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━⛥❖⛥━━━❥❥❥
┃ ⊙📡.Ping–Check bot speed.
┃ ⊙🔋.Alive–Check if bot is online.
┃ ⊙📜 .Menu–See all commands.
┃ ⊙🎵 .Song <name>–save audio/MP3.
┃ ⊙🎬 .Video <name>–save video/MP4.
┃ ⊙🖼️ .Sticker–Turn image/video/gif into a sticker.
┃ ⊙🎮 .Game–Play built-in games.
┃ ⊙🎭 .Fun–Jokes and fun activities.
┃ ⊙🤖 .Ai <text>–Chat with the AI.
┃ ⊙🆎️ .Font <text>–Change text to stylish fonts.
┃ ⊙👤 .Owner–Get creator's info.
┃ ⊙📓 .Help–Get usage support.
┃ ⊙🎧 .Play <name> <name>–Search and play music.
┃ ⊙📢 .Tagall–Mention all group members.
┃ ⊙📷 .Image <name>–Search and save photos
╚━━━⛥❖⛥━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━⛥❖⛥━━━❥❥❥
┃ *💡 How to Use 👺 Asura MD:*
┃⦿ *Prefix:* [ . ] (Dot)
┃⦿ *Usage:* Prefix + Command
┃⦿ *Example: .alive | .ping*
╚━━━━⛥❖⛥━━━❥❥❥

> *✅Select a command from the list above and type it with a dot.*

© 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ
𝑠ɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ 𝑎𝑟𝑢𝑛.𝑐𝑢𝑚𝑎𝑟 ヅ
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        // 3. Send Image with help Text
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, {
                image: { url: imagePath },
                caption: helpText
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: helpText }, { quoted: msg });
        }

        // 4. Send Opus Audio 
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
        console.error("Error in Help command:", error);
    }
};

