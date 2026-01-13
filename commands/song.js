import axios from 'axios';
import yts from 'yt-search';

export default async (sock, msg, args) => {
    const chatId = msg.key.remoteJid;
    const searchQuery = args.join(" ");

    if (!searchQuery) {
        return sock.sendMessage(chatId, { text: '❌ Which song do you want to play?' }, { quoted: msg });
    }

    try {
        // 1. YouTube Search
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return sock.sendMessage(chatId, { text: '❌ Song not found!' }, { quoted: msg });
        }

        const video = videos[0];
        const videoUrl = video.url;

        // 2. 5 Powerful API List
        const apiList = [
            `https://api.siputzx.my.id/api/d/ytmp3?url=${videoUrl}`,
            `https://api.zenkey.my.id/api/download/ytmp3?url=${videoUrl}`,
            `https://widipe.com/download/ytdl?url=${videoUrl}`,
            `https://api.agatz.xyz/api/ytmp3?url=${videoUrl}`,
            `https://api.boxi.my.id/api/youtube/mp3?url=${videoUrl}`
        ];

        let finalAudioUrl = null;
        let success = false;

        // 3. Fallback Logic: ഒന്നൊന്നായി ചെക്ക് ചെയ്യുന്നു
        for (const api of apiList) {
            try {
                const res = await axios.get(api);
                // API റെസ്പോൺസ് അനുസരിച്ച് ലിങ്ക് എടുക്കുന്നു
                finalAudioUrl = res.data?.data?.dl || res.data?.result?.url || res.data?.result?.download || res.data?.url || res.data?.mp3;
                
                if (finalAudioUrl) {
                    success = true;
                    break; 
                }
            } catch (e) {
                continue; // എറർ വന്നാൽ അടുത്ത API നോക്കും
            }
        }

        if (!success || !finalAudioUrl) {
            throw new Error('All music APIs are down.');
        }

        // 4. Asura MD Design
        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹*  *🎵 Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙🎙️ *ARTIST:* ${video.author.name}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        // 5. Send Thumbnail first
        await sock.sendMessage(chatId, { 
            image: { url: video.thumbnail }, 
            caption: infoText 
        }, { quoted: msg });

        // 6. Send Audio Directly (No Local Download)
        await sock.sendMessage(chatId, {
            audio: { url: finalAudioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: 'Asura MD Music Player 👺',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true,
                    sourceUrl: videoUrl
                }
            }
        }, { quoted: msg });

    } catch (error) {
        console.error('[MUSIC ERROR]:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to stream audio. Please try again later.' }, { quoted: msg });
    }
};
