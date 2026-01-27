export default async (sock, msg) => {
    try {
        const chat = msg.key.remoteJid;
        const quoted = msg.message?.extendedTextMessage?.contextInfo;

        // 1. Check if the message is a reply
        if (!quoted || !quoted.stanzaId) {
            return sock.sendMessage(chat, { text: "❌ Please reply to the message you want to delete." }, { quoted: msg });
        }

        // 2. Powerful delete execution
        await sock.sendMessage(chat, {
            delete: {
                remoteJid: chat,
                fromMe: quoted.participant === sock.user.id.split(':')[0] + "@s.whatsapp.net", // Checks if the message was from the bot itself
                id: quoted.stanzaId,
                participant: quoted.participant // The original sender of the message
            }
        });

    } catch (error) {
        console.error("Delete Command Error:", error);
        await sock.sendMessage(msg.key.remoteJid, { text: "⚠️ *Error:* Make sure the bot is an Admin to delete others' messages." });
    }
};
