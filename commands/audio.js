import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .audio <song name>" });
  }

  try {
    // 1. യൂട്യൂബ് സെർച്ച്
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Song Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;
    const channel = video.author.name;
    const views = video.views;
    const date = video.ago;

    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${channel}
 ⊙👀 *VIEWS:* ${views}
 ⊙⏳ *AGO:* ${date}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // 2. ലോക്കൽ തംബ്‌നെയിൽ അയക്കുന്നു
    // ./media/thumb.jpg അവിടെ ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };

    await sock.sendMessage(chat, { 
      image: imageContent, 
      caption: captionText 
    });

    // 3. ഓഡിയോ ഡയറക്ട് ലിങ്ക് എക്സ്ട്രാക്റ്റ് ചെയ്യുന്നു
    exec(`yt-dlp -g -f "bestaudio" "${videoUrl}"`, async (error, stdout) => {
      if (error || !stdout) {
        console.error("Audio Link Error:", error);
        return sock.sendMessage(chat, { text: "Error fetching audio link! ❌" });
      }

      const directUrl = stdout.trim();

      // 4. ഓഡിയോ ഫയൽ അയക്കുന്നു
      await sock.sendMessage(chat, {
        audio: { url: directUrl },
        mimetype: 'audio/mp4',
        ptt: false 
      }, { quoted: msg });
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
