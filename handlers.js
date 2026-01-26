import fs from 'fs';

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};

// Anti-spam ലോജിക്കിനായി മെസ്സേജുകൾ താല്ക്കാലികമായി സേവ് ചെയ്യാൻ
const messageCount = {};

export const handleEvents = async (sock) => {

    // --- 1. മെസ്സേജ് ഇവന്റുകൾ (Antilink, Antispam, Antiforeign scan) ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const isGroup = chat.endsWith('@g.us');
            if (!isGroup) return;
            
            const sender = msg.key.participant || msg.key.remoteJid;
            const db = getDB();
            const settings = db[chat] || {};
            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

            // --- GLOBAL MODE CHECK (Private/Public) ---
            const ownerNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
            const isOwner = sender === ownerNumber || msg.key.remoteJid === ownerNumber;
            const botMode = db.botMode || 'public';
 
            if (botMode === 'private' && !isOwner && body.startsWith('.')) {
                return; 
            }
    
            // --- 1. ALL LINK DELETE (WhatsApp link മാത്രമല്ല, എല്ലാ ലിങ്കും) ---
            const linkPattern = /https?:\/\/\S+|www\.\S+|\b\w+\.(?:com|in|net|org|gov|edu|me|xyz|site|co|biz|info|io|ml|tk)\b/gi;

            if (settings.antilink && linkPattern.test(body)) {
                const metadata = await sock.groupMetadata(chat);
                const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;

                if (!isAdmin) {
                    // മെസ്സേജ് ഡിലീറ്റ് ചെയ്യുന്നു
                    await sock.sendMessage(chat, { delete: msg.key });
            
                    // ഗ്രൂപ്പിൽ നിന്ന് നീക്കം ചെയ്യുന്നു
                    await sock.groupParticipantsUpdate(chat, [sender], "remove");
            
                    // അറിയിപ്പ് നൽകുന്നു
                    await sock.sendMessage(chat, { text: "🚫 *Links are strictly prohibited!* User has been removed." });
                    return;
                }
            }

            // --- ANTI-SPAM (തുടർച്ചയായി 3 ഒരേ മെസ്സേജ് വന്നാൽ) ---
            if (settings.antispam) {
                if (!messageCount[sender]) messageCount[sender] = { count: 1, lastMsg: body };
                if (messageCount[sender].lastMsg === body) {
                    messageCount[sender].count++;
                } else {
                    messageCount[sender].count = 1;
                    messageCount[sender].lastMsg = body;
                }

                if (messageCount[sender].count > 3) {
                    await sock.sendMessage(chat, { delete: msg.key });
                    return;
                }
            }

            // --- ANTIFOREIGN (Manual Scan Command) ---
            if (body === '.antiforeign on') {
                const metadata = await sock.groupMetadata(chat);
                const foreigns = metadata.participants.filter(p => !p.id.startsWith('91') && !p.admin).map(p => p.id);
                if (foreigns.length > 0) {
                    await sock.sendMessage(chat, { text: `🛡️ Removing ${foreigns.length} foreign numbers...` });
                    for (let jid of foreigns) {
                        await sock.groupParticipantsUpdate(chat, [jid], "remove");
                    }
                }
            }

        } catch (e) {
            console.error("Handler Error:", e);
        }
    });

    // --- 2. പാർട്ടിസിപ്പന്റ് അപ്‌ഡേറ്റുകൾ (Welcome & Antiforeign Join Check) ---
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            const db = getDB();
            const settings = db[id] || {};

            if (action === 'add') {
                for (let num of participants) {
                    // Anti-foreign (പുതിയതായി വരുന്നവരെ തടയുന്നു)
                    if (settings.antiforeign && !num.startsWith('91')) {
                        await sock.groupParticipantsUpdate(id, [num], "remove");
                        continue;
                    }

                    // Welcome Message
                    if (settings.welcome) {
                        const metadata = await sock.groupMetadata(id);
                        await sock.sendMessage(id, { 
                            text: `👋🏻 Hey @${num.split('@')[0]} Welcome to *${metadata.subject}* Group 😍🎉`, 
                            mentions: [num] 
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Participant Update Error:", e);
        }
    });
};
