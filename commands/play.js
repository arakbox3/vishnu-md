import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const sender = msg.pushName || "User";
  const thumbPath = "./media/thumb.jpg";

  // 10 Levels of Emojis
  const gameLevels = [
    { items: ["📦", "🎁", "🏺", "💎", "💰", "🌋"], name: "Ancient Ruins" },
    { items: ["🚗", "🚲", "🚜", "🚛", "🚁", "🚀"], name: "Vehicle Yard" },
    { items: ["🦁", "🐯", "🐼", "🐨", "🦊", "🐸"], name: "Wild Jungle" },
    { items: ["🍎", "🍉", "🍇", "🍓", "🍍", "🥭"], name: "Fruit Garden" },
    { items: ["🌑", "🌕", "⭐", "🪐", "☀️", "☄️"], name: "Deep Space" },
    { items: ["🍔", "🍕", "🍟", "🍩", "🍦", "🍣"], name: "Food Court" },
    { items: ["⚽", "🏀", "🎾", "🏐", "🎱", "🏏"], name: "Sports Club" },
    { items: ["🎸", "🎺", "🎻", "🥁", "🎹", "🎷"], name: "Music Hall" },
    { items: ["🏠", "🏰", "🏢", "⛩️", "🛖", "⛪"], name: "Old City" },
    { items: ["👺", "👻", "💀", "👽", "🤖", "🎃"], name: "Asura Realm" }
  ];

  // Pick a random level
  const levelIndex = Math.floor(Math.random() * gameLevels.length);
  const currentLevel = gameLevels[levelIndex];
  
  // Pick winning emoji and its position (1-6)
  const winningIndex = Math.floor(Math.random() * 6);
  const winningEmoji = currentLevel.items[winningIndex];
  const winningNumber = winningIndex + 1;

  // Header Design
  const header = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🏴‍☠️ *Asura Treasure Hunt*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*`;

  // Game UI
  let menuText = `${header}\n`;
  menuText += `╭•°•❲ *LEVEL: ${levelIndex + 1}* ❳•°•\n`;
  menuText += ` ⊙👤 *PLAYER:* ${sender}\n`;
  menuText += ` ⊙🏰 *AREA:* ${currentLevel.name}\n`;
  menuText += `╰╌╌╌╌╌╌╌╌╌╌࿐\n\n`;
  menuText += `*FIND THE HIDDEN TREASURE:* \n\n`;

  currentLevel.items.forEach((emoji, i) => {
    menuText += `${i + 1}. [ ${emoji} ] Hidden Slot\n`;
  });

  menuText += `\n*How to play:* \nReply to this message with a number *(1-6)* to claim your prize!\n\n`;
  menuText += `> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

  // Send the Game Message
  const sentMsg = await sock.sendMessage(chat, {
    image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://i.imgur.com/your-image.jpg' },
    caption: menuText
  }, { quoted: msg });

  // --- REPLY HANDLER (Works inside the same code) ---
  sock.ev.on('messages.upsert', async (chatUpdate) => {
    const m = chatUpdate.messages[0];
    if (!m.message) return;

    // Check if it's a reply to the game message
    const isReplyToGame = m.message.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id;
    const userChoice = m.message.conversation || m.message.extendedTextMessage?.text;

    if (isReplyToGame && userChoice) {
      const chosenNum = parseInt(userChoice.trim());

      if (chosenNum >= 1 && chosenNum <= 6) {
        if (chosenNum === winningNumber) {
          await sock.sendMessage(chat, { 
            text: `*🎊 CONGRATULATIONS ${sender.toUpperCase()}! 🎊*\n\nYou found the treasure ${winningEmoji} at Slot ${winningNumber}!\n\n*Level ${levelIndex + 1} Cleared!* ✅` 
          }, { quoted: m });
        } else {
          await sock.sendMessage(chat, { 
            text: `*💀 OOPS! YOU LOST...*\n\nThe treasure was hidden in Slot ${winningNumber} ${winningEmoji}.\nBetter luck next time!` 
          }, { quoted: m });
        }
      }
    }
  });
};
