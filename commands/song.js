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
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Audio 🔊*
╔━━━━━━━━━━━
┃ *Voice 🎤*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    }, { quoted: msg });

    let finalStreamUrl = null;

    // --- IP Rotation Logic (Multiple Address-less Instances) ---
    const instances = [
        'https://invidious.projectsegfau.lt',
        'https://inv.tux.rs',
        'https://invidious.nerdvpn.de',
        'https://inv.riverside.rocks'
    ];

    const videoId = video.url.split('v=')[1] || video.url.split('/').pop();

    for (let instance of instances) {
        try {
            const res = await axios.get(`${instance}/api/v1/videos/${videoId}?fields=adaptiveFormats`, { timeout: 10000 });
            // ഓഡിയോ സ്ട്രീം കണ്ടെത്തുന്നു
            const audioStream = res.data.adaptiveFormats.find(f => f.type.includes('audio/webm') || f.type.includes('audio/mp4'));
            if (audioStream && audioStream.url) {
                finalStreamUrl = audioStream.url;
                break; // ലിങ്ക് കിട്ടിയാൽ ലൂപ്പ് നിർത്തുക
            }
        } catch (e) {
            console.log(`IP Blocked on ${instance}, switching...`);
            continue;
        }
    }

    if (!finalStreamUrl) throw new Error("Could not fetch stream URL from any IP");

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    // ✅ 1. ഓഡിയോ ഫയൽ (MP3)
    await sock.sendMessage(chat, {
      audio: { url: finalStreamUrl },
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

    // ✅ 2. വോയിസ് നോട്ട് (PTT)
    const voiceStream = new PassThrough();
    ffmpeg(finalStreamUrl)
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
          sourceUrl: video.url,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "⏳Loading.." });
  }
};
