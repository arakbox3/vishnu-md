import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default async (sock, msg, query) => {
  const chat = msg.key.remoteJid;
  
  // 1. ക്വറി ഉണ്ടോ എന്ന് പരിശോധിക്കുന്നു
  if (!query || query.length === 0) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
    // 2. യൂട്യൂബിൽ തിരയുന്നു
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    const infoText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 3. തംബ്‌നെയിൽ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, { 
      image: { url: video.thumbnail }, 
      caption: infoText 
    });

    // 4. ഡൗൺലോഡ് പ്രോസസ്സ്
    const fileName = `./media/audio_${Date.now()}.mp3`;
    
    // yt-dlp ഉപയോഗിച്ച് ഓഡിയോ മാത്രം ഡൗൺലോഡ് ചെയ്യുന്നു
    exec(`yt-dlp -x --audio-format mp3 --audio-quality 0 "${video.url}" -o "${fileName}"`, async (error) => {
      if (error) {
        console.error(error);
        return sock.sendMessage(chat, { text: "❌ Error: Make sure *yt-dlp* and *ffmpeg* are installed!" });
      }

      // 5. ഓഡിയോ ഫയൽ അയക്കുന്നു
      if (fs.existsSync(fileName)) {
        const stats = fs.statSync(fileName);
        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

        // 100MB-ൽ കൂടുതൽ ഉള്ള ഫയലുകൾ അയക്കാൻ വാട്സാപ്പിൽ പ്രയാസമാണ്
        if (fileSizeInMegabytes > 100) {
            fs.unlinkSync(fileName);
            return sock.sendMessage(chat, { text: "❌ File is too large to send!" });
        }

        await sock.sendMessage(chat, { 
          audio: fs.readFileSync(fileName), 
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`
        }, { quoted: msg });

        // 6. ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
        fs.unlinkSync(fileName);
      }
    });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chat, { text: "❌ Something went wrong!" });
  }
};
