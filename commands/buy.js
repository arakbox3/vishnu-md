export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chat, {
            text: "🛒 *ASURA MD SMART SHOP*\n\nUsage: `.buy iphone 15`"
        }, { quoted: msg });
    }

    await sock.sendPresenceUpdate('composing', chat);

    const q = encodeURIComponent(query);

    // Smart links
    const googleShop = `https://www.google.com/search?q=${q}&tbm=shop&tbs=p_ord:p`;
    const amazonLow = `https://www.amazon.in/s?k=${q}&s=price-asc-rank`;
    const flipkartLow = `https://www.flipkart.com/search?q=${q}&sort=price_asc`;
    const reviews = `https://www.google.com/search?q=${q}+review`;
    const youtube = `https://www.youtube.com/results?search_query=${q}+review+unboxing`;
    const specs = `https://www.google.com/search?q=${q}+specifications`;

    const msgText = `
🛍️ *ASURA MD — SMART PRICE FINDER*

📦 *Product:* ${query.toUpperCase()}

I found the best ways for you to get this product at the *lowest price* and with *full information*.

━━━━━━━━━━━━━━━━━━
💰 *Cheapest Price Links*

🔎 Google Shopping (Low → High)  
${googleShop}

🛒 Amazon India (Low → High)  
${amazonLow}

🛍️ Flipkart (Low → High)  
${flipkartLow}

━━━━━━━━━━━━━━━━━━
📊 *Before You Buy*

⭐ Reviews from users  
${reviews}

📺 Unboxing & Video Reviews  
${youtube}

📋 Full Specifications  
${specs}
━━━━━━━━━━━━━━━━━━

_✅ Live prices from official sites_  
_✅ Always updated results_

> 👺 Powered by Asura MD Smart Engine
`;

    try {
        await sock.sendMessage(chat, {
            text: msgText,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD SMART SHOPPING",
                    body: `Find lowest price for ${query}`,
                    thumbnailUrl: "https://files.catbox.moe/qp1ve9.jpg",
                    mediaType: 1,
                    sourceUrl: googleShop,
                    renderLargerThumbnail: false,
                    showAdAttribution: true
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "🛒", key: msg.key } });

    } catch (e) {
        await sock.sendMessage(chat, { text: "❌ Failed to process request." }, { quoted: msg });
    }
};
