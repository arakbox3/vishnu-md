import * as googleTTS from 'google-tts-api';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: "*Example: .voice Hello how are you*" }, { quoted: msg });

    try {
        // ---(Language Detection) ---
        let lang = 'en'; // Default English
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      // Malayalam
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; // Tamil
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; // Hindi
        else if (/[\u0600-\u06FF]/.test(text)) lang = 'ar'; // Arabic

        // --- Unlimited Text Support (Split into chunks) --
        const results = googleTTS.getAllAudioUrls(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // ആദ്യത്തെ യുആർഎൽ എടുക്കുന്നു (ഡൗൺലോഡ് ഇല്ലാതെ അയക്കാൻ)
        if (results && results.length > 0) {
            const audioUrl = results[0].url;

            await sock.sendMessage(chat, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        } else {
            throw new Error("error 404");
        }

    } catch (e) {
        console.error("TTS Error:", e);
        await sock.sendMessage(chat, { text: "Error: 😥!" });
    }
};
