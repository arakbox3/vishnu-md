import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" "); 
  
  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
    // 1. യൂട്യൂബിൽ തിരയുന്നു (searchQuery തന്നെ ഇവിടെ നൽകണം)
    const search = await yts(searchQuery);
    const video = search.videos[0];
    if (!video) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    const infoText = `*👺⃝⃘̉̉̉━━━━━━━━◆◆◆*
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
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, { 
      image: { url: video.thumbnail }, 
      caption: infoText 
    });

    const fileName = `./media/audio_${Date.now()}.mp3`;

    // 3. ഡൗൺലോഡ് പ്രോസസ്സ് (Promisified exec ഉപയോഗിക്കുന്നു)
    try {
      await execPromise(`yt-dlp -x --audio-format mp3 --audio-quality 0 "${video.url}" -o "${fileName}"`);
      
      if (fs.existsSync(fileName)) {
        const stats = fs.statSync(fileName);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > 100) {
          fs.unlinkSync(fileName);
          return sock.sendMessage(chat, { text: "❌ File is too large (Over 100MB)!" });
        }

        const audioBuffer = fs.readFileSync(fileName);

        // ✅ ഓഡിയോ ഫയൽ അയക്കുന്നു
        await sock.sendMessage(chat, { 
          audio: audioBuffer, 
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`
        }, { quoted: msg });

        // ✅ വോയിസ് നോട്ട് അയക്കുന്നു
        await sock.sendMessage(chat, { 
          audio: audioBuffer, 
          mimetype: "audio/ogg; condecs=opus",
          ptt: true 
        }, { quoted: msg });

        // ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
        fs.unlinkSync(fileName);
      }
    } catch (execError) {
      console.error(execError);
      return sock.sendMessage(chat, { text: "❌ Error during downloading. Check yt-dlp/ffmpeg!" });
    }

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chat, { text: "❌ Something went wrong!" });
  }
};

