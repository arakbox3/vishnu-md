import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "*ഉപയോഗിക്കേണ്ട രീതി:* .voice [വാചകം]" }, { quoted: msg });

    try {
        // 1. ലാംഗ്വേജ് ഓട്ടോമാറ്റിക് ആയി തിരിച്ചറിയുന്നു (Malayalam, Hindi, Tamil, English)
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      // Malayalam
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; // Hindi
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; // Tamil
        else if (/[a-zA-Z]/.test(text)) lang = 'en';       // English

        // 2. ലാർജ് ടെക്സ്റ്റ് സപ്പോർട്ട് (200 അക്ഷരത്തിൽ കൂടുതൽ ഉണ്ടെങ്കിൽ മുറിയാതെ നോക്കും)
        // google-tts-api-ലെ getAllAudioUrls ഉപയോഗിച്ച് വലിയ ടെക്സ്റ്റിനെ ഭാഗങ്ങളാക്കുന്നു
        const results = googleTTS.getAllAudioUrls(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // 3. ആദ്യത്തെ ഭാഗം എടുക്കുന്നു (ഏറ്റവും stable ആയ വഴി)
        const audioUrl = results[0].url;

        // 4. No Download - Axios വഴി Buffer ആയി മാറ്റുന്നു
        const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        const audioBuffer = Buffer.from(response.data, 'utf-8');

        // 5. വോയ്‌സ് നോട്ടായി അയക്കുന്നു
        await sock.sendMessage(chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI VOICE (${lang.toUpperCase()})`,
                    body: text.length > 30 ? text.slice(0, 30) + '...' : text,
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("Google TTS Error:", e);
        await sock.sendMessage(chat, { text: "❌ വോയ്‌സ് നിർമ്മിക്കാൻ കഴിഞ്ഞില്ല. ദയവായി പിന്നീട് ശ്രമിക്കൂ." });
    }
};
