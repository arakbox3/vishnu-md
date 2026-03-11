import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    // Check if query is provided
    if (!query) {
        return sock.sendMessage(from, { text: "❌ Please provide a search query! \nExample: *.xnxx hot*" });
    }

    try {
        // Inform user that search is starting
        await sock.sendMessage(from, { text: "🔍 Searching for your video, please wait..." }, { quoted: msg });

        // Using a public API for searching and downloading
        // Note: You can replace this URL with any working XNXX API URL
        const searchRes = await axios.get(`https://api.vreden.my.id/api/xnxxsearch?query=${encodeURIComponent(query)}`);
        
        if (!searchRes.data.result || searchRes.data.result.length === 0) {
            return sock.sendMessage(from, { text: "❌ No results found for your query." });
        }

        const video = searchRes.data.result[0]; // Taking the first result
        const downloadRes = await axios.get(`https://api.vreden.my.id/api/xnxxdl?url=${video.link}`);
        
        const videoUrl = downloadRes.data.result.files.high || downloadRes.data.result.files.low;

        // Send Video Details with Thumbnail
        await sock.sendMessage(from, { 
            image: { url: video.thumb }, 
            caption: `🔥 *TITLE:* ${video.title}\n⏱️ *DURATION:* ${video.duration}\n\n*Uploading video, please wait...*` 
        }, { quoted: msg });

        // Send the actual video file
        await sock.sendMessage(from, {
            video: { url: videoUrl }, 
            caption: `✅ *Download Complete:* ${video.title}`,
            mimetype: 'video/mp4'
        }, { quoted: msg });

    } catch (e) {
        console.error("XNXX Command Error:", e);
        sock.sendMessage(from, { text: "❌ API Error. The service might be down or blocked." });
    }
};
