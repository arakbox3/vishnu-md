import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // View Once മെസ്സേജിന് മറുപടി (Reply) നൽകിയിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quoted) {
        return sock.sendMessage(chat, { text: "❌ Please reply to a *View Once* message!" }, { quoted: msg });
    }

    // View Once കണ്ടന്റ് ഏതാണെന്ന് കണ്ടെത്തുന്നു (Image, Video, or Audio)
    const type = Object.keys(quoted)[0];
    const viewOnce = quoted[type]?.viewOnce;

    if (!viewOnce) {
        return sock.sendMessage(chat, { text: "❌ This is not a *View Once* message!" }, { quoted: msg });
    }

    try {
        // കണ്ടന്റ് ഡൗൺലോഡ് ചെയ്യുന്നു (No storage, stays in memory buffer)
        const media = quoted[type];
        const stream = await downloadContentFromMessage(media, type === 'imageMessage' ? 'image' : type === 'videoMessage' ? 'video' : 'audio');
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const caption = "> *👺⃝⃘̉ Asura MD*";

        // തിരികെ അയക്കുന്നു
        if (type === 'imageMessage') {
            await sock.sendMessage(chat, { image: buffer, caption: caption }, { quoted: msg });
        } else if (type === 'videoMessage') {
            await sock.sendMessage(chat, { video: buffer, caption: caption }, { quoted: msg });
        } else if (type === 'audioMessage') {
            await sock.sendMessage(chat, { audio: buffer, mimetype: 'audio/ogg', ptt: false }, { quoted: msg });
            await sock.sendMessage(chat, { text: caption }, { quoted: msg });
        }

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ Failed to fetch View Once media!" });
    }
};
