import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🤡", key: msg.key } });

        // 2.(Multi-language API)
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        const joke = response.data;

        const jokeText = `*JOKE OF THE DAY* 👺\n\n*Setup:* ${joke.setup}\n*Punchline:* ${joke.punchline}`;

        // 3. ഭാഷാ മാറ്റം വേണമെങ്കിൽ (ഉദാഹരണം: .joke malayalam)
        const lang = args[0] ? args[0].toLowerCase() : 'english';

        if (lang !== 'english') {
            
            const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURI(jokeText)}`;
            const res = await axios.get(translateUrl);
            const translatedJoke = res.data[0].map(s => s[0]).join("");
            
            await sock.sendMessage(from, { text: translatedJoke }, { quoted: msg });
        } else {
            
            await sock.sendMessage(from, { text: jokeText }, { quoted: msg });
        }

    } catch (e) {
        console.error("Joke Error:", e);
        await sock.sendMessage(from, { text: "⚠️ server busy!" });
    }
};

