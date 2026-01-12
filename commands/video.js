import yts from "yt-search";
import axios from "axios";

// API കൺഫിഗറേഷൻ
const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

// ആവർത്തിച്ച് ശ്രമിക്കാനുള്ള ഫങ്ക്ഷൻ
async function tryRequest(getter, attempts = 2) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) await new Promise(r => setTimeout(r, 1000));
        }
    }
    throw lastError;
}

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const searchText = args.join(" ");

    if (!searchText) {
        return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
    }

    try {
        // 1. വീഡിയോ സെർച്ച് ചെയ്യുന്നു
        const search = await yts(searchText);
        const video = search.videos[0];

        if (!video) {
            return sock.sendMessage(chat, { text: "Video Not Found 😢" });
        }

        // നിങ്ങളുടെ അതേ ഡിസൈൻ ക്യാപ്ഷൻ
        const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *AGO:* ${video.ago}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, { 
            image: { url: video.thumbnail }, 
            caption: captionText 
        }, { quoted: msg });

      
        // format=mp4 Api
        let downloadUrl = `https://ytapi-0n47.onrender.com/download?format=mp4&url=${encodeURIComponent(video.url)}`;

        // 3. വീഡിയോ അയക്കുന്നു
        await sock.sendMessage(chat, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`,
            caption: `*🎬 ${video.title}*\n\n*👺Asura MD*`,
            contextInfo: {
                matchingText: video.title,
                forwardingScore: 999,
                isForwarded: true,
            }
        }, { quoted: msg });

    } catch (err) {
        console.error("Video Download Error:", err);
        await sock.sendMessage(chat, { text: "❌ All servers are busy or file too large. Please try again later!" });
    }
};
