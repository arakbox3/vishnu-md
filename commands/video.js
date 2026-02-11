import axios from 'axios';
import ytSearch from 'yt-search';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const ytd = async (url) => {
    const headers = { 
        'Referer': 'https://id.ytmp3.mobi/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    let videoID;
    try {
        const parsed = new URL(url);
        if (parsed.hostname === "youtu.be") videoID = parsed.pathname.slice(1);
        else videoID = parsed.searchParams.get("v");
    } catch { throw new Error("Invalid URL"); }

    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const { data: convertData } = await axios.get(`${initData.convertURL}&v=${videoID}&f=mp4&_=${Math.random()}`, { headers });

    let attempts = 0;
    while (attempts < 30) {
        const { data: prog } = await axios.get(convertData.progressURL, { headers });
        if (prog.progress === 3) return { url: convertData.downloadURL };
        await delay(1000);
        attempts++;
    }
    throw new Error("Timeout");
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chat, { text: "❌ Please provide a name or link!" });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 1. YouTube Search to get metadata
        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) return sock.sendMessage(chat, { text: "❌ Video not found!" });

        // Your Custom Caption Design
        const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *VIEWS:* ${video.views.toLocaleString()}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *AGO:* ${video.ago}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 2. Send Thumbnail with the Design Caption
        await sock.sendMessage(chat, { 
            image: { url: video.thumbnail }, 
            caption: captionText 
        }, { quoted: msg });

        // 3. Get Stream Link and Send Video
        const videoData = await ytd(video.url);

        await sock.sendMessage(chat, {
            video: { url: videoData.url },
            mimetype: 'video/mp4',
            caption: `✅ *${video.title}* downloaded successfully!`
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ Error: Could not download the video." });
    }
};
