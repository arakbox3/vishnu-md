import yts from "yt-search";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import fs from "fs";

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

    const videoUrl = video.url; // videoUrl ഡിഫൈൻ ചെയ്തു

    // Design Caption
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
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
┃ *Sending Voice 🎤*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 1. തംബ്‌നെയിൽ അയക്കുന്നു
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };
    
    await sock.sendMessage(chat, {
      image: imageContent,
      caption: infoText
    });

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    let finalAudioUrl = null;

    // --- API ലെയറുകൾ (MP3) ---
    const audioApis = [
        async () => { 
            const res = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
            return res.data.data.download_url; // API കീ കറക്റ്റ് ചെയ്തു
        },
        async () => { 
            const res = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
            return res.data.dl;
        }
    ];

    for (const getAUrl of audioApis) {
        try {
            finalAudioUrl = await getAUrl();
            if (finalAudioUrl) break;
        } catch (e) { console.log("API Layer Failed, switching..."); }
    }

    if (!finalAudioUrl) throw new Error("All Audio APIs failed");

    // ✅ ഓഡിയോ അയക്കുന്നു
    await sock.sendMessage(chat, {
      audio: { url: finalAudioUrl },
      mimetype: "audio/mp4", // Play error ഒഴിവാക്കാൻ mp4/mpeg ഉപയോഗിക്കാം
      fileName: `${video.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Asura MD 👺',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

    // ✅ വോയിസ് അയക്കുന്നു (Converted using FFmpeg)
    const voiceStream = new PassThrough();
    ffmpeg(finalAudioUrl)
      .audioFrequency(48000)
      .audioChannels(1)
      .toFormat('ogg')
      .audioCodec('libopus')
      .on('error', (err) => console.log('FFmpeg Error:', err.message))
      .pipe(voiceStream);

    await sock.sendMessage(chat, {
      audio: { stream: voiceStream },
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Asura MD 👺',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
