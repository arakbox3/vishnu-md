import axios from 'axios';
import yts from 'yt-search';

export default async (sock, msg, args) => {
    const chatId = msg.key.remoteJid;
    const searchQuery = args.join(" ");

    if (!searchQuery) {
        return sock.sendMessage(chatId, { text: '❌ Please provide a name or YouTube link!' }, { quoted: msg });
    }

    try {
        // 1. YouTube Search
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) return sock.sendMessage(chatId, { text: '❌ Video not found!' });
        
        const video = videos[0];
        const videoUrl = video.url;

        // 2. List of 5 Powerful APIs
        const apiList = [
            `https://api.siputzx.my.id/api/d/ytmp4?url=${videoUrl}`,
            `https://api.zenkey.my.id/api/download/ytmp4?url=${videoUrl}`,
            `https://widipe.com/download/ytdl?url=${videoUrl}`,
            `https://api.boxi.my.id/api/youtube/mp4?url=${videoUrl}`,
            `https://api.agatz.xyz/api/ytmp4?url=${videoUrl}`
        ];

        let downloadUrl = null;
        let success = false;

        // 3. Trying APIs one by one (Fallback System)
        for (const api of apiList) {
            try {
                const res = await axios.get(api);
                // ഓരോ API-യുടെയും റെസ്പോൺസ് സ്ട്രക്ചർ വ്യത്യസ്തമായിരിക്കും
                downloadUrl = res.data?.data?.dl || res.data?.result?.url || res.data?.result?.download || res.data?.url;
                
                if (downloadUrl) {
                    success = true;
                    break; 
                }
            } catch (e) {
                continue; // അടുത്ത API ട്രൈ ചെയ്യും
            }
        }

        if (!success || !downloadUrl) {
            throw new Error("All APIs are currently busy.");
        }

        // 4. Asura MD Design Caption
        const caption = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🎬 *Video Downloaded*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
 ⊙🎬 *TITLE:* ${video.title}
 ⊙⏳ *DURATION:* ${video.timestamp}
 ⊙🔗 *LINK:* ${videoUrl}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        // 5. Send Video (No local download, streaming via URL)
        await sock.sendMessage(chatId, {
            video: { url: downloadUrl },
            caption: caption,
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`
        }, { quoted: msg });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, { text: '❌ Failed to process video. Please try again later.' });
    }
};
