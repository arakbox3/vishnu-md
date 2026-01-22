import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🔍 What do you want to search on Asura MD?\nExample: *.search Albert Einstein*" }, { quoted: msg });

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "📚", key: msg.key } });

        // 2. വിക്കിപീഡിയ ഒഫീഷ്യൽ ഫ്രീ API (No Key Needed)
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
        const response = await axios.get(wikiUrl);
        const data = response.data;

        // 3. വിവരങ്ങൾ ഇല്ലാത്ത സാഹചര്യം
        if (data.type === 'disambiguation' || !data.title) {
            return sock.sendMessage(from, { text: "❌ Clear result not found. Please be more specific!" });
        }

        // 4. മെസ്സേജ് ഡിസൈൻ
        let wikiMsg = `*👺 ASURA MD*\n`;
        wikiMsg += `*Asura MD SEARCH ENGINE*\n`;
        wikiMsg += `*⊙────────────────────❂*\n\n`;
        
        wikiMsg += `🏛️ *Title:* ${data.title}\n`;
        wikiMsg += `📝 *Description:* ${data.description || 'Global Knowledge'}\n\n`;
        wikiMsg += `📖 *Summary:* ${data.extract}\n\n`;
        
        wikiMsg += `⊙──────────────────────\n`;
        wikiMsg += `*©  ASURA MD - OFFICIAL*`;

        // 5.  (No Download)
        if (data.thumbnail && data.thumbnail.source) {
            await sock.sendMessage(from, { 
                image: { url: data.thumbnail.source }, 
                caption: wikiMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: wikiMsg }, { quoted: msg });
        }

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error('Wiki Error:', error);
        await sock.sendMessage(from, { text: "❌ I couldn't find information on that topic. Try a different keyword!" });
    }
};
