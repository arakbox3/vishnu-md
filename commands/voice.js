import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "എന്തെങ്കിലും ടൈപ്പ് ചെയ്യൂ..." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് ലോജിക് ---
        let processedText = text.length > 10 ? text.replace(/\s+/g, ', ') : text;
        if (/(എന്ത്|എവിടെ|എങ്ങനെ|ആര്|ആണോ|സുഖമാണോ)/i.test(text)) processedText += '?';

        // --- ലാംഗ്വേജ് ഡിറ്റക്ഷൻ ---
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta';
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi';
        else if (/[\u0600-\u06FF]/.test(text)) lang = 'ar';
        else if (/[a-zA-Z]/.test(text)) lang = 'en';

        // --- Direct URL fetch (No Download) ---
        const url = googleTTS.getAudioUrl(processedText.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // യുആർഎൽ നേരിട്ട് ബഫർ ആയി എടുക്കുന്നു (ഇതാണ് ഏറ്റവും സുരക്ഷിതമായ രീതി)
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data, 'utf-8');

        await sock.sendMessage(chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI VOICE - ${lang.toUpperCase()}`,
                    body: "No-Download High Quality Stream",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("Voice Error:", e);
        await sock.sendMessage(chat, { text: "Error: വോയ്‌സ് ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല." });
    }
};
