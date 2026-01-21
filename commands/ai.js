import googleIt from 'google-it';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');
    const thumbPath = './image/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: ".Ai  who is Cr7" }, { quoted: msg });

    try {
        // ഗൂഗിൾ സെർച്ച് ചെയ്യുന്നു
        const results = await googleIt({ query: text, 'no-display': true });

        if (!results || results.length === 0) {
            return sock.sendMessage(chat, { text: "ERROR!" });
        }

        let searchResultText = `🔍 *👺 ASURA MD SEARCH RESULTS* \n\n`;
        
        results.forEach((res, index) => {
            searchResultText += `*${index + 1}. ${res.title}*\n`;
            searchResultText += `🔗 ${res.link}\n`;
            searchResultText += `📄 ${res.snippet}\n\n`;
        });

        // റിസൾട്ട് ഒരു ടെക്സ്റ്റ് ഫയൽ ആയി അയക്കുന്നു (ഡൗൺലോഡ് ഒഴിവാക്കാൻ)
        const fileName = 'search_results.txt';
        fs.writeFileSync(fileName, searchResultText);

        await sock.sendMessage(chat, {
            document: fs.readFileSync(fileName),
            mimetype: 'text/plain',
            fileName: `${text}_results.txt`,
            caption: `✅ *👺 ASURA MD* ${text}`,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA  MD",
                    body: "Images, Videos, and Links found",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: "https://google.com"
                }
            }
        }, { quoted: msg });

        // അയച്ച ശേഷം താൽക്കാലിക ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
        fs.unlinkSync(fileName);

    } catch (e) {
        console.error("Search Error:", e);
        await sock.sendMessage(chat, { text: "Error!" });
    }
};
