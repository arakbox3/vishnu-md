import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    // ക്വോട്ട് ചെയ്ത മെസ്സേജോ നേരിട്ടുള്ള മെസ്സേജോ എന്ന് നോക്കുന്നു
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message?.imageMessage || msg.message?.videoMessage || 
                    quoted?.imageMessage || quoted?.videoMessage;

    try {
        if (!message) {
            const helpMsg = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼 Reply to Image/Gif/Video*
┃ *⊙🎨 Command: .sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chat, { image: { url: imagePath }, caption: helpMsg });
            } else {
                return sock.sendMessage(chat, { text: helpMsg });
            }
        }

        // മീഡിയ ടൈപ്പ് കണ്ടെത്തുന്നു
        const mediaType = message.url ? (msg.message?.imageMessage || quoted?.imageMessage ? 'image' : 'video') : null;

        if (!mediaType) return sock.sendMessage(chat, { text: "❌ മീഡിയ കണ്ടെത്താൻ കഴിഞ്ഞില്ല!" });

        // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(message, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // സ്റ്റിക്കർ നിർമ്മാണം (wa-sticker-formatter ഉപയോഗിച്ച്)
        const sticker = new Sticker(buffer, {
            pack: 'Asura MD 👺', 
            author: 'Arun Cumar', 
            type: StickerTypes.FULL, 
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 70, 
        });

        const stickerBuffer = await sticker.toBuffer();

        // സ്റ്റിക്കർ അയക്കുന്നു
        await sock.sendMessage(chat, { sticker: stickerBuffer }, { quoted: msg });

        // പാട്ട് അയക്കുന്നു
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Sticker Error:", error);
        sock.sendMessage(chat, { text: "❌ Error!" });
    }
};

