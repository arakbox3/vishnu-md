import axios from 'axios';

const getAudio = async (query = '') => {
    try {
        let url = query 
            ? `https://www.myinstants.com/search/?name=${encodeURIComponent(query)}`
            : `https://www.myinstants.com/index/in/`;

        // ബ്രൗസർ റിക്വസ്റ്റ് ആണെന്ന് തോന്നിപ്പിക്കാൻ ഹെഡേഴ്സ് ചേർക്കുന്നു
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        // MP3 ലിങ്കുകൾ കണ്ടെത്തുന്നു
        const audioMatches = data.match(/\/media\/sounds\/[\w.-]+\.mp3/g);
        
        if (audioMatches && audioMatches.length > 0) {
            // Shuffle ലോജിക്
            const randomIndex = Math.floor(Math.random() * audioMatches.length);
            const audioUrl = `https://www.myinstants.com${audioMatches[randomIndex]}`;
            
            return { status: true, url: audioUrl };
        }
        return { status: false };
    } catch (e) {
        console.error("Audio Error:", e.message);
        return { status: false };
    }
};

export default {
    name: 'audio',
    async execute(m, { args, conn }) {
        const query = args.join(' ');
        
        try {
            const result = await getAudio(query);

            if (result.status) {
                // വാട്സാപ്പിലേക്ക് നേരിട്ട് ഓഡിയോ സ്ട്രീം ചെയ്യുന്നു
                await conn.sendMessage(m.chat, {
                    audio: { url: result.url },
                    mimetype: 'audio/ogg',
                    ptt: true 
                }, { quoted: m });
            } else {
                m.reply("❌ please try again later.");
            }
        } catch (err) {
            m.reply("❌ error.");
        }
    }
};
