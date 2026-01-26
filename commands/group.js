import fs from 'fs';

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    
    // മെസ്സേജ് ബോഡിയിൽ നിന്ന് കമാൻഡ് തിരിച്ചറിയുന്നു (.kick, .add etc)
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const command = body.slice(1).trim().split(/ +/)[0].toLowerCase();

    // --- 1. Help Menu Design (Same as you requested) ---
    if (command === 'help' || !command) {
        const helpText = `
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ULTIMATE GROUP MASTER*
┃
┃🔹➕ .add [number]
┃🔹🦶 .kick [tag/reply]
┃🔹🤴 .promot [tag]
┃🔹👸 .demote [tag]
┃🔹🔖 .tagall [message]
┃🔹🔐 .lock
┃🔹🔓 .unlock
┃🔹❌ .delete [reply]
┃🔹⏰ .schedule [min] [text]
┃
┃✨ *SECURITY (Logic in Handlers)*
┃🔹🙏 .welcome on/off
┃🔹🔗 .antilink on/off
┃🔹🦠 .antispam on/off
┃🔹🌏 .antiforeign on/off
┃💡 .Help
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥`;
        
        return sock.sendMessage(chat, { text: helpText }, { quoted: msg });
    }

    try {
        const db = getDB();
        const value = args[0]?.toLowerCase();
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        
        // Target User (Reply, Tag, or Number)
        let user = quoted?.participant || quoted?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        switch (command) {
            // --- SECURITY CONTROLS (Settings for handlers.js) ---
            case 'welcome':
            case 'antilink':
            case 'antispam':
            case 'antiforeign':
                if (!db[chat]) db[chat] = {};
                db[chat][command] = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `✅ *${command.toUpperCase()}* is now *${value.toUpperCase()}*` });

            // --- GROUP ACTIONS ---
            case 'add':
                if (!user) return;
                await sock.groupParticipantsUpdate(chat, [user], "add");
                break;

            case 'kick':
                if (!user) return;
                await sock.groupParticipantsUpdate(chat, [user], "remove");
                break;

            case 'promot':
                if (!user) return;
                await sock.groupParticipantsUpdate(chat, [user], "promote");
                break;

            case 'demote':
                if (!user) return;
                await sock.groupParticipantsUpdate(chat, [user], "demote");
                break;

            case 'tagall':
                const metadata = await sock.groupMetadata(chat);
                const participants = metadata.participants.map(p => p.id);
                let tagMsg = `📢 *Tagall:* ${args.join(' ') || 'Attention!'}\n\n`;
                for (let mem of participants) {
                    tagMsg += `┣ @${mem.split('@')[0]}\n`;
                }
                return sock.sendMessage(chat, { text: tagMsg, mentions: participants });

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                break;

            case 'delete':
                if (quoted) {
                    await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                }
                break;

            case 'schedule':
                const time = parseInt(args[0]);
                const sMsg = args.slice(1).join(' ');
                if (isNaN(time)) return;
                sock.sendMessage(chat, { text: `🕒 Scheduled in ${time} min.` });
                setTimeout(() => {
                    sock.sendMessage(chat, { text: `⏰ *REMINDER:* ${sMsg}` });
                }, time * 60000);
                break;
        }

    } catch (e) {
        console.error("Group Command Error:", e);
    }
};
