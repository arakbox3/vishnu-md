import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: "❌Example: .Flix fun videos." }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // TIKWM Scraper Logic (No API Key needed)
        const isUrl = text.match(/(https:\/\/www\.|https:\/\/vm\.|https:\/\/vt\.|http:\/\/vm\.|http:\/\/vt\.)tiktok\.com\/[a-zA-Z0-9]+/g);
        
        let apiUrl = isUrl 
            ? `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}` 
            : `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(text)}`;

        const response = await axios.get(apiUrl);
        const res = response.data;

        if (!res || res.code !== 0) throw new Error("Video not found");

        // searching
        const data = isUrl ? res.data : res.data.videos[0];
        
        const title = data.title || "TikTok Media";
        const author = data.author.nickname || "Unknown";
        const views = data.play_count || "0";
        const date = new Date().toLocaleDateString(); 

        // Design 
        const statusMsg = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ASURA FLIX*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title.substring(0, 30)}...
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *AUTHOR:* ${author}
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *VIEWS:* ${views}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DATE:* ${date}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // buffer
        if (data.images && data.images.length > 0) {
            // TikTok Photos (Slideshow) ആണെങ്കിൽ
            for (let img of data.images) {
                const imgRes = await axios.get(img, { responseType: 'arraybuffer' });
                await sock.sendMessage(chat, { image: Buffer.from(imgRes.data), caption: author }, { quoted: msg });
            }
        } else {
            // TikTok Video
            const videoRes = await axios.get(data.play, { responseType: 'arraybuffer' });
            const videoBuffer = Buffer.from(videoRes.data);

            await sock.sendMessage(chat, {
                video: videoBuffer,
                caption: statusMsg,
                mimetype: 'video/mp4',
                contextInfo: {
                    externalAdReply: {
                        title: "ASURA TIKTOK DOWNLOADER",
                        body: author,
                        thumbnailUrl: data.cover,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: msg });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ error." }, { quoted: msg });
    }
};
