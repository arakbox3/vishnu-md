import yts from "yt-search";
import axios from "axios";

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

    // 1. തംബ്‌നെയിൽ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    let audioUrl = null;

    // --- API 1: Siputzx (Now very powerful) ---
    try {
        const res1 = await axios.get(`https://api.siputzx.my.id/api/dwnld/ytmp3?url=${video.url}`);
        audioUrl = res1.data.data.dl; // സ്ട്രീമിംഗ് ലിങ്ക്
    } catch (e) {
        console.log("API 1 failed...");
    }

    // --- API 2: Ariya API (Strong Fallback) ---
    if (!audioUrl) {
        try {
            const res2 = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${video.url}`);
            audioUrl = res2.data.result.download.url;
        } catch (e) {
            console.log("API 2 failed...");
        }
    }

    // --- API 3: Cobalt (Trying again with different headers) ---
    if (!audioUrl) {
        try {
            const res3 = await axios.post('https://api.cobalt.tools/api/json', {
                url: video.url,
                downloadMode: 'audio'
            }, { headers: { 'Accept': 'application/json' } });
            audioUrl = res3.data.url;
        } catch (e) {
            console.log("All APIs failed.");
        }
    }

    if (!audioUrl) throw new Error("No download link found");

    // ✅ ഓഡിയോ അയക്കുന്നു (ഡൗൺലോഡ് ചെയ്യാതെ നേരിട്ട് URL വഴി)
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

    // ✅ വോയിസ് നോട്ട്
    await sock.sendMessage(chat, {
      audio: { url: audioUrl },
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

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
