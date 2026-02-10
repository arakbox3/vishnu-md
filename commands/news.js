import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    await sock.sendPresenceUpdate('composing', chat);

    try {
        const query = args.length > 0 ? args.join(' ') : 'India';
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            },
            timeout: 6000
        });

        const data = response.data;
        const items = data.match(/<item>([\s\S]*?)<\/item>/g);

        if (!items || items.length === 0) {
            return await sock.sendMessage(chat, { text: `❌ No news found for: ${query}` }, { quoted: msg });
        }

        let newsMsg = `*📰 LATEST NEWS — ${query.toUpperCase()}*\n\n`;

        for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];

            let title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "No Title";
            let source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "News Source";
            let pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
            let description = item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";

            // Clean title
            title = title.split(' - ')[0];

            // Clean HTML entities
            const clean = (txt) =>
                txt.replace(/<[^>]+>/g, '')
                   .replace(/&amp;/g, '&')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'")
                   .trim();

            title = clean(title);
            description = clean(description);

            newsMsg += `*${i + 1}. ${title}*\n`;
            newsMsg += `🗞 _${source}_\n`;
            if (pubDate) newsMsg += `🕒 ${new Date(pubDate).toLocaleString()}\n\n`;
            newsMsg += `📄 ${description}\n\n`;
            newsMsg += `──────────────────\n\n`;
        }

        newsMsg += `> © 👺 Asura MD News`;

        await sock.sendMessage(chat, { text: newsMsg }, { quoted: msg });
        await sock.sendMessage(chat, { react: { text: "📰", key: msg.key } });

    } catch (e) {
        console.error("News Error:", e.message);
        await sock.sendMessage(chat, { text: "❌ News Server busy. Try again later." }, { quoted: msg });
    }
};
