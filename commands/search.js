import axios from 'axios';

// നിങ്ങളുടെ 3 കീകൾ ഇവിടെ നൽകുക
const apiKeys = [
    "AIzaSyBTC8HtiBgpNFAZnm_nJyH32dwiEcsVX4o",
    "AIzaSyB5Vb84o2Wrdgd2jV44dKCJa-1EgeQ6mss",
    "AIzaSyCOvyzPJ-0lrz1GResd8yWgiXy-yAuPqKU"
];

let currentIdx = 0;

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🏮 *ASURA MD*\n\nAsk me anything!" });

    // ടൈപ്പിംഗ് ഇൻഡിക്കേഷൻ നൽകുന്നു
    await sock.sendPresenceUpdate('composing', from);
    await sock.sendMessage(from, { react: { text: "🔮", key: msg.key } });

    // Round-Robin രീതിയിൽ കീ മാറ്റുന്നു
    const apiKey = apiKeys[currentIdx];
    currentIdx = (currentIdx + 1) % apiKeys.length;

    try {
        // ഒഫീഷ്യൽ എൻഡ്‌പോയിന്റ് കൃത്യമായി നൽകുന്നു
        const response = await axios({
            method: 'post',
            url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            data: {
                contents: [{
                    parts: [{ text: query }]
                }]
            },
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000 // 15 സെക്കൻഡ് കഴിഞ്ഞാൽ കണക്ഷൻ കട്ട് ചെയ്യും (Server Busy ഒഴിവാക്കാൻ)
        });

        const aiText = response.data.candidates[0].content.parts[0].text;

        const design = `*👺 ASURA MD  RESPONSE*\n*⊙────────────────────❂*\n\n${aiText}\n\n*⊙──────────────────────*\n*© ASURA-MD INTELLIGENCE *`;

        await sock.sendMessage(from, { text: design }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error('Gemini Error Details:', error.response ? error.response.data : error.message);
        
        let errorMsg = "❌ *Server Busy:* Connection timed out!";
        
        if (error.response) {
            const status = error.response.status;
            if (status === 400) errorMsg = "❌ *Bad Request:* Code logic error.";
            if (status === 403) errorMsg = "❌ *Invalid Key:* Your API Key is wrong.";
            if (status === 429) errorMsg = "❌ *Limit Reached:* Too many requests.";
        }

        await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        await sock.sendMessage(from, { react: { text: "⚠️", key: msg.key } });
    }
};
