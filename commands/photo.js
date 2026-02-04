import axios from "axios";

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.sender;
    const prompt = args.join(" ");

    if (!prompt) {
        return await sock.sendMessage(from, { 
            text: "🔍 *ASURA-MD AI*\n\nPlease provide a description to generate an image.\n\n*Example:* `.photo a samurai in cyberpunk city`" 
        }, { quoted: msg });
    }

    try {
        // 1. Processing Reaction
        await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

        // 2. Professional Generation (No Download Mode)
        // We use a high-quality reliable API endpoint
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&model=flux`;

        // 3. Get Image as Buffer directly in memory
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'utf-8');

        // 4. Send Message with Professional UI
        await sock.sendMessage(from, {
            image: buffer,
            caption: `*🎨 ASURA-MD ART GENERATOR*\n\n✨ *Prompt:* ${prompt}\n👤 *Requested by:* @${sender.split('@')[0]}\n\n> © ASURA-MD INTELLIGENCE`,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "AI IMAGE ENGINE V3",
                    body: "Generated successfully",
                    mediaType: 1,
                    thumbnail: buffer, // Shows the generated image as a small preview too
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            }
        }, { quoted: msg });

        // 5. Success Reaction
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("AI Photo Error:", e);
        await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
        await sock.sendMessage(from, { text: "⚠️ *Error:* Failed to generate image. Please try again later." }, { quoted: msg });
    }
};
