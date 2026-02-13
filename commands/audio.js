import axios from 'axios';
import ytSearch from 'yt-search';
import { exec } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);
const ffPath = ffmpegPath;

if (fs.existsSync(ffPath)) {
    fs.chmodSync(ffPath, 0o755);
}

// 🔥 YTMP3 API (same referer kept)
const getAudioUrl = async (url) => {
    const headers = {
        'Referer': 'https://id.ytmp3.mobi/',
        'User-Agent': 'Mozilla/5.0'
    };

    const videoID = url.includes('youtu.be')
        ? url.split('/').pop()
        : new URL(url).searchParams.get('v');

    const { data: initData } = await axios.get(
        `https://d.ymcdn.org/api/v1/init?p=y&_=${Date.now()}`,
        { headers }
    );

    const params = new URLSearchParams({
        v: videoID,
        f: 'mp3',
        _: Date.now()
    });

    const { data: convertData } = await axios.get(
        `${initData.convertURL}&${params}`,
        { headers }
    );

    if (!convertData.downloadURL) throw new Error("Conversion Failed");

    return convertData.downloadURL;
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(" ");

    if (!query)
        return sock.sendMessage(chat, { text: "❌ .audio name/link !" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Video not found");

        const infoText = `
*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DURATION:* ${video.timestamp}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        // 🔥 Get Direct MP3 URL
        const rawAudioUrl = await getAudioUrl(video.url);

        // 🔥 Download as BUFFER (NO FILE SAVE)
        const response = await axios.get(rawAudioUrl, {
            responseType: 'arraybuffer'
        });

        const inputBuffer = Buffer.from(response.data);

        // 🔥 Convert to clean MP3 using ffmpeg via pipe
        const mp3Command = `"${ffPath}" -i pipe:0 -vn -ab 128k -f mp3 pipe:1`;
        const { stdout: mp3Buffer } = await execPromise(mp3Command, {
            input: inputBuffer,
            maxBuffer: 1024 * 1024 * 20
        });

        // SEND NORMAL AUDIO
        await sock.sendMessage(chat, {
            audio: Buffer.from(mp3Buffer),
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: msg });

        // 🔥 Convert to PTT (OPUS)
        const opusCommand = `"${ffPath}" -i pipe:0 -vn -ac 1 -c:a libopus -b:a 64k -f ogg pipe:1`;
        const { stdout: opusBuffer } = await execPromise(opusCommand, {
            input: inputBuffer,
            maxBuffer: 1024 * 1024 * 20
        });

        // SEND VOICE NOTE
        await sock.sendMessage(chat, {
            audio: Buffer.from(opusBuffer),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (err) {
        console.error(err);
        await sock.sendMessage(chat, {
            text: "❌ Error: " + err.message
        }, { quoted: msg });
    }
};
