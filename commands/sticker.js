import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { exec } from "child_process";
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';

    const isImage = msg.message?.imageMessage;
    const isQuotedImage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    const messageContent = isImage || isQuotedImage;

    try {
        if (!messageContent) {
            const helpMsg = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼 Reply to an Image*
┃ *⊙🎨 Command: .sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chat, { image: fs.readFileSync(imagePath), caption: helpMsg });
            } else {
                return sock.sendMessage(chat, { text: helpMsg });
            }
        }

        // Create media directory if it doesn't exist
        if (!fs.existsSync('./media')) fs.mkdirSync('./media');

        // Download the image content
        const stream = await downloadContentFromMessage(messageContent, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Define temporary paths
        const inputPath = `./media/temp_in_${Date.now()}.jpg`;
        const outputPath = `./media/temp_out_${Date.now()}.webp`;

        // Write buffer to a file
        fs.writeFileSync(inputPath, buffer);

        // FFmpeg Command: ശരിയായി ക്രമീകരിച്ചത്
        const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0" -vcodec libwebp ${outputPath}`;

        exec(ffmpegCmd, async (err) => {
            if (err) {
                console.error("FFmpeg Error:", err);
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                return sock.sendMessage(chat, { text: "Error creating sticker! ❌ Make sure FFmpeg is installed." });
            }

            // Send the generated sticker
            if (fs.existsSync(outputPath)) {
                await sock.sendMessage(chat, {
                    sticker: fs.readFileSync(outputPath)
                }, { quoted: msg });
            }

            // Clean up temporary files
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (error) {
        console.error("General Error:", error);
        sock.sendMessage(chat, { text: "Something went wrong! ❌" });
    }
};
