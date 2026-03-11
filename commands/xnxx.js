import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Cookie': 'premium_visit=1' 
    };

    if (!query) return sock.sendMessage(from, { text: "❌ .xnxx hot!" });

    try {
        await sock.sendMessage(from, { text: "🔍 Searching..." });

        const searchUrl = `https://www.xnxx.com/search/${encodeURIComponent(query)}`;
        const { data } = await axios.get(searchUrl, { headers });

    
        const videoIdMatch = data.match(/\/video-([a-z0-9]+)\//);
        
        if (!videoIdMatch) return sock.sendMessage(from, { text: "❌ error." });

        const videoPageUrl = `https://www.xnxx.com${videoIdMatch[0]}`;
        const videoPage = await axios.get(videoPageUrl, { headers });

        const highResMatch = videoPage.data.match(/setVideoUrlHigh\('(.*?)'\)/);
        const lowResMatch = videoPage.data.match(/setVideoUrlLow\('(.*?)'\)/);
        
        const finalUrl = highResMatch ? highResMatch[1] : (lowResMatch ? lowResMatch[1] : null);

        if (finalUrl) {
            await sock.sendMessage(from, { 
                video: { url: finalUrl }, 
                caption: "✅ *Asura MD Download*",
                mimetype: 'video/mp4'
            }, { quoted: msg });
        } else {
            sock.sendMessage(from, { text: "❌ error." });
        }

    } catch (e) {
        console.error(e);
        sock.sendMessage(from, { text: "❌ Error." });
    }
};
