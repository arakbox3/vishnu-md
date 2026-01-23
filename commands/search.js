import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🔍 *.search whatsapp.com*" });

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

        // 2. വിക്കിപീഡിയ ഓപ്പൺ API (ഇത് ബ്ലോക്ക് ആവില്ല)
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        
        const response = await axios.get(wikiUrl);
        const data = response.data;

        if (data.title && data.extract) {
            // മറുപടി ബോക്സ് ഡിസൈൻ
            const resultMsg = `
╭━━〔 👺 *ASURA-MD SEARCH* 〕━━┈⊷
┃
┃ 📚 *Title:* ${data.title}
┃ 🏛️ *Category:* ${data.description || 'General'}
┃
┣━━━━━━━━━━━━━━┈⊷
┃
${data.extract}
┃
╰━━━━━━━━━━━━━━━┈⊷
> *© ASURA MD SYSTEM*`;

            // ചിത്രം ഉണ്ടെങ്കിൽ അത് സഹിതം അയക്കുന്നു
            if (data.thumbnail && data.thumbnail.source) {
                await sock.sendMessage(from, { 
                    image: { url: data.thumbnail.source }, 
                    caption: resultMsg 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: resultMsg }, { quoted: msg });
            }

            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
        } else {
            throw new Error("No summary found");
        }

    } catch (e) {
        // റിസൾട്ട് കിട്ടിയില്ലെങ്കിൽ മാത്രം ഇത് വരും
        console.error(e);
        await sock.sendMessage(from, { 
            text: "❌ *Result Not Found!*\nകൂടുതൽ വ്യക്തമായ ഒരു വാക്ക് നൽകി നോക്കൂ (ഉദാ: .search Earth)" 
        }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
    }
};
