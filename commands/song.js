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
    });

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    let audioUrl = null;

    // --- API ലെയറുകൾ (MP3) ---
    const audioApis = [
        async () => { // API 1: Cobalt
            const res = await axios.post('https://api.cobalt.tools/api/json', { url: video.url, downloadMode: 'audio' }, { headers: { 'Accept': 'application/json' } });
            return res.data.url;
        },
        async () => { // API 2: Siputzx
            const res = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(video.url)}`);
            return res.data.data.dl;
        },
        async () => { // API 3: AlyaChan
            const res = await axios.get(`https://api.alyachan.dev/api/yta?url=${encodeURIComponent(video.url)}&apikey=Gatabu-Bot`);
            return res.data.data.download.url;
        }
    ];

    for (const getAUrl of audioApis) {
        try {
            audioUrl = await getAUrl();
            if (audioUrl) break;
        } catch (e) { console.log("Audio API Layer Failed, switching..."); }
    }

    if (!audioUrl) throw new Error("All Audio APIs failed");

    // ✅ ഓഡിയോ 
    await sock.sendMessage(chat, {
      audio: { url: finalAudioUrl },
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

    // ✅ വോയിസ് 
    const voiceStream = new PassThrough();
    ffmpeg(finalAudioUrl)
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
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
