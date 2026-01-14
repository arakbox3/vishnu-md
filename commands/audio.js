import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .audio <song name>" });
  }

  try {
    // 1. YouTube Search
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Audio Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;

    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *AGO:* ${video.ago}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };
    
    await sock.sendMessage(chat, { image: imageContent, caption: captionText });

    // 3. താൽക്കാലിക ഫയൽ സെറ്റ് ചെയ്യുന്നു
    const tempFile = `./media/${Date.now()}.mp3`;

    const command = `yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 128K "${videoUrl}" -o "${tempFile}"`;

    await execPromise(command);

    if (fs.existsSync(tempFile)) {
      // 5. ഓഡിയോ ഫയൽ അയക്കുന്നു
      await sock.sendMessage(chat, {
        audio: fs.readFileSync(tempFile),
        mimetype: 'audio/mpeg',
        ptt: false 
      }, { quoted: msg });

      // 6. ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു (Storage ക്ലീൻ ആയിരിക്കും)
      fs.unlinkSync(tempFile);
    } else {
      throw new Error("File not found after download");
    }

  } catch (err) {
    console.error("Permanent Error:", err);
    sock.sendMessage(chat, { text: "Error: ! ❌" });
  }
};
