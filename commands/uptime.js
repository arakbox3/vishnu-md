import fs from 'fs';

const runtime = async (sock, msg, args) => {
    const from = msg.key.remoteJid;

    const getUptime = () => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600).toString().padStart(2, '0');
        const mins = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(uptime % 60).toString().padStart(2, '0');
        return `${hours}:${mins}:${secs}`;
    };

    // Animate icons 
    const statusIcons = ["✨ Active", "🟢 Online", "⚙️ Running", "🛡️ Secured"];
    const botIcons = ["👺 Asura MD", "👹 ASURA-BOT", "🤖 ASURA-MD WhatsApp Mini Bot", "💀 ASURA-MD v2.0"];

    const getTemplate = (time, iteration) => {
        const sIcon = statusIcons[iteration % statusIcons.length];
        const bIcon = botIcons[iteration % botIcons.length];
        
        return `
👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────❂*
╭━〔 **ASURA MD** 〕┈⊷
┃ 👤 *Owner:* arun •°cumar
┃ 👺 *Bot:* ${bIcon}
┃ ⏳ *Uptime:* ${time}
┃ ⚙️ *Status:* ${sIcon}
╰━━━━━━━━━━━━┈⊷`.trim();
    };

    try {
        // 1. Reaction 
        await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

        // 2. ആദ്യത്തെ മെസ്സേജ് അയക്കുന്നു
        const initialText = getTemplate(getUptime(), 0);
        let mainMsg = await sock.sendMessage(from, { text: initialText }, { quoted: msg });

        // 3. ആനിമേഷൻ ലൂപ്പ് (മെസ്സേജ് എഡിറ്റ് ചെയ്യുന്നു)
        for (let i = 1; i <= 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500)); 
            
            const newTime = getUptime();
            const updatedText = getTemplate(newTime, i);

            // edit message 
            await sock.sendMessage(from, { 
                text: updatedText, 
                edit: mainMsg.key 
            });
        }

    } catch (e) {
        console.error("Runtime Error:", e);
    }
};

export default runtime;
