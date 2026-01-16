export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0].split(':')[0];
    const isOwner = sock.user.id.includes(sender);

    // 1. കമാൻഡുകൾ ചെക്ക് ചെയ്യുന്നു (Only for Bot Owner)
    const command = args[0] ? args[0].toLowerCase() : "";

    // 🛠️ ആക്റ്റിവേഷൻ ലോജിക്
    if (msg.body === '.antilinkon') {
        if (!isOwner) return;
        global.antilinkStatus = true;
        
        // ലിസണർ ഓൾറെഡി ഇല്ലെങ്കിൽ മാത്രം ക്രിയേറ്റ് ചെയ്യുന്നു
        if (!global.antilinkListenerActive) {
            global.antilinkListenerActive = true;
            
            sock.ev.on('messages.upsert', async (chatUpdate) => {
                if (!global.antilinkStatus) return; // ഓഫ് ആണെങ്കിൽ ഒന്നും ചെയ്യില്ല

                try {
                    const m = chatUpdate.messages[0];
                    if (!m.message || m.key.fromMe || !m.key.remoteJid.endsWith('@g.us')) return;

                    const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
                    const containsLink = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+|t\.me\/[^\s]+)/gi.test(text);

                    if (containsLink) {
                        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
                        const participants = groupMetadata.participants;
                        
                        // ബോട്ട് അഡ്മിൻ ആണോ?
                        const botAdmin = participants.find(p => p.id === botId)?.admin;
                        if (!botAdmin) return;

                        // അയച്ച ആൾ അഡ്മിൻ ആണോ?
                        const senderJid = m.key.participant || m.key.remoteJid;
                        const isSenderAdmin = participants.find(p => p.id === senderJid)?.admin;

                        if (!isSenderAdmin) {
                            // 🗑️ എല്ലാവർക്കും വേണ്ടി ഡിലീറ്റ് ചെയ്യുന്നു
                            await sock.sendMessage(m.key.remoteJid, { 
                                delete: { 
                                    remoteJid: m.key.remoteJid, 
                                    fromMe: false, 
                                    id: m.key.id, 
                                    participant: senderJid 
                                } 
                            });

                            await sock.sendMessage(m.key.remoteJid, { 
                                text: `🚫 Only Admins`,
                                mentions: [senderJid]
                            });
                        }
                    }
                } catch (e) { console.log(e) }
            });
        }
        return await sock.sendMessage(chat, { text: "🛡️ *Antilink Activated for all groups!* (𓆩 👺ASURA MD 𓆪)" });
    }

    // 🛠️ ഡീആക്റ്റിവേഷൻ ലോജിക്
    if (msg.body === '.antilinkoff') {
        if (!isOwner) return;
        global.antilinkStatus = false;
        return await sock.sendMessage(chat, { text: "⚪ *Antilink Deactivated for all groups.*" });
    }
};
