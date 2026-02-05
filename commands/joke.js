import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🤡", key: msg.key } });

        // 2. Joke Fetch ചെയ്യുന്നു
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const { setup, punchline } = response.data;
        const jokeText = `*JOKE OF THE DAY* 👺 ASURA-MD \n\n${setup}\n\n${punchline}`;

        const targetLang = args[0] ? args[0].toLowerCase() : 'en';
        let finalJoke = jokeText;

        if (targetLang !== 'en' && targetLang !== 'english') {
            const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURI(jokeText)}`;
            
            const res = await axios.get(translateUrl);
            
            finalJoke = res.data[0].map(s => s[0]).join("");
        }

        await sock.sendMessage(from, { text: finalJoke }, { quoted: msg });

    } catch (e) {
        console.error("Joke Error:", e);
        
        await sock.sendMessage(from, { text: "⚠️ Error! Please check the language code (e.g: .joke ml, .joke hi)" });
    }
};
