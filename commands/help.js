import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. Reaction
        await sock.sendMessage(chat, { react: { text: "⚡", key: msg.key } });

        // 2. New Stylish Loading Animation
        const { key } = await sock.sendMessage(chat, { text: "『 👺 Asura MD Engine 』\n\n[▒▒▒▒▒▒▒▒▒▒] 0%" });

        const loadingFrames = [
            "『 👺 Asura MD Engine 』\n\n[▓▒▒▒▒▒▒▒▒▒] 15%",
            "『 👺 Asura MD Engine 』\n\n[▓▓▓▒▒▒▒▒▒▒] 30%",
            "『 👺 Asura MD Engine 』\n\n[▓▓▓▓▓▒▒▒▒▒] 55%",
            "『 👺 Asura MD Engine 』\n\n[▓▓▓▓▓▓▓▒▒▒] 80%",
            "『 👺 Asura MD Engine 』\n\n[▓▓▓▓▓▓▓▓▓▓] 100%",
            "🚀 *System Optimized! Sending Menu...*"
        ];

        for (let frame of loadingFrames) {
            await new Promise(resolve => setTimeout(resolve, 400));
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        const imagePath = './media/thumb.jpg'; 
        const songPath = './media/song.opus'; 

        const menuText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰───────────❂*

╔━━━━━━━━━━━❥❥❥
┃ ⊙⚡ .Ping
┃ ⊙🔋 .Alive
┃ ⊙📜 .Menu
┃ ⊙🎵 .Song <name>
┃ ⊙🎬 .Video <name>
┃ ⊙🖼️ .Sticker
┃ ⊙🎮 .Game
┃ ⊙🎭 .Fun
┃ ⊙🤖 .Ai <text>
┃ ⊙👤 .Owner
┃ ⊙🎧 .Play <name>
┃ ⊙📢 .Tagall
╚━━━━⛥❖⛥━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 3. Image Preparation
        let mediaContent = {};
        if (fs.existsSync(imagePath)) {
            const { imageMessage } = await sock.prepareMessageMedia({ image: fs.readFileSync(imagePath) }, { upload: sock.waUploadToServer });
            mediaContent = imageMessage;
        }

        // 4. Interactive Message Structure
        const message = {
            interactiveMessage: {
                header: {
                    title: "Asura MD 👺",
                    hasMediaAttachment: fs.existsSync(imagePath),
                    imageMessage: mediaContent
                },
                body: { text: menuText },
                footer: { text: "Powered by Asura MD" },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ display_text: "🩸 ALIVE", id: ".alive" })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ display_text: "📡 PING", id: ".ping" })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({ display_text: "👑 OWNER", id: ".owner" })
                        }
                    ]
                }
            }
        };

        // 5. Relay Message (Buttons വരാൻ ഇത് അത്യാവശ്യമാണ്)
        await sock.relayMessage(chat, { viewOnceMessage: { message } }, { messageId: msg.key.id });

        // 6. Audio Theme
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, {
                audio: fs.readFileSync(songPath),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Error in menu command:", error);
        // എറർ വന്നാൽ ഒരു നോർമൽ മെസേജ് എങ്കിലും അയക്കാൻ
        await sock.sendMessage(chat, { text: "Error loading menu. Please check logs." });
    }
};
