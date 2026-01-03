import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default async (sock, msg, query) => {
  const chat = msg.key.remoteJid;

  if (!query) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    // 1. വീഡിയോ സെർച്ച് ചെയ്യുന്നു
    const search = await yts(query);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Video Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;
    const channel = video.author.name;
    const views = video.views;
    const date = video.ago;

    const captionText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${channel}
 ⊙👀 *VIEWS:* ${views}
 ⊙⏳ *AGO:* ${date}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    // 3. വീഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു
    const fileName = `./media/video_${Date.now()}.mp4`;
    
    // yt-dlp ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ടെന്ന് ഉറപ്പാക്കുക
    exec(`yt-dlp -f "best[ext=mp4][height<=480]" "${videoUrl}" -o "${fileName}"`, async (error) => {
      if (error) {
        console.error("Download Error:", error);
        return sock.sendMessage(chat, { text: "Error downloading video! ❌\nMake sure yt-dlp is installed." });
      }

      // 4. വീഡിയോ അയക്കുന്നു
      if (fs.existsSync(fileName)) {
        await sock.sendMessage(chat, { 
          video: { url: fileName }, // ഫയൽ പാത്ത് നേരിട്ട് നൽകുന്നു
          mimetype: 'video/mp4',
          caption: `*${title}*`
        }, { quoted: msg });

        // അയച്ചു കഴിഞ്ഞാൽ ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
        setTimeout(() => {
            if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
        }, 5000); 
      }
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
