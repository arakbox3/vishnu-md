import axios from 'axios';
import ytSearch from 'yt-search';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Audio Streaming Function
const yta = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    let videoID;
    try {
        const parsed = new URL(url);
        if (parsed.hostname === "youtu.be") videoID = parsed.pathname.slice(1);
        else videoID = parsed.searchParams.get("v");
    } catch { throw new Error("Invalid URL"); }

    const { data: initData } = await axios.get(
        `https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`,
        { headers }
    );
    
    // f: "mp3" എന്നത് ഓഡിയോ ഫയലിന് വേണ്ടിയാണ്
    const urlParam = { v: videoID, f: "mp3", _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });

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

    if (!query) return sock.sendMessage(chat, { text: "❌ example .audio name/link!" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

        // Search Video Information
        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) return sock.sendMessage(chat, { text: "❌ not found!" }, { quoted: msg });

        // Your Custom Design Caption
        const infoText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DURATION:* ${video.timestamp}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 1. Send Thumbnail with Design
        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        // 2. Get Audio Stream Link
        const audioData = await yta(video.url);

        // 3. Send Audio File (PTT: false for normal audio)
        await sock.sendMessage(chat, {
            audio: { url: audioData.url },
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ error." }, { quoted: msg });
    }
};

