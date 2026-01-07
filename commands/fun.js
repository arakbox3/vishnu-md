import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // 2. ആനിമേഷൻ (എണ്ണം കുറച്ചു, സമയം കൂട്ടി)
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

        const frames = [
            "▰▱▱▱▱▱▱▱▱▱ 10%",
            "▰▰▰▰▱▱▱▱▱▱ 40%",
            "▰▰▰▰▰▰▰▱▱▱ 70%",
            "▰▰▰▰▰▰▰▰▰▰ 100%",
            "🚀 Asura MD Engine Ready!",
            "🤣 Processing Fun Mode...",
            "✅ Sending Files Now!"
        ];

        for (let frame of frames) {
            // ബാൻ ഒഴിവാക്കാൻ സമയം 1.2 സെക്കൻഡ് ആക്കി
            await new Promise(resolve => setTimeout(resolve, 1200)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        // 3. ഫൈനൽ ഡിസൈൻ ക്യാപ്ഷൻ
        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Asura Fun Service*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭•°•❲ *Process Completed* ❳•°•
 ⊙🎬 *STATUS:* SUCCESS ✅
 ⊙📺 *SERVICE:* FUN MOD
 ⊙⏳ *SPEED:* 1.2ms
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ 👺 Asura Fun Mode Activated!
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        const imagePath = './media/thumb.jpg';
        const songPath = './media/song.opus';

        // 4. ഇമേജ് അയക്കുന്നു (പഴയ ആനിമേഷൻ മെസ്സേജ് ഡിലീറ്റ് ചെയ്യണം എന്നുണ്ടെങ്കിൽ ഡിലീറ്റ് കമാൻഡ് ചേർക്കാം)
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: { url: imagePath }, 
                caption: infoText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: infoText }, { quoted: msg });
        }

        // 5. ഓഡിയോ ഫയൽ
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        }

        // ഫൈനൽ റിയാക്ഷൻ
        await sock.sendMessage(chat, { react: { text: "🤣", key: msg.key } });

    } catch (error) {
        console.error("Fun Command Error:", error);
    }
};
