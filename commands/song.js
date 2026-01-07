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

    let audioUrl = null;

    // --- API 1: Izumi API ---
    try {
        const res1 = await axios.get(`https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(video.url)}&format=mp3`);
        audioUrl = res1.data.result.download;
    } catch (e) {
        console.log("API 1 Failed");
    }

    // --- API 2: Keith API ---
    if (!audioUrl) {
        try {
            const res2 = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(video.url)}`);
            audioUrl = res2.data.result.downloadUrl;
        } catch (e) {
            console.log("API 2 Failed");
        }
    }

    // --- API 3: Okatsu API ---
    if (!audioUrl) {
        try {
            const res3 = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(video.url)}`);
            audioUrl = res3.data.dl || res3.data.result?.mp3;
        } catch (e) {
            console.log("API 3 Failed");
        }
    }

    if (!audioUrl) throw new Error("All APIs failed");

    // ✅ ഓഡിയോ അയക്കുന്നു
    await sock.sendMessage(chat, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`,
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
