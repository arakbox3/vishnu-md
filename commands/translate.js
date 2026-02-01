export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // 1. ഭാഷയും ടെക്സ്റ്റും വേർതിരിക്കുന്നു
    let lang = args[0]?.toLowerCase() || 'ml'; 
    let text = args.slice(1).join(" ");

    // 2. റിപ്ലൈ മെസ്സേജ് ആണെങ്കിൽ അത് എടുക്കുന്നു
    if (quoted) {
        text = quoted.conversation || quoted.extendedTextMessage?.text || "";
        lang = args[0]?.toLowerCase() || 'ml';
    }

    if (!text) return await sock.sendMessage(chat, { text: "👺 *Usage:* \n.translate [lang] [text]\n.translate [lang] (reply to a message)" }, { quoted: msg });

    try {
        // 3. Google Official Free API URL
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
        
        const response = await fetch(url);
        const result = await response.json();

        if (result && result[0]) {
            let translatedText = result[0].map(x => x[0]).join("");
            
            const trDesign = `
*🏮 TRANSLATION 🏮*
━━━━━━━━━━━━
*From:* Auto Detect
*To:* ${lang.toUpperCase()}

*Original:* ${text}
*Result:* \`${translatedText}\`
━━━━━━━━━━━━
> *© 👺Asura MD*`;

            await sock.sendMessage(chat, { text: trDesign }, { quoted: msg });
        }
    } catch (e) {
        console.error("Translation Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error." }, { quoted: msg });
    }
};
