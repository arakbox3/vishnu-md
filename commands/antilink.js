/**
 * 𓆩 👺ASURA MD 𓆪 - ANTI-LINK ENGINE
 * NO MAIN FILE CHANGES. NO COMMANDS NEEDED.
 * Just place this in your plugins/commands folder.
 */

const linkRegex = /((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?)|(wa\.me\/[0-9]+)|(chat\.whatsapp\.com\/[a-zA-Z0-9]+)|(t\.me\/[a-zA-Z0-9_]+)/gi;

export default async (sock, msg, args) => {
    // ആദ്യത്തെ തവണ കമാൻഡ് റൺ ചെയ്യുമ്പോൾ ഒരു കൺഫർമേഷൻ നൽകാൻ മാത്രം
    const chat = msg.key.remoteJid;
    if (!global.antilinkActive) {
        setupAntilink(sock);
        return await sock.sendMessage(chat, { text: "🛡️ *𓆩 👺ASURA MD 𓆪 Antilink Engine Initialized!*" });
    }
};

// 🛡️ ഈ ഫംഗ്ഷൻ ബാക്ക്ഗ്രൗണ്ടിൽ എല്ലാ മെസ്സേജും നിരീക്ഷിക്കും
function setupAntilink(sock) {
    if (global.antilinkActive) return;
    global.antilinkActive = true;

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe || !m.key.remoteJid.endsWith('@g.us')) return;

            const chat = m.key.remoteJid;
            const text = (m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "").toLowerCase();

            // ലിങ്ക് ഉണ്ടോ എന്ന് നോക്കുന്നു
            if (linkRegex.test(text)) {
                const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                const sender = m.key.participant || m.key.remoteJid;

                const groupMetadata = await sock.groupMetadata(chat);
                const botAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
                const senderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;

                // ബോട്ട് അഡ്മിൻ ആണെങ്കിൽ മാത്രം ഡിലീറ്റ് ചെയ്യും
                if (botAdmin && !senderAdmin) {
                    await sock.sendMessage(chat, { 
                        delete: { 
                            remoteJid: chat, 
                            fromMe: false, 
                            id: m.key.id, 
                            participant: sender 
                        } 
                    });
                }
            }
        } catch (e) {
            // സൈലന്റ് എറർ ഹാൻഡ്‌ലിംഗ്
        }
    });
}
