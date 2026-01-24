import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || 
                   msg.message?.viewOnceMessageV2?.message || 
                   msg.message?.viewOnceMessage?.message || null;

    if (!quoted) {
        return sock.sendMessage(chat, { 
            text: "❌ *Reply to a media message!*\n\n" +
                  "• *.convert sticker* (Image/Video to Sticker)\n" +
                  "• *.convert image* (Sticker to Image)\n" +
                  "• *.convert video* (Sticker/Gif to Video)\n" +
                  "• *.convert gif* (Video to Gif)\n" +
                  "• *.convert audio* (Voice to Audio)\n" +
                  "• *.convert voice* (Audio/Video to Voice)\n" +
                  "• *.convert pdf* (Image/Doc to PDF)\n" +
                  "• *.convert emoji* (Sticker to PNG)"
        }, { quoted: msg });
    }

    const type = Object.keys(quoted)[0];
    const mime = quoted[type]?.mimetype || "";
    const cmd = args[0]?.toLowerCase();

    try {
        // Step 1: Download to Buffer (No file saving)
        const stream = await downloadContentFromMessage(
            quoted[type], 
            type.replace('Message', '').toLowerCase() === 'image' ? 'image' : 
            type.replace('Message', '').toLowerCase() === 'video' ? 'video' : 'audio'
        );
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const send = async (data) => sock.sendMessage(chat, data, { quoted: msg });

        // Step 2: Full Conversion Logic
        switch (cmd) {
            case 'sticker': // Image to Sticker / Video to Sticker
                const sType = /video/.test(mime) ? StickerTypes.CROPPED : StickerTypes.FULL;
                const sticker = new Sticker(buffer, {
                    pack: 'Asura MD',
                    author: 'Arun Cumar',
                    type: sType,
                    quality: 30
                });
                return await send({ sticker: await sticker.toBuffer() });

            case 'image': // Sticker to Image
                if (!/sticker/.test(mime)) return send({ text: "❌ Reply to a Sticker!" });
                return await send({ image: buffer, caption: "✅ *Sticker to Image*" });

            case 'video': // Sticker to Video / Gif to Video
                return await send({ video: buffer, caption: "✅ *Converted to Video*" });

            case 'gif': // Video to Gif
                return await send({ video: buffer, gifPlayback: true, caption: "✅ *Video to GIF*" });

            case 'audio': // Voice to Audio / Video to Audio
                return await send({ audio: buffer, mimetype: 'audio/ogg', ptt: false });

            case 'voice': // Audio to Voice / Video to Voice
                return await send({ audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });

            case 'pdf': // Any to PDF
                return await send({ 
                    document: buffer, 
                    mimetype: 'application/pdf', 
                    fileName: `Asura_MD_${Date.now()}.pdf` 
                });

            case 'emoji': // Sticker to PNG Document
                return await send({ 
                    document: buffer, 
                    mimetype: 'image/png', 
                    fileName: `Asura_Emoji_${Date.now()}.png` 
                });

            case 'text': // View Message Info (Modern Placeholder)
                return await send({ text: `📊 *Media Info:*\n\nType: ${type}\nMime: ${mime}\nSize: ${buffer.length} bytes` });

            default:
                return send({ text: "⚠️ *Invalid Format!* Use: sticker, image, video, gif, audio, voice, pdf, emoji" });
        }

    } catch (e) {
        console.error("Conversion Error:", e);
        return sock.sendMessage(chat, { text: "❌ *Error:* പ്രോസസ്സിംഗ് പരാജയപ്പെട്ടു. ഫയൽ സൈസ് അധികമാണോ എന്ന് പരിശോധിക്കുക." });
    }
};
