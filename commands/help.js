import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "📋", key: msg.key } });

        // 2. ആനിമേഷൻ (Safe Interval 1.3s)
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
`👻👻👻•❲👺Asura MD❳•👻👻👻 
⌛Loading.
 🔹️▰▱▱▱▱▱▱▱▱▱ 🔸️10%`,

`👾👾👾•❲👺Asura MD❳•👾👾👾
 ⏳Loading.. 
🔹️ ▰▰▱▱▱▱▱▱▱▱ 🔸️20%`,

`😈😈😈•❲👺Asura MD❳•😈😈😈 
⏳Loading... 
🔹️ ▰▰▰▱▱▱▱▱▱▱ 🔸️30%`,

`😁😁😁•❲👺Asura MD❳•😁😁😁
⌛Loading. 
🔹️ ▰▰▰▰▱▱▱▱▱▱ 🔸️40%`,

`😎😎😎•❲👺Asura MD❳•😎😎😎 
⏳Loading.. 
🔹️ ▰▰▰▰▰▱▱▱▱▱ 🔸️50%`,

`💣💣💣•❲👺Asura MD❳•💣💣💣
 ⌛Loading...
🔹️ ▰▰▰▰▰▰▱▱▱▱ 🔸️60%`,

`💥💥💥•❲👺Asura MD❳•💥💥💥 
⏳Loading. 
🔹️▰▰▰▰▰▰▰▱▱▱ 🔸️70%`,

`🤩🤩🤩•❲👺Asura MD❳•🤩🤩🤩 
⌛Loading.. 
🔹️ ▰▰▰▰▰▰▰▰▱▱ 🔸️80%`,

`⭕⭕⭕•❲👺Asura MD❳•⭕⭕⭕ 
⏳Loading... 
🔹️ ▰▰▰▰▰▰▰▰▰▱ 🔸️90%`,

`  🎉⭕•❲👺Asura MD❳•⭕🎉 
✅ ▰▰▰▰▰▰▰▰▰▰ 🔸️100%
 👺 Asura MD Engine Ready!`,

        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 1200)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        await sock.sendMessage(chat, { react: { text: "✔", key: msg.key } });

        const imagePath = './media/asura.jpg'; 
        const songPath = './media/song.opus'; 

        const helpText = `
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
╔━━━━━━━━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━⛥❖⛥━━━❥❥❥
┃ ⊙📡 .Pɪɴɢ – Cʜᴇᴄᴋ ʙᴏᴛ sᴘᴇᴇᴅ.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🔋 .Aʟɪᴠᴇ – Cʜᴇᴄᴋ ɪғ ʙᴏᴛ ɪs ᴏɴʟɪɴᴇ.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙📜 .Mᴇɴᴜ – Sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🎵 .Sᴏɴɢ <ɴᴀᴍᴇ> – sᴀᴠᴇ ᴀᴜᴅɪᴏ/MP3.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🎬 .Vɪᴅᴇᴏ <ɴᴀᴍᴇ> – sᴀᴠᴇ ᴠɪᴅᴇᴏ/MP4.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🔊 .Aᴜᴅɪᴏ <ɴᴀᴍᴇ> – sᴀᴠᴇ ᴀᴜᴅɪᴏ/MP3.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🖼️ .Sᴛɪᴄᴋᴇʀ – Tᴜʀɴ ɪᴍᴀɢᴇ/ᴠɪᴅᴇᴏ/ɢɪғ ɪɴᴛᴏ ᴀ sᴛɪᴄᴋᴇʀ.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🎲 .Gᴀᴍᴇ–Pʟᴀʏ ʙᴜɪʟᴛ - ɪɴ ɢᴀᴍᴇs.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🎭 .Fᴜɴ – Jᴏᴋᴇs ᴀɴᴅ ғᴜɴ ᴀᴄᴛɪᴠɪᴛɪᴇs.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🤖 .Aɪ - Aɪ ᴀssɪsᴛᴀɴᴛ ᴛᴏ ɢᴇᴛ ᴛʜɪɴɢs ᴅᴏɴᴇ  
╰━━━━━━━━━━━━━┈⊷
​┃ ⊙💬 .CʜᴀᴛBᴏᴛ – Aᴜᴛᴏ Rᴇᴘʟʏ Cʜᴀᴛ Bᴏᴛ
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🆎️ .Fᴏɴᴛ <ᴛᴇxᴛ> – Cʜᴀɴɢᴇ ᴛᴇxᴛ ᴛᴏ sᴛʏʟɪsʜ ғᴏɴᴛs.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙👤 .Oᴡɴᴇʀ – Gᴇᴛ ᴄʀᴇᴀᴛᴏʀ's ɪɴғᴏ.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🤯 .Pʟᴀʏ – ʙᴜɪʟᴛ-ɪɴ ɢᴀᴍᴇs.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙📷 .Iᴍᴀɢᴇ <ɴᴀᴍᴇ> – Sᴇᴀʀᴄʜ ᴀɴᴅ sᴀᴠᴇ ᴘʜᴏᴛᴏs.​
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🎤 .Vᴏɪᴄᴇ <ᴛᴇxᴛ> – Cᴏɴᴠᴇʀᴛ ᴛᴇxᴛ ᴛᴏ ᴀᴜᴅɪᴏ.
╰━━━━━━━━━━━━━┈⊷
​┃ ⊙👁 .Vɪᴇᴡ – Sᴇɴᴅ ᴍᴇᴅɪᴀ ᴛʜᴀᴛ ᴏᴘᴇɴs ᴏɴᴄᴇ.
╰━━━━━━━━━━━━━┈⊷
┃ ⊙🩸 .Pᴀʏ — Dᴏɴᴀᴛᴇ
╰━━━━━━━━━━━━━┈⊷
​┃ ⊙🔑 .Pᴀɪʀ - Pᴀɪʀ Cᴏᴅᴇ Gᴇɴᴇʀᴀᴛᴏʀ
╰━━━━━━━━━━━━━━┈⊷
┃ ⊙📓 .Hᴇʟᴘ – Vɪᴇᴡ ᴄᴏᴍᴍᴀɴᴅs
╚━━━⛥❖⛥━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━⛥❖⛥━━━❥❥❥
┃ *💡 How to Use 👺 Asura MD:*
┃⦿ *Prefix:* [ ! . / # ] 
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
        document: { url: './media/asura.jpg' },
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileName: '👺 ASURA MD', 
        fileLength: 9999999999999,
        pageCount: 666,
        caption: helpText,
        contextInfo: {
            externalAdReply: {
                title: 'Asura MD 👺',
                body: 'A Multi-Device WhatsApp Bot',
                thumbnail: fs.readFileSync(imagePath),
                sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24',
                mediaType: 1,
                renderLargerThumbnail: true 
            }
        }
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

