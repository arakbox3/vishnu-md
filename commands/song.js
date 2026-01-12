import yts from "yt-search";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";


export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
    const search = await yts(searchQuery);
    const video = search.videos[0];
    if (!video) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    // നിങ്ങളുടെ ഡിസൈൻ ക്യാപ്ഷൻ
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ 1️⃣ Audio 🔊
╔━━━━━━━━━━━
┃ 2️⃣ Voice 🎤
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 1. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

let downloadUrl = null;

// --- API 1: Cobalt API (MP3 / Best Quality) ---
try {
    const res1 = await axios.post(
        'https://api.cobalt.tools/api/json',
        {
            url: video.url,
            downloadMode: 'audio',
            audioFormat: 'mp3',
            audioQuality: '320'
        },
        {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }
    );
    downloadUrl = res1.data.url;
} catch (e) {
    console.log("Cobalt MP3 API Failed");
}

// --- API 2: Siputzx MP3 API (Stable) ---
if (!downloadUrl) {
    try {
        const res2 = await axios.get(
            `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`
        );
        downloadUrl = res2.data.data.dl;
    } catch (e) {
        console.log("Siputzx MP3 API Failed");
    }
}

// --- API 3: Decypher / AlyaChan MP3 API (Backup) ---
if (!downloadUrl) {
    try {
        const res3 = await axios.get(
            `https://api.alyachan.dev/api/ytmp3?url=${encodeURIComponent(video.url)}&apikey=Gatabu-Bot`
        );
        downloadUrl = res3.data.data.download.url;
    } catch (e) {
        console.log("Decypher MP3 API Failed");
    }
}

// --- Final Check ---
if (!downloadUrl) throw new Error("MP3 download failed");

    // ✅ ഓഡിയോ അയക്കുന്നു
    await sock.sendMessage(chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`,
      timeout: 60000,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Asura MD 👺',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: video.url,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

    // ✅ വോയിസ് നോട്ട് അയക്കുന്നു
    const audioStream = new PassThrough();

    ffmpeg(audioUrl)
      .toFormat('ogg')
      .audioCodec('libopus')
      .on('error', (err) => console.log('FFmpeg Error:', err))
      .pipe(audioStream);

    await sock.sendMessage(chat, {
      audio: { stream: audioStream },
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Asura MD 👺',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: video.url,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};


