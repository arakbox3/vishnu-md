import axios from 'axios';
import FormData from 'form-data';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message;

    // 1. Identify Media Type
    const mimeType = quoted.imageMessage ? 'image' : 
                     quoted.videoMessage ? 'video' : 
                     quoted.audioMessage ? 'audio' : 
                     quoted.documentMessage ? 'document' : null;

    if (!mimeType) {
        return sock.sendMessage(from, { text: '❌ *Reply to an image, video, audio, or document to generate a link.*' }, { quoted: msg });
    }

    try {
        await sock.sendMessage(from, { react: { text: "🔗", key: msg.key } });

        // 2. Download Media into Buffer (No local file save)
        const message = quoted.imageMessage || quoted.videoMessage || quoted.audioMessage || quoted.documentMessage;
        const stream = await downloadContentFromMessage(message, mimeType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 3. Upload to Catbox (Permanent & Reliable)
        const formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('fileToUpload', buffer, { filename: `asura_media.${mimeType === 'image' ? 'jpg' : 'mp4'}` });

        const response = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: { ...formData.getHeaders() }
        });

        const url = response.data;

        // 4. Professional Response
        const responseText = `*───「 👺 ASURA-MD 」───*

*✅ Uploaded Successfully!*

🔗 *URL:* ${url}
📂 *Type:* ${mimeType.toUpperCase()}
🕒 *Expiry:* Permanent

> Copy the link above to share your file. 👺`;

        await sock.sendMessage(from, {
            text: responseText,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MEDIA UPLOADER",
                    body: "File converted to permanent link",
                    thumbnailUrl: "http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/back03.jpg",
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('URL Command Error:', e);
        await sock.sendMessage(from, { text: "❌ *Failed to upload media. Please try again later.*" });
    }
};
