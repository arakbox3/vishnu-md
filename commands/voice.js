import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "text message..." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് ലോജിക് ---
        let processedText = text;
        if (text.length > 10) {
            processedText = text.replace(/\s+/g, ', '); 
        }
        
        if (/(എന്ത്|എവിടെ|എങ്ങനെ|ആര്|ആണോ|സുഖമാണോ)/i.test(text)) {
            processedText += '?';
        }

        // --- ലാംഗ്വേജ് ഡിറ്റക്ഷൻ (Fixed: text ഉപയോഗിച്ചു) ---
let lang = 'en';
if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      // Malayalam
else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; // Tamil
else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; // Hindi
else if (/[\u0C00-\u0C7F]/.test(text)) lang = 'te'; // Telugu
else if (/[\u0C80-\u0CFF]/.test(text)) lang = 'kn'; // Kannada
else if (/[\u0A80-\u0AFF]/.test(text)) lang = 'gu'; // Gujarati
else if (/[\u0980-\u09FF]/.test(text)) lang = 'bn'; // Bengali
else if (/[\u0600-\u06FF]/.test(text)) lang = 'ur'; // Urdu / Arabic
else if (/[\u0D80-\u0DFF]/.test(text)) lang = 'si'; // Sinhala (Hela)
else if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) lang = 'ko'; // Korean
else if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) lang = 'ja'; // Japanese
else if (/[\u4E00-\u9FFF]/.test(text)) lang = 'zh'; // Chinese
else if (/[a-zA-Z]/.test(text)) lang = 'en';      // English

        // Direct Stream URL (No Download)
        const url = googleTTS.getAudioUrl(processedText.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA MD AI VOICE - ${lang.toUpperCase()}`,
                    body: "Human-like Pronunciation Engine",
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
        await sock.sendMessage(chat, { text: "Error occurred!" });
    }
};
