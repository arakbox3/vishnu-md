export default async (sock, msg, args) => {
    try {
        const chat = msg.key.remoteJid;
        
        // 1. Group Check: ഗ്രൂപ്പിൽ ആണോ എന്ന് നോക്കുന്നു
        if (!chat.endsWith('@g.us')) return sock.sendMessage(chat, { text: "❌ This command can only be used in groups." });

        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        
        // 2. Identify User: Reply വഴിയോ Tag വഴിയോ യൂസറെ കണ്ടെത്തുന്നു
        let user = quoted?.participant || quoted?.mentionedJid?.[0];

        // 3. Manual Number Check: നമ്പർ നേരിട്ട് നൽകിയാൽ (.kick 919876543210)
        if (!user && args[0]) {
            let num = args[0].replace(/[^0-9]/g, '');
            if (num.length > 8) user = num + '@s.whatsapp.net';
        }

        if (!user) {
            return sock.sendMessage(chat, { text: "❌ *Usage:* Reply to a message, tag a user, or provide a phone number to kick." }, { quoted: msg });
        }

        // 4. Admin Check: ബോട്ടിന് അഡ്മിൻ പവർ ഉണ്ടോ എന്ന് നോക്കുന്നു
        const groupMetadata = await sock.groupMetadata(chat);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;

        if (!isBotAdmin) {
            return sock.sendMessage(chat, { text: "❌ I need *Admin* privileges to perform this action." });
        }

        // 5. Execution: യൂസറെ റിമൂവ് ചെയ്യുന്നു
        await sock.groupParticipantsUpdate(chat, [user], "remove");
        
        // 6. Response: സക്സസ് അറിയിപ്പ്
        await sock.sendMessage(chat, { 
            text: `🦶 *Kicked:* @${user.split('@')[0]}`, 
            mentions: [user] 
        }, { quoted: msg });

    } catch (e) {
        console.error("Kick Error:", e);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ *Error:* Failed to remove the user. They may have already left or I lack permissions." });
    }
};
