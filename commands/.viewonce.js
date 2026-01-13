import fs from 'fs';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const thumbPath = "./media/thumb.jpg";

    // റിപ്ലൈ ചെയ്ത മെസ്സേജ് വൺസ് വ്യൂ ആണോ എന്ന് പരിശോധിക്കുന്നു
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const viewOnceMsg = quoted?.viewOnceMessageV2?.message || quoted?.viewOnceMessage?.message;

    if (!viewOnceMsg) {
        return sock.sendMessage(chat, { text: "❌ Please reply to a *View Once* message!" }, { quoted: msg });
    }

    try {
        const type = Object.keys(viewOnceMsg)[0]; // imageMessage, videoMessage, or audioMessage
        const media = viewOnceMsg[type];

        // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(media, type.replace('Message', ''));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = "> 👺ASURA MD";
        const commonOptions = { quoted: msg };

        // വോയിസ് മെസ്സേജ് ആണെങ്കിൽ
        if (type === 'audioMessage') {
            await sock.sendMessage(chat, { 
                audio: buffer, 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, commonOptions);

        } 
        // ഇമേജ് ആണെങ്കിൽ
        else if (type === 'imageMessage') {
            await sock.sendMessage(chat, { 
                image: buffer, 
                caption: caption,
                jpegThumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null
            }, commonOptions);

        } 
        // വീഡിയോ ആണെങ്കിൽ
        else if (type === 'videoMessage') {
            await sock.sendMessage(chat, { 
                video: buffer, 
                caption: caption,
                mimetype: 'video/mp4',
                jpegThumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null
            }, commonOptions);
        }

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ Failed to retrieve the media. It might have expired." }, { quoted: msg });
    }
};
