import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: ".Voice how are you..." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് ലോജിക് ---
        let processedText = text.length > 10 ? text.replace(/\s+/g, ', ') : text;
        if (/(എന്ത്|എവിടെ|എങ്ങനെ|ആര്|ആണോ|സുഖമാണോ)/i.test(text)) processedText += '?';

        // --- ലാംഗ്വേജ് ഡിറ്റക്ഷൻ (നിങ്ങൾ നൽകിയ എല്ലാ ഭാഷകളും) ---
        let lang = 'en';
        if (/[അ-ഹ]/.test(text)) lang = 'ml';
        else if (/[அ-ஹ]/.test(text)) lang = 'ta';
        else if (/[क-ह]/.test(text)) lang = 'hi';
        else if (/[అ-హ]/.test(text)) lang = 'te';
        else if (/[ಅ-ಹ]/.test(text)) lang = 'kn';
        else if (/[क-ह]/.test(text)) lang = 'mr';
        else if (/[ক-হ]/.test(text)) lang = 'bn';
        else if (/[ગુજરાતી]/.test(text)) lang = 'gu';
        else if (/[a-zA-Z]/.test(text)) lang = 'en';
        // മറ്റ് ഭാഷകൾ ആവശ്യമെങ്കിൽ ഇതേപോലെ ചേർക്കാം

        // --- Direct Stream Logic (No Download) ---
        // 200 അക്ഷരങ്ങൾ വരെ ഒറ്റയടിക്ക് സ്ട്രീം ചെയ്യാം
        const url = googleTTS.getAudioUrl(processedText.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });
        
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(res.data, 'utf-8');

        // വോയ്‌സ് മെസ്സേജ് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI VOICE - ${lang.toUpperCase()}`,
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
        await sock.sendMessage(chat, { text: "Error: 🥲" });
    }
};
