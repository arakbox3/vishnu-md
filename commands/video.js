import yts from "yt-search";
import { exec } from "child_process";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    // 1. വീഡിയോ സെർച്ച് ചെയ്യുന്നു
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Video Not Found 😢" });
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
*⊹* 🪔 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰──────────────❂*
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

    // 3. വീഡിയോയുടെ ഡയറക്ട് ലിങ്ക് എടുക്കുന്നു (No Downloading to Disk)
    // yt-dlp ഉപയോഗിച്ച് ഡൗൺലോഡ് ചെയ്യാതെ വീഡിയോ URL മാത്രം എടുക്കുന്നു
    exec(`yt-dlp -g -f "best[ext=mp4][height<=480]" "${videoUrl}"`, async (error, stdout) => {
      if (error || !stdout) {
        console.error("Link Extraction Error:", error);
        return sock.sendMessage(chat, { text: "Error fetching video link! ❌" });
      }

      const directUrl = stdout.trim();

      // 4. വീഡിയോ നേരിട്ട് അയക്കുന്നു
      await sock.sendMessage(chat, {
        video: { url: directUrl },
        mimetype: 'video/mp4',
        caption: `*${title}*`
      }, { quoted: msg });
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
