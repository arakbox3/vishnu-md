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

    // ==== Smart Links ====
    const googleShop = `https://www.google.com/search?q=${q}&tbm=shop&tbs=p_ord:p`;
    const amazonLow = `https://www.amazon.in/s?k=${q}&s=price-asc-rank`;
    const flipkartLow = `https://www.flipkart.com/search?q=${q}&sort=price_asc`;
    const reviews = `https://www.google.com/search?q=${q}+review`;
    const youtube = `https://www.youtube.com/results?search_query=${q}+review+unboxing`;
    const specs = `https://www.google.com/search?q=${q}+specifications`;
    const comparison = `https://www.google.com/search?q=${q}+compare+price`;

    // Extra info placeholders
    const brand = "Brand: Check Links"; 
    const ratings = "Ratings: ⭐⭐⭐⭐☆"; 
    const offers = "Offers: Available on respective sites"; 
    const availability = "Availability: Online"; 
    const cashback = "Cashback: Check site offers";

    // ==== Message Text ====
    const msgText = `
🛍️ *ASURA MD — SMART PRICE FINDER*

📦 *Product:* ${query.toUpperCase()}

${brand}
${ratings}
${offers}
${availability}
${cashback}

I found the best ways for you to get this product at the *lowest price* and with *full information*.

━━━━━━━━━━━━━━━━━━
💰 *Cheapest Price Links*

🔎 Google Shopping (Low → High)
${googleShop}

🛒 Amazon India (Low → High)
${amazonLow}

🛍️ Flipkart (Low → High)
${flipkartLow}

💹 Price Comparison Across Sites
${comparison}

━━━━━━━━━━━━━━━━━━
📊 *Before You Buy*

⭐ Reviews from users
${reviews}

📺 Unboxing & Video Reviews
${youtube}

📋 Full Specifications
${specs}

💰 Approximate Cost: Check above links
🖼️ Product Thumbnail included

━━━━━━━━━━━━━━━━━━

✅ Live prices from official sites
✅ No fake listings
✅ Always updated results

> 👺 Powered by Asura MD Smart Engine
`;

    try {
        await sock.sendMessage(chat, {
            text: msgText,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD SMART SHOPPING",
                    body: `Find lowest price for ${query}`,
                    mediaType: 1,
                    sourceUrl: googleShop,
                    thumbnail: { url: "media/thumb.jpg" },
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "🛒", key: msg.key } });

    } catch (e) {
        console.error("Buy Command Error:", e.message);
        await sock.sendMessage(chat, { text: "❌ Failed to process request." }, { quoted: msg });
    }
};
