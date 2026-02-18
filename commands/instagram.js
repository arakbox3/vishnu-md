import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chat, { text: "❌ Example: .Instagram <link> OR .Instagram search_name" }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        let url = query;

        // 1. IMPROVED SEARCH LOGIC (If not a link)
        if (!query.includes('instagram.com')) {
            // searching
            const searchUrl = `https://www.google.com/search?q=site:instagram.com/reels/+${encodeURIComponent(query)}&gbv=1`;
            const { data: searchHtml } = await axios.get(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36' }
            });
            
            const match = searchHtml.match(/https:\/\/www\.instagram\.com\/(?:p|reels|reel)\/([a-zA-Z0-9_-]+)/);
            if (!match) return sock.sendMessage(chat, { text: "❌ No public results found! Try giving direct link." }, { quoted: msg });
            url = match[0];
        }

        // 2. SCRAPING LOGIC (Using a more stable endpoint)
        // Note: Saveclip/Evoig often change. Using a fallback logic here.
        const res = await axios.post('https://saveclip.app/api/ajaxSearch', 
            new URLSearchParams({ q: url, vt: 'facebook' }), // Some sites use shared logic
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        );

        // Regex to extract link - More flexible
        const dlUrlMatch = res.data.data.match(/href=\\"(https:\/\/.*?)\\"/);
        if (!dlUrlMatch) throw new Error("Private account or Invalid Link");

        const dlUrl = dlUrlMatch[1].replace(/\\/g, '');
        
        // Media Buffer
        const mediaRes = await axios.get(dlUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(mediaRes.data);

        // Design
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Instagram Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* Insta Media
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Instagram
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *TYPE:* Video/Image
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *STATUS:* Success ✅
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        const isVideo = dlUrl.includes('.mp4') || dlUrl.includes('fbcdn.net');

        if (isVideo) {
            await sock.sendMessage(chat, {
                video: buffer,
                caption: caption,
                mimetype: 'video/mp4',
                contextInfo: {
                    externalAdReply: {
                        title: "ASURA INSTA DOWNLOADER",
                        body: "Processed Successfully",
                        mediaType: 1,
                        thumbnailUrl: "https://i.imgur.com/26Xm90Y.jpeg", 
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { image: buffer, caption: caption }, { quoted: msg });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ Error: Private account 🤣!" }, { quoted: msg });
    }
};
