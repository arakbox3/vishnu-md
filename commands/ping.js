import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';
    const audioPath = './media/song.opus'; 

    try {
        await sock.sendMessage(chat, { react: { text: "⚡", key: msg.key } });

        const { key } = await sock.sendMessage(chat, { text: "🚀 Connecting to Asura Server..." });

        const frames = [
            "📶 Tᴇsᴛɪɴɢ Lᴀᴛᴇɴᴄʏ...",
            "📡 Nᴇᴛᴡᴏʀᴋ: Sᴛᴀʙʟᴇ",
            "👺 Asᴜʀᴀ MD Eɴɢɪɴᴇ Rᴇᴀᴅʏ!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        // Ping Calculation
        const ping = Date.now() - (msg.messageTimestamp * 1000);
        
        // Speed/Status Logic (Uptime-ന് പകരം)
        const speedStatus = ping < 500 ? "Turbo 🚀" : "Normal ⚡";
        const netStatus = "🟢 High Speed";

        const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰────────────❂*

╭╌❲ *ʙᴏᴛ ᴘᴇʀꜰᴏʀᴍᴀɴᴄᴇ* ❳
╎ ⊙ 🚀𝚂𝚙𝚎𝚎𝚍 : ${speedStatus}
╰━━━━━━━━━━━━━━┈⊷
╎ ⊙ 📡𝙻𝚊𝚝𝚎𝚗𝚌𝚢 : ${Math.abs(ping)} 𝚖𝚜
╰━━━━━━━━━━━━━━┈⊷
╎ ⊙ 📶𝙽𝚎𝚝𝚠𝚘𝚛𝚔 : ${netStatus}
╰━━━━━━━━━━━━━━┈⊷
╎ ⊙ 👨‍💻𝙳𝚎𝚟 : arun.Cumar
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 1. മെയിൻ പിംഗ് മെസ്സേജ് (Image + Caption)
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: pingMsg }, { quoted: msg });
        }

        // 2. വോയിസ് മെസ്സേജ് അയക്കുന്നു (song.opus)
        if (fs.existsSync(audioPath)) {
            await sock.sendMessage(chat, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

        // 3.(Ads)
        const groupLink = "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24";
        const adMsg = `🏮 *Asura MD Community:*
Stay updated with us!

🔗 ${groupLink}

> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, { 
            text: adMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD OFFICIAL COMMUNITY",
                    body: "Join now for bot support! ✨",
                    mediaType: 1,
                    sourceUrl: groupLink,
                    showAdAttribution: false,
                    renderLargerThumbnail: true 
                }
            }
        });

    } catch (e) {
        console.error("Ping Error:", e);
    }
};
