import fs from 'fs';

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};

export const handleEvents = async (sock) => {

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const chat = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = chat.endsWith('@g.us');
        const db = getDB();
        
        // Global and Group settings
        const settings = db[chat] || {};
        const globalSettings = db['global'] || {};

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // --- 1. ANTILINK ---
        if (isGroup && settings.antilink && body.includes('chat.whatsapp.com')) {
            const metadata = await sock.groupMetadata(chat);
            const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
            if (!isAdmin) {
                await sock.sendMessage(chat, { delete: msg.key });
                await sock.groupParticipantsUpdate(chat, [sender], "remove");
            }
        }

        // --- 2. ANTI-SPAM (Simple) ---
        if (isGroup && settings.antispam && body.length > 500) {
             await sock.sendMessage(chat, { delete: msg.key });
             await sock.sendMessage(chat, { text: "🚫 *Spam Detected and Removed!*" });
        }

        // --- 3. CHATBOT (Simple Reply) ---
        if (settings.chatbot && !body.startsWith('.')) {
            // ലളിതമായ ഒരു മറുപടി, വേണമെങ്കിൽ ഇതിൽ AI ചേർക്കാം
            if (body.toLowerCase().includes('hello')) {
                await sock.sendMessage(chat, { text: "Hello! I am Asura MD. How can I help you? 👺" }, { quoted: msg });
            }
        }
    });

    // --- 4. WELCOME & ANTI-FOREIGN NUMBER ---
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const db = getDB();
        const settings = db[id] || {};

        if (action === 'add') {
            for (let num of participants) {
                // ANTI-FOREIGN (Non +91 check)
                if (settings.antiforeign && !num.startsWith('91')) {
                    await sock.sendMessage(id, { text: "🚫 *Foreign numbers are not allowed!* Kick target..." });
                    await sock.groupParticipantsUpdate(id, [num], "remove");
                    continue;
                }

                // WELCOME
                if (settings.welcome) {
                    const metadata = await sock.groupMetadata(id);
                    await sock.sendMessage(id, { 
                        text: `Hello @${num.split('@')[0]} 👋\nWelcome to *${metadata.subject}*! 👺`, 
                        mentions: [num] 
                    });
                }
            }
        }
    });

    // --- 5. ANTI-CALL ---
    sock.ev.on('call', async (call) => {
        const db = getDB();
        if (db['global']?.anticall) {
            const caller = call[0].from;
            await sock.sendMessage(caller, { text: "⚠️ *Calls are blocked by Asura MD.* You will be blocked." });
            await sock.updateBlockStatus(caller, "block");
        }
    });

    // --- 6. ANTIDELETE LOGIC ---
    // (Note: Requires a message store to show deleted content, 
    // here we just log or notify for simplicity)
    sock.ev.on('messages.delete', async (item) => {
        const db = getDB();
        if (db[item.remoteJid]?.antidelete) {
            await sock.sendMessage(item.remoteJid, { text: "🕵️‍♂️ *Asura MD detected a deleted message!*" });
        }
    });
};
