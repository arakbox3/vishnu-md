import yts from "yt-search";
import axios from "axios";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .song <song name>" });
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
*⊹* 🪔 *Song Download*
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

    // . തംബ്‌നെയിൽ അയക്കുന്നു (Local image path: ./media/thumb.jpg)
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };
    await sock.sendMessage(chat, { image: imageContent, caption: captionText });

    // --- STREAMING LOGIC (NO SAVE) ---
    // yt-dlp ഉപയോഗിച്ച് ഡാറ്റ നേരിട്ട് സ്റ്റാൻഡേർഡ് ഔട്ട്‌പുട്ടിലേക്ക് (stdout) എടുക്കുന്നു
    const ytProcess = spawn("yt-dlp", [
      "-f", "bestaudio",
      "--extract-audio",
      "--audio-format", "mp3",
      "--audio-quality", "128K",
      "-o", "-", // ഡാറ്റ ഫയലിലേക്ക് മാറ്റാതെ നേരിട്ട് തരുന്നു
      video.url
    ]);

    let chunks = [];
    ytProcess.stdout.on("data", (chunk) => chunks.push(chunk));

    ytProcess.on("close", async () => {
      const audioBuffer = Buffer.concat(chunks);
      
      await sock.sendMessage(chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        ptt: false 
      }, { quoted: msg });
    });

    ytProcess.on("error", (err) => {
      console.error("YT-DLP Error:", err);
      sock.sendMessage(chat, { text: "Streaming failed! ❌" });
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
