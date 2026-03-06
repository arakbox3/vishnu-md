import axios from 'axios';
import ytSearch from 'yt-search';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ---------------- YTMP3 LOGIC ---------------- */
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
    const { data: convertData } = await axios.get(`${initData.convertURL}&v=${videoID}&f=mp3&_=${Math.random()}`, { headers });

    let attempts = 0;
    while (attempts < 30) {
        const { data: prog } = await axios.get(convertData.progressURL, { headers });
        if (prog.progress === 3) return convertData.downloadURL; // Return direct link
        if (prog.progress === -1) throw new Error("Conversion failed on server");
        await delay(2000);
        attempts++;
    }
    throw new Error("Timeout: Audio taking too long to convert");
};

/* ---------------- MAIN COMMAND ---------------- */
export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(chat, { text: "❌ Please provide a name or link! *Example: .audio callin u*" });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 1. YouTube Search
        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) return sock.sendMessage(chat, { text: "❌ Video not found!" });

        // Your Custom Caption Design
        const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
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
> ©️ 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ 𝑠ɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ 𝑎𝑟𝑢𝑛.𝑐𝑢𝑚𝑎𝑟 ヅ`;

        // 2. Send Thumbnail
        await sock.sendMessage(chat, { 
            image: { url: video.thumbnail }, 
            caption: captionText 
        }, { quoted: msg });

        // 3. Get Audio Link and Download
        const audioUrl = await ytd(video.url);
        const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(response.data);

        // 4. FFmpeg Conversion (For perfect playback)
        const convertAudio = (buffer) => {
            return new Promise((resolve, reject) => {
                const inputStream = new PassThrough();
                inputStream.end(buffer);
                const outputStream = new PassThrough();
                const chunks = [];
                ffmpeg(inputStream)
                    .toFormat('mp3')
                    .audioBitrate('128k')
                    .on('error', reject)
                    .pipe(outputStream);
                  outputStream.on('data', chunk => chunks.push(chunk));
        outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
};
        const finalBuffer = await convertAudio(inputBuffer);

        // 5. Send Audio
        try {
    const response = await axios({
        method: 'get',
        url: video.thumbnail,
        responseType: 'stream'
    });
 
    await sock.sendMessage(chat, {
        audio: finalBuffer, 
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: true, 
        contextInfo: {
            externalAdReply: {
                title: video.title,
                body: 'Asura-MD Music Downloader',
                thumbnailUrl: video.thumbnail, 
                mediaType: 1,
                renderLargerThumbnail: true,
                sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24'
              }
           }  
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ Error: " + e.message }, { quoted: msg });
    }
};
