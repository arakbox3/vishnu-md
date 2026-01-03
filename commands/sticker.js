import { exec } from "child_process";
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // മെസ്സേജ് പരിശോധിക്കുന്നു
    const messageContent = msg.message?.imageMessage || 
                          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

    if (!messageContent) {
        const helpMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼 Reply to an Image*
┃ *⊙🎨 Command: .sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        return sock.sendMessage(chat, { text: helpMsg });
    }

    try {
        // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(messageContent, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // താൽക്കാലിക ഫയൽ പാത്തുകൾ
        if (!fs.existsSync('./media')) fs.mkdirSync('./media');
        const inputPath = `./media/temp_${Date.now()}.jpg`;
        const outputPath = `./media/temp_${Date.now()}.webp`;

        fs.writeFileSync(inputPath, buffer);

        // FFmpeg കമാൻഡ്
        const ffmpegCmd = `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0,split[s0][s1];[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[s1][p]paletteuse" ${outputPath}`;

        exec(ffmpegCmd, async (err) => {
            if (err) {
                console.error(err);
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                return sock.sendMessage(chat, { text: "Error creating sticker! ❌ Make sure FFmpeg is installed." });
            }

            // സ്റ്റിക്കർ അയക്കുന്നു
            await sock.sendMessage(chat, { 
                sticker: fs.readFileSync(outputPath)
            });

            // ഫയലുകൾ ഡിലീറ്റ് ചെയ്യുന്നു
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        });

    } catch (e) {
        console.log(e);
        sock.sendMessage(chat, { text: "Something went wrong! 😔" });
    }
};
