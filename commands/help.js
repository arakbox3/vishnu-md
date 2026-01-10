import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. Reaction - ടൈപ്പിംഗ് സൂചിപ്പിക്കാൻ
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 2. Loading Animation
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
            "▰▱▱▱▱▱▱▱▱▱ 10%",
            "▰▰▰▰▱▱▱▱▱▱ 40%",
            "▰▰▰▰▰▰▰▱▱▱ 70%",
            "▰▰▰▰▰▰▰▰▰▰ 100%",
            "🚀 Asura MD Engine Ready!",
            "✅ Sending Menu Now!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 500)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        const imagePath = './media/thumb.jpg'; 
        const songPath = './media/song.opus'; 

        const menuText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰───────────❂*
╔━━━━━━━━━━━❥❥❥
​╔══════════════╗
┃  ⚡ .Ping
╚══════════════╝
​╔══════════════╗
┃  🔋 .Alive
╚══════════════╝
​╔══════════════╗
┃  📜 .Menu
╚══════════════╝
​╔══════════════╗
┃  🎵 .Song <name>
╚══════════════╝
​╔══════════════╗
┃  🎬 .Video <name>
╚══════════════╝
​╔══════════════╗
┃  🖼️ .Sticker
╚══════════════╝
​╔══════════════╗
┃  🎮 .Game
╚══════════════╝
​╔══════════════╗
┃  🎭 .Fun
╚══════════════╝
​╔══════════════╗
┃  🤖 .Ai <text>
╚══════════════╝
​╔══════════════╗
┃  ✍️ .Font <text>
╚══════════════╝
​╔══════════════╗
┃  👤 .Owner
╚══════════════╝
​╔══════════════╗
┃  ❓ .Help
╚══════════════╝
​╔══════════════╗
┃  🎧 .Play <name>
╚══════════════╝
​╔══════════════╗
┃  📢 .Tagall
╚══════════════╝
​╔══════════════╗
┃  📷 .Image <name>
╚══════════════╝
╚━━━━⛥❖⛥━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 3. Prepare Image Message (if exists)
        let mediaMsg = {};
        if (fs.existsSync(imagePath)) {
            const { imageMessage } = await sock.prepareMessageMedia({ image: fs.readFileSync(imagePath) }, { upload: sock.waUploadToServer });
            mediaMsg = imageMessage;
        }

        // 4. Send Interactive Message (Buttons)
        const interactiveMessage = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: {
                            title: "Asura MD 👺",
                            hasMediaAttachment: true,
                            imageMessage: mediaMsg
                        },
                        body: { text: menuText },
                        footer: { text: "Powered by Asura MD" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({ display_text: "🩸 Alive", id: ".alive" })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({ display_text: "📡 Ping", id: ".ping" })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({ display_text: "👑 Owner", id: ".owner" })
                                }
                            ]
                        }
                    }
                }
            }
        };

        await sock.relayMessage(chat, interactiveMessage, { messageId: msg.key.id });

        // 5. Send Reaction Finish
        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

        // 6. Send Audio (Optional Theme Music)
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, {
                audio: fs.readFileSync(songPath),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: 'Asura MD 👺',
                        body: 'Playing Menu Theme...',
                        thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                        mediaType: 1,
                        sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24'
                    }
                }
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Error in menu command:", error);
    }
};
