import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // ടൈപ്പിംഗ് സ്റ്റാറ്റസ്
    await sock.sendPresenceUpdate('composing', chat);

    try {
        // ഉപയോക്താവ് വിഷയം നൽകിയിട്ടുണ്ടെങ്കിൽ അത്, അല്ലെങ്കിൽ 'India' വാർത്തകൾ
        const query = args.length > 0 ? args.join(' ') : 'India';
        
        // Google News RSS URL (English - India)
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        });

        // വാർത്തകൾ വേർതിരിച്ചെടുക്കുന്നു
        const items = data.match(/<item>([\s\S]*?)<\/item>/g) || [];
        
        if (items.length === 0) {
            return await sock.sendMessage(chat, { text: `❌ No news found for: ${query}` }, { quoted: msg });
        }

        let newsMsg = `*📰 LATEST NEWS: ${query.toUpperCase()}*\n\n`;

        // ആദ്യത്തെ 5 വാർത്തകൾ മാത്രം എടുക്കുന്നു
        for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];
            
            // ടൈറ്റിൽ, ലിങ്ക്, ഉറവിടം എന്നിവ Regex വഴി എടുക്കുന്നു
            let title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "No Title";
            const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
            const source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "Google News";

            // HTML entities ക്ലീൻ ചെയ്യുന്നു
            title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

            newsMsg += `*${i + 1}. ${title}*\n`;
            newsMsg += `📍 _Source: ${source}_\n`;
            newsMsg += `🔗 ${link}\n\n`;
        }

        newsMsg += `> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // വാർത്ത അയക്കുന്നു
        await sock.sendMessage(chat, { 
            text: newsMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD NEWS UPDATES",
                    body: `Top stories about ${query}`,
                    mediaType: 1,
                    sourceUrl: "https://news.google.com", 
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

        // റിയാക്ഷൻ
        await sock.sendMessage(chat, { react: { text: "📰", key: msg.key } });

    } catch (e) {
        console.error("News Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error fetching news. Please try again later." }, { quoted: msg });
    }
};

