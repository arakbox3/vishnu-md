import axios from "axios";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");
  const thumbPath = "./media/thumb.jpg"; // നിങ്ങളുടെ ലോക്കൽ ഇമേജ് പാത്ത്

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name]" });
  }

  try {
    // 1. Spotify Search (ഇത് മിക്കവാറും എല്ലാ പാട്ടുകളും കണ്ടെത്തും)
    const searchRes = await axios.get(`https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(searchQuery)}`);
    
    if (!searchRes.data || !searchRes.data.data.length) {
      return sock.sendMessage(chat, { text: "❌ Song Not Found!" });
    }

    const track = searchRes.data.data[0];
    const trackUrl = track.url;

    // 2. നേരിട്ടുള്ള ഡൗൺലോഡ് ലിങ്ക് എടുക്കുന്നു (No Proxy, No API Key)
    const dlRes = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(trackUrl)}`);
    const finalAudioUrl = dlRes.data.data.download;

    if (!finalAudioUrl) throw new Error("Stream link failed");

    // നിങ്ങളുടെ പഴയ അതേ ഡിസൈൻ ക്യാപ്ഷൻ
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${track.title}
 ⊙📺 *ARTIST:* ${track.artist.name}
 ⊙⏳ *DURATION:* ${track.duration}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // ഇമേജ് അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: track.thumbnail },
      caption: infoText
    });

    // ഓഡിയോ നേരിട്ട് സ്ട്രീം ചെയ്യുന്നു (No Download to Server)
    await sock.sendMessage(chat, {
      audio: { url: finalAudioUrl },
      mimetype: "audio/mpeg",
      fileName: `${track.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: track.title,
          body: 'Asura MD 👺',
          thumbnailUrl: track.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
