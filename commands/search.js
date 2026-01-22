import gis from 'g-i-s'; 
export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "🔍 .search who's cr7" }, { quoted: msg });

    try {
        // റിക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: '🔍', key: msg.key } });

        // g-i-s സെർച്ച് ആരംഭിക്കുന്നു
        gis(query, async (error, results) => {
            if (error || !results || results.length === 0) {
                return sock.sendMessage(chat, { text: "❌ ഫലങ്ങളൊന്നും ലഭിച്ചില്ല!" });
            }

            // ആദ്യത്തെ ചിത്രം എടുക്കുന്നു
            const firstImage = results[0].url;

            // റിസൾട്ട് മെസ്സേജ് സ്റ്റൈലിഷ് ആയി നിർമ്മിക്കുന്നു
            let searchMsg = `🌟 *ASURA MD GOOGLE SEARCH* 🌟\n\n`;
            searchMsg += `📝 *Query:* ${query}\n`;
            searchMsg += `───────────────────\n\n`;

            // ആദ്യ 5 റിസൾട്ടുകളുടെ വിവരങ്ങൾ ചേർക്കുന്നു
            results.slice(0, 5).forEach((res, index) => {
                searchMsg += `🖼️ *Result ${index + 1}*\n`;
                searchMsg += `🔗 ${res.url.slice(0, 50)}...\n\n`;
            });

            searchMsg += `───────────────────\n*ASURA AI SYSTEM*`;

            // ചിത്രം Caption സഹിതം അയക്കുന്നു (No Download)
            await sock.sendMessage(chat, { 
                image: { url: firstImage }, 
                caption: searchMsg 
            }, { quoted: msg });
        });

    } catch (e) {
        console.error("GIS Search Error:", e);
        await sock.sendMessage(chat, { text: "❌ തിരച്ചിലിനിടെ തടസ്സം നേരിട്ടു!" });
    }
};
