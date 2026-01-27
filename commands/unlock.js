export default async (sock, msg, args) => {
    const chatID = msg.key.remoteJid;

    try {
        // 1. ഗ്രൂപ്പ് ആണോ എന്ന് പരിശോധിക്കുന്നു
        if (!chatID.endsWith('@g.us')) {
            return sock.sendMessage(chatID, { text: "❌ This command can only be used in groups." });
        }

        // 2. ബോട്ട് അഡ്മിൻ ആണോ എന്ന് പരിശോധിക്കുന്നു
        const groupMetadata = await sock.groupMetadata(chatID);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;

        if (!isBotAdmin) {
            return sock.sendMessage(chatID, { text: "🛡️ *Action Denied:* I need to be an **Admin** to unlock the group." });
        }

        // 3. ഗ്രൂപ്പ് അൺലോക്ക് ചെയ്യുന്നു (Setting to 'not_announcement')
        await sock.groupSettingUpdate(chatID, 'not_announcement');

        // 4. പ്രൊഫഷണൽ സക്സസ് മെസ്സേജ്
        const successMessage = {
            text: `🔓 *Group Unlocked*\n\nAll participants are now allowed to send messages in this group.`,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD SECURITY",
                    body: "Group Privacy Updated",
                    thumbnailUrl: "https://telegra.ph/file/your-image-link.jpg", // നിങ്ങളുടെ തമ്പ്നെയിൽ ലിങ്ക് ഇവിടെ നൽകാം
                    sourceUrl: ""
                }
            }
        };

        await sock.sendMessage(chatID, successMessage, { quoted: msg });

    } catch (error) {
        console.error("Unlock Error:", error);
        await sock.sendMessage(chatID, { text: "⚠️ *System Error:* Failed to unlock the group. Please try again later." });
    }
};
