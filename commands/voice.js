import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: ".voice hello" }, { quoted: msg });

    try {
      
        const safeText = text.slice(0, 200);

        // --- മികച്ച ലാംഗ്വേജ് ഡിറ്റക്ഷൻ ---
        let lang = 'en'; 
        
        if (/[\u0D00-\u0D7F]/.test(safeText)) {
            lang = 'ml'; // മലയാളം അക്ഷരങ്ങൾ ഉണ്ടെങ്കിൽ
        } else if (/[\u0B80-\u0BFF]/.test(safeText)) {
            lang = 'ta'; // തമിഴ് അക്ഷരങ്ങൾ ഉണ്ടെങ്കിൽ
        } else if (/[\u0900-\u097F]/.test(safeText)) {
            lang = 'hi'; // ഹിന്ദി അക്ഷരങ്ങൾ ഉണ്ടെങ്കിൽ
        }

        // --- Audio URL നിർമ്മാണം ---
        const url = googleTTS.getAudioUrl(safeText, {
            lang: lang,
            slow: false, 
            host: 'https://translate.google.com',
        });

        // --- മെസ്സേജ് അയക്കുന്നു ---
        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI VOICE`,
                    body: `Detected: ${lang.toUpperCase()} | Voice: Clear`,
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("TTS Error:", e);
        await sock.sendMessage(chat, { text: "" });
    }
};
