export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const sender = msg.key.participant || msg.key.remoteJid;

    // 🛡️ OWNER CHECK: ബോട്ട് സെറ്റ് ചെയ്ത ആൾക്ക് (Owner) മാത്രമേ ഇത് മാറ്റാൻ കഴിയൂ
    const isOwner = sender.includes(sock.user.id.split(':')[0]);
    
    if (!global.autoResponseMap) global.autoResponseMap = {};

    // 1. DELETE ALL REPLIES
    if (args[0] === 'delall') {
        if (!isOwner) return await sock.sendMessage(chat, { text: "❌ *Access Denied:* Only the Bot Owner can use this." });
        global.autoResponseMap = {};
        return await sock.sendMessage(chat, { text: "🗑️ *All saved replies cleared from 𓆩 👺ASURA MD 𓆪 memory.*" });
    }

    // 2. DELETE SPECIFIC REPLY
    if (args[0] === 'del') {
        if (!isOwner) return await sock.sendMessage(chat, { text: "❌ *Access Denied!*" });
        const triggerToDelete = args.slice(1).join(" ").toLowerCase().trim();
        if (global.autoResponseMap[triggerToDelete]) {
            delete global.autoResponseMap[triggerToDelete];
            return await sock.sendMessage(chat, { text: `✅ Deleted: *"${triggerToDelete}"*` });
        } else {
            return await sock.sendMessage(chat, { text: "❌ Trigger not found." });
        }
    }

    // 3. SETTING A NEW REPLY (By Swiping/Replying)
    if (args.length > 0 && args[0] !== 'del' && args[0] !== 'delall') {
        if (!isOwner) return await sock.sendMessage(chat, { text: "❌ Only the Bot Owner can set new replies." });
        
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) return await sock.sendMessage(chat, { text: "⚠️ *How to use:* Reply/Swipe to a message and type `.reply [Response]`" });

        const trigger = (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "").toLowerCase().trim();
        const response = args.join(" ");

        if (!trigger) return await sock.sendMessage(chat, { text: "❌ Error: Only text triggers allowed." });

        global.autoResponseMap[trigger] = response;
        return await sock.sendMessage(chat, { 
            text: `✅ *New Reply Set!*\n\n*Trigger:* ${trigger}\n*Response:* ${response}\n\n*By:* 𓆩 👺ASURA MD 𓆪` 
        });
    }

    // 4. BACKGROUND LISTENER (Ensuring it runs properly)
    if (!global.replyHandlerInitialized) {
        global.replyHandlerInitialized = true;
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;
            
            const incomingText = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase().trim();
            
            if (global.autoResponseMap && global.autoResponseMap[incomingText]) {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: global.autoResponseMap[incomingText] 
                }, { quoted: m });
            }
        });
    }

    // 5. HELP MENU & STATUS
    if (args.length === 0) {
        let list = Object.keys(global.autoResponseMap);
        let status = list.length > 0 ? `📝 *Current Triggers:* \n${list.join(", ")}` : "No replies set.";
        
        const menu = `
╭━━━〔 𓆩 👺ASURA MD 𓆪 〕━━━┈⊷
┃
┃ 🤖 *AUTO-REPLY MANAGER*
┃
┃ ⊙ *To Set:* Swipe a message + \`.reply [text]\`
┃ ⊙ *To Delete:* \`.reply del [word]\`
┃ ⊙ *To Clear All:* \`.reply delall\`
┃
┃ ${status}
┃
╰━━━━━━━━━━━━━━━━━┈⊷`;

        await sock.sendMessage(chat, { text: menu });
    }
};
