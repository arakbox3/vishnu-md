import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const sender = msg.pushName || "User";
  const imagePath = "./media/thumb.jpg"; 

  // --- Game Logic (Randomized Math Puzzle) ---
  const val1 = Math.floor(Math.random() * 10) + 2; // 2 to 11
  const val2 = Math.floor(Math.random() * 5) + 1;  // 1 to 6
  const val3 = Math.floor(Math.random() * 5) + 2;  // 2 to 7

  // Puzzle Structure:
  // 👺 + 👺 = X
  // 👺 + 🔥 = Y
  // 🔥 - 💎 = Z
  // 👺 + 🔥 + 💎 = ?
  
  const line1 = val1 + val1;
  const line2 = val1 + val2;
  const line3 = val2 - val3;
  const finalAnswer = val1 + val2 + val3;

  // --- Design Caption ---
  const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🧩 *Asura MD IQ Challenge*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Game Started!* ❳•°•
 ⊙👤 *PLAYER:* ${sender}
 ⊙🎮 *QUEST:* Solve the Emoji Puzzle!
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐

*CAN YOU SOLVE THIS?*
1️⃣ 👺 + 👺 = ${line1}
2️⃣ 👺 + 🔥 = ${line2}
3️⃣ 🔥 - 💎 = ${line3}

*FIND THE VALUE OF:*
✨ *👺 + 🔥 + 💎 = ?* ✨

*How to play:*
Think carefully and reply with the correct answer!

╔━━━━━━━━━━━❥❥❥
┃ *Check your IQ! 🧠*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

  // --- Send Message ---
  try {
    await sock.sendMessage(chat, { 
      image: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : { url: 'https://placehold.co/600x400?text=Asura+MD' },
      caption: infoText 
    }, { quoted: msg });

    // Console-ൽ ഉത്തരം കാണാൻ (For Admin)
    console.log(`Game started in ${chat}. Answer: ${finalAnswer}`);

  } catch (err) {
    console.error(err);
  }
};
