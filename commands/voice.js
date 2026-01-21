import * as googleTTS from 'google-tts-api';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: "example👉.    .voice Hello how are you ." }, { quoted: msg });

    try {
        // വലിയ ടെക്സ്റ്റിനെ 200 അക്ഷരങ്ങൾ വീതമുള്ള ഭാഗങ്ങളായി തിരിക്കുന്നു
        const results = googleTTS.getAllAudioUrls(text, {
            lang: 'ml', 
            slow: false,
            host: 'https://translate.google.com',
        });

        
 results[0].url ഉപയോഗിക്കുന്നു
        const audioUrl = results[0].url;

        await sock.sendMessage(chat, { 
            audio: { url: audioUrl }, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true 
        }, { quoted: msg });

    } catch (e) {
        console.error("TTS Error:", e);
        await sock.sendMessage(chat, { text: "😗." });
    }
};
