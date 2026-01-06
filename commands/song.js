import yts from "yt-search";
import ytdl from "@distube/ytdl-core"; 
import axios from "axios";
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

    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
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

    // ഇൻഫോ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    // തംബ്‌നെയിൽ ബഫർ
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    // ഡൗൺലോഡ് സ്ട്രീം സെറ്റപ്പ്
    const stream = ytdl(video.url, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));

    stream.on('end', async () => {
      const audioBuffer = Buffer.concat(chunks);

      // ✅ 1. ഓഡിയോ ഫയൽ ആയി അയക്കുന്നു
      await sock.sendMessage(chat, {
        audio: audioBuffer,
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

      // ✅ 2. വോയിസ് നോട്ട് (PTT) ആയി അയക്കുന്നു
      await sock.sendMessage(chat, {
        audio: audioBuffer,
        mimetype: "audio/ogg; codecs=opus",
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
    });

    stream.on('error', (err) => {
      console.error(err);
      sock.sendMessage(chat, { text: "❌ Error downloading audio." });
    });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chat, { text: "❌ Connection Error. Please try again later." });
  }
};

