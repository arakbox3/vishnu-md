import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: "❌ Example: .insta [link]" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        const res = await axios.get(`https://api.api-files.com/api/instagram?url=${encodeURIComponent(text)}`);
        
        if (!res.data || !res.data.status) throw new Error("Media not found");

        const data = res.data.result; 
        const date = new Date().toLocaleDateString();

        const statusMsg = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Insta Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TYPE:* Instagram Media
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Instagram
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *STATUS:* Processing...
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DATE:* ${date}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        for (let item of data) {
            const mediaRes = await axios.get(item.url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(mediaRes.data);

            if (item.type === 'video') {
                await sock.sendMessage(chat, {
                    video: buffer,
                    caption: statusMsg,
                    mimetype: 'video/mp4'
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chat, {
                    image: buffer,
                    caption: statusMsg
                }, { quoted: msg });
            }
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ Instagram link is private or invalid." }, { quoted: msg });
    }
};
