import axios from 'axios';
import ytSearch from 'yt-search';
import fs from 'fs';
import { exec } from 'child_process';

const getAudioUrl = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const urlParam = { v: videoID, f: 'mp3', _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });
    return convertData.downloadURL;
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ Please provide a name or link!" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Video not found");

        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
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
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
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

        const rawAudioUrl = await getAudioUrl(video.url);
        
        const tempMp3 = `./${Date.now()}.mp3`;
        const tempOpus = `./${Date.now()}.opus`;

        // Download MP3 Buffer
        const response = await axios.get(rawAudioUrl, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data);

        // 1. Send as Audio File (Playable)
        await sock.sendMessage(chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4', 
            ptt: false 
        }, { quoted: msg });

        // Write to temp file for FFmpeg conversion
        fs.writeFileSync(tempMp3, audioBuffer);

        // 2. Convert to Voice Note (PTT) - Important: Added -vn and -af
        exec(`ffmpeg -i ${tempMp3} -vn -acodec libopus -ab 128k -ar 48000 -f opus ${tempOpus}`, async (err) => {
            if (err) {
                console.error('FFmpeg Error:', err);
                if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3);
                return;
            }

            if (fs.existsSync(tempOpus)) {
                await sock.sendMessage(chat, {
                    audio: fs.readFileSync(tempOpus),
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true 
                }, { quoted: msg });

                // Cleanup
                fs.unlinkSync(tempMp3);
                fs.unlinkSync(tempOpus);
                await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });
            }
        });

    } catch (e) {
        console.error("Audio Play Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: Could not process audio." }, { quoted: msg });
    }
};
