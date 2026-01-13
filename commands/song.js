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

    // ലോക്കൽ തംബ്‌നെയിൽ പാത്ത് (./media/thumb.jpg)
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };

    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐`;

    // 2. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: imageContent, caption: captionText });

    // 3. താൽക്കാലിക ഫയൽ പാത്ത്
    const fileName = `./media/audio_${Date.now()}.mp3`;

    // 4. yt-dlp ഉപയോഗിച്ച് ഓഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു
    // --extract-audio ഉപയോഗിച്ച് mp3 ആയി മാറ്റുന്നു
    exec(`yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 "${videoUrl}" -o "${fileName}"`, async (error) => {
      if (error) {
        console.error("Audio Download Error:", error);
        return sock.sendMessage(chat, { text: "Error ❌" });
      }

      // 5. ഓഡിയോ അയക്കുന്നു
      if (fs.existsSync(fileName)) {
        await sock.sendMessage(chat, {
          audio: fs.readFileSync(fileName),
          mimetype: 'audio/mpeg',
          ptt: false 
        }, { quoted: msg });

     
        fs.unlinkSync(fileName);
      }
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
