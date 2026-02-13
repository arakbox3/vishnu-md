import axios from 'axios';
import ytSearch from 'yt-search';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util'; 
import ffmpegPath from 'ffmpeg-static';

const execPromise = promisify(exec);
const ffPath = ffmpegPath; 
const getAudioUrl = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const urlParam = { v: videoID, f: 'mp3', _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });
    return convertData.downloadURL;
};

if (fs.existsSync(ffPath)) {
    fs.chmodSync(ffPath, 0o755);
}
export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ .audio name/link !" }, { quoted: msg });

    const inputMp3 = `./in_${Date.now()}.mp3`;
    const outputMp3 = `./out_${Date.now()}.mp3`;
    const outputOpus = `./out_${Date.now()}.ogg`;


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

        const rawAudioUrl = await getAudioUrl(video.url);
        
        // 1. ഫയൽ ഡൗൺലോഡ് ചെയ്യുന്നു
        const response = await axios.get(rawAudioUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(inputMp3, Buffer.from(response.data));

  // --- 1. SEND AUDIO FILE ---
try {
    console.log("Starting Audio Conversion...");
    await execPromise(`"${ffPath}" -y -i "${inputMp3}" -vn -ab 128k "${outputMp3}"`, { timeout: 45000 });
    
    if (fs.existsSync(outputMp3)) {
        await sock.sendMessage(chat, {
            audio: fs.readFileSync(outputMp3),
            mimetype: 'audio/mpeg', 
            ptt: false 
        }, { quoted: msg });
        fs.unlinkSync(outputMp3);
        console.log("Audio Sent!");
    }
} catch (err) {
    console.error("Audio conversion failed:", err);
}

await new Promise(resolve => setTimeout(resolve, 1000));

// --- 2. SEND VOICE NOTE (PTT) ---
try { 
    console.log("Starting PTT Conversion...");
    await execPromise(`"${ffPath}" -y -i "${inputMp3}" -vn -ac 1 -acodec libopus -b:a 64k -vbr on -ar 48000 -f ogg "${outputOpus}"`, { timeout: 45000 });
    
    if (fs.existsSync(outputOpus)) {
        await sock.sendMessage(chat, {
            audio: fs.readFileSync(outputOpus),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true 
        }, { quoted: msg });
        fs.unlinkSync(outputOpus);
        console.log("PTT Sent!");
    }
} catch (err) {
    console.error("PTT conversion failed:", err);
}

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("Main Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: " + e.message }, { quoted: msg });
    } finally {
        if (fs.existsSync(inputMp3)) fs.unlinkSync(inputMp3);
    }
