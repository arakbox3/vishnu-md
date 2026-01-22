import axios from 'axios';
import fetch from 'node-fetch';
export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');
    const command = msg.body ? msg.body.split(' ')[0].toLowerCase() : '';

    // ഇൻപുട്ട് ഇല്ലെങ്കിൽ മറുപടി നൽകുന്നു
    if (!query) {
        return await sock.sendMessage(chat, { 
            text: `*ASURA MD SEARCH ENGINE*\n\nExample: \`\`\`.Search write a kutty story\`\`\``
        }, { quoted: msg });
    }

    try {
        // റിക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: '🤖', key: msg.key } });

        if (command === '.gpt') {
            // GPT API സെക്ഷൻ
            const response = await axios.get(`https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(query)}`);
            
            if (response.data && response.data.result) {
                const answer = response.data.result;
                await sock.sendMessage(chat, { text: `*ASURA MD RESPONSE:*\n\n${answer}` }, { quoted: msg });
            } else {
                throw new Error('GPT API Error');
            }

        } else if (command === '.gemini') {
            // Gemini API സെക്ഷൻ (Multi-API fallback system)
            const apis = [
                `https://vapis.my.id/api/gemini?q=${encodeURIComponent(query)}`,
                `https://api.siputzx.my.id/api/ai/gemini-pro?content=${encodeURIComponent(query)}`,
                `https://api.ryzendesu.vip/api/ai/gemini?text=${encodeURIComponent(query)}`,
                `https://api.giftedtech.my.id/api/ai/geminiai?apikey=gifted&q=${encodeURIComponent(query)}`
            ];

            let success = false;
            for (const api of apis) {
                try {
                    const response = await fetch(api);
                    const data = await response.json();
                    const result = data.message || data.data || data.answer || data.result;

                    if (result) {
                        await sock.sendMessage(chat, { text: `*ASURA MD RESPONSE:*\n\n${result}` }, { quoted: msg });
                        success = true;
                        break; 
                    }
                } catch (e) {
                    continue; 
                }
            }

            if (!success) throw new Error('All Gemini APIs failed');
        }

    } catch (error) {
        console.error('AI Error:', error);
        await sock.sendMessage(chat, { 
            text: "❌ *ASURA MD ERROR:*" 
        }, { quoted: msg });
    }
};
