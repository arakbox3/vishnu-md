import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "🎤text message..." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് തോന്നിപ്പിക്കാനുള്ള വിദ്യ (Smart Logic) ---
        // 1. ഒന്നിലധികം വാക്കുകൾ ഉണ്ടെങ്കിൽ ഇടയിൽ ചെറിയൊരു വിരാമം വരാൻ സ്പേസിനെ കോമയാക്കുന്നു.
        // 2. ചോദ്യം ചോദിക്കുന്ന വാക്കുകൾ ഉണ്ടെങ്കിൽ അവസാനം ചോദ്യചിഹ്നം ചേർക്കുന്നു.
        
        let processedText = text;
        if (text.length > 10) {
            processedText = text.replace(/\s+/g, ', '); // വാക്കുകൾക്കിടയിൽ കോമയിട്ടാൽ ഗൂഗിൾ ശ്വാസം വിടുന്നത് പോലെ ഇടവേളയെടുക്കും
        }
        
        // മലയാളം ചോദ്യങ്ങൾ തിരിച്ചറിയാൻ
        if (/(എന്ത്|എവിടെ|എങ്ങനെ|ആര്|ആണോ|സുഖമാണോ)/i.test(text)) {
            processedText += '?';
        }

        // --- ലാംഗ്വേജ് ഡിറ്റക്ഷൻ ---
        let lang = 'ml'; 
        if (/[a-zA-Z]/.test(text)) lang = 'en';
        else if (/[ऀ-ॿ]/.test(text)) lang = 'hi';
        else if (/[ീ-௿]/.test(text)) lang = 'ta';
        else if (/[അ-ഹ]/.test(text)) lang = 'ml';

        // Direct Stream URL
        const url = googleTTS.getAudioUrl(processedText, {
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
                    title: "ASURA MD SMART VOICE",
                    body: "Human-like Pronunciation Engine",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "Error!" });
    }
};
