import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    let query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🔍 *What do you want to search?*\nExample: `.search Space`" }, { quoted: msg });

    try {
        await sock.sendMessage(from, { react: { text: "🔍", key: msg.key } });

        // Step 1: വിക്കിപീഡിയയിൽ ഈ പേരുണ്ടോ എന്ന് ആദ്യം സെർച്ച് ചെയ്യുന്നു (Search Suggestion)
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
        const searchRes = await axios.get(searchUrl);
        
        if (!searchRes.data.query.search.length) {
            return sock.sendMessage(from, { text: "❌ No results found for your search!" }, { quoted: msg });
        }

        // ഏറ്റവും അനുയോജ്യമായ ടൈറ്റിൽ എടുക്കുന്നു
        const actualTitle = searchRes.data.query.search[0].title;

        // Step 2: ആ ടൈറ്റിൽ വെച്ച് വിവരങ്ങൾ എടുക്കുന്നു
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(actualTitle)}`;
        const response = await axios.get(wikiUrl);
        const data = response.data;

        // Message Design
        let wikiMsg = `*👺 ASURA MD ENGINE*\n`;
        wikiMsg += `*⊙────────────────────❂*\n\n`;
        wikiMsg += `🏛️ *TITLE:* ${data.title}\n`;
        wikiMsg += `📝 *INFO:* ${data.description || 'General Information'}\n\n`;
        wikiMsg += `📖 *SUMMARY:* ${data.extract}\n\n`;
        wikiMsg += `🔗 *LINK:* ${data.content_urls.desktop.page}\n\n`;
        wikiMsg += `⊙──────────────────────\n`;
        wikiMsg += `*© ASURA MD - OFFICIAL*`;

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
        console.error('Search Error:', error);
        await sock.sendMessage(from, { text: "❌ *Error:* Information fetch failed! Try again." });
    }
};
