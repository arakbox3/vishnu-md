import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🔍 *എന്ത് ഗ്രൂപ്പാണ് തിരയുന്നത്?*\nExample: `.search Kerala WhatsApp Group`" });

    try {
        await sock.sendMessage(from, { react: { text: "🔗", key: msg.key } });

        // Groupsor.me സെർച്ച് ലിങ്ക്
        const searchUrl = `https://www.groupsor.me/search/${encodeURIComponent(query)}`;

        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        // Regex ഉപയോഗിച്ച് വാട്സാപ്പ് ലിങ്കുകൾ കണ്ടെത്തുന്നു
        const linkRegex = /https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+/g;
        const links = data.match(linkRegex);

        if (!links || links.length === 0) {
            return sock.sendMessage(from, { text: "❌ സോറി, ഗ്രൂപ്പ് ലിങ്കുകൾ ഒന്നും കണ്ടെത്താനായില്ല!" });
        }

        // ലിങ്കുകളിൽ നിന്ന് ഡ്യൂപ്ലിക്കേറ്റ് ഒഴിവാക്കുന്നു
        const uniqueLinks = [...new Set(links)].slice(0, 10); // ആദ്യത്തെ 10 എണ്ണം മാത്രം എടുക്കുന്നു

        let resultMsg = `*👺 ASURA GROUP FINDER*\n`;
        resultMsg += `*⊙────────────────────❂*\n\n`;
        resultMsg += `🔍 *Search:* ${query}\n\n`;
        
        uniqueLinks.forEach((link, index) => {
            resultMsg += `${index + 1}. ${link}\n\n`;
        });

        resultMsg += `*⊙──────────────────────*\n`;
        resultMsg += `*© ASURA MD - OFFICIAL*`;

        await sock.sendMessage(from, { text: resultMsg }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error('Group Search Error:', error);
        await sock.sendMessage(from, { text: "❌ ലിങ്കുകൾ എടുക്കാൻ പറ്റിയില്ല. സൈറ്റ് ബിസി ആയിരിക്കാം!" });
    }
};
