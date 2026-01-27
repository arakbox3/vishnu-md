export default async (sock, msg, args) => {
    try {
        const chat = msg.key.remoteJid;
        const isGroup = chat.endsWith('@g.us');
        
        // ഗ്രൂപ്പിലാണോ എന്ന് ഉറപ്പാക്കുന്നു
        if (!isGroup) return;

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        
        // 1. ടാർഗെറ്റ് യൂസറെ കണ്ടുപിടിക്കുന്നു (Reply or Mention)
        let user = quoted?.participant || quoted?.mentionedJid?.[0];

        // 2. യൂസറെ കണ്ടെത്തിയില്ലെങ്കിൽ അറിയിപ്പ് നൽകുന്നു
        if (!user) {
            return sock.sendMessage(chat, { 
                text: "❌ *Please reply to a message or tag an admin to demote.*" 
            }, { quoted: msg });
        }

        // 3. Demote Action
        await sock.groupParticipantsUpdate(chat, [user], "demote");

        // 4. Success Message with Tag
        await sock.sendMessage(chat, { 
            text: `✅ @${user.split('@')[0]} has been demoted from Admin.`,
            mentions: [user]
        }, { quoted: msg });

    } catch (err) {
        console.error("Demote Error:", err);
        
        // അഡ്മിൻ പവർ ഇല്ലെങ്കിൽ അറിയിപ്പ് നൽകുന്നു
        await sock.sendMessage(msg.key.remoteJid, { 
            text: "❌ *Action Failed:* Make sure the bot is an Admin and the user is an Admin." 
        });
    }
};
