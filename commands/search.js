import { search } from 'google-this';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "🔍 Example: *.Search* Cristiano Ronaldo" }, { quoted: msg });

    try {
        // 'google-this' ഉപയോഗിച്ചുള്ള സെർച്ച് (നോർമൽ സെർച്ച് + ഇമേജ്)
        const options = {
            page: 0, 
            safe: true, // എല്ലാ റിസൾട്ടും വരാൻ
            parse_ads: false, 
            additional_params: { 
                hl: 'en' 
            }
        };

        const response = await search(query, options);

        if (!response.results || response.results.length === 0) {
            return sock.sendMessage(chat, { text: "❌!" });
        }

        // മെസ്സേജ് ഫോർമാറ്റ് ചെയ്യുന്നു
        let replyText = `🚀 *ASURA MD SEARCH*\n\n`;
        
        // പ്രധാനപ്പെട്ട ആദ്യത്തെ 5 റിസൾട്ടുകൾ എടുക്കുന്നു
        response.results.slice(0, 5).forEach((res, index) => {
            replyText += `*${index + 1}. ${res.title}*\n`;
            replyText += `🔗 _${res.url}_\n`;
            replyText += `📄 ${res.description}\n\n`;
        });

        // നോളജ് പാനൽ (ഉദാഹരണത്തിന് ഒരു വ്യക്തിയെ കുറിച്ചാണെങ്കിൽ വിവരങ്ങൾ വരും)
        if (response.knowledge_panel.title) {
            replyText += `📌 *Info:* ${response.knowledge_panel.description || ''}\n\n`;
        }

        // ഫോട്ടോ അയക്കുന്നു (ആദ്യത്തെ ഇമേജ് ഡൗൺലോഡ് ഇല്ലാതെ URL വഴി)
        const firstImage = response.results[0].favicons?.high_res || null;

        if (firstImage) {
            await sock.sendMessage(chat, { 
                image: { url: firstImage }, 
                caption: replyText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: replyText }, { quoted: msg });
        }

    } catch (e) {
        console.error("Google-this Error:", e);
        await sock.sendMessage(chat, { text: "❌ Search process failed!" });
    }
};
