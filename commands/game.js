import fs from 'fs';

export default async (sock, msg, query) => {
    const from = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg'; 

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🎲", key: msg.key } });

        // 2. റാൻഡം നമ്പർ ജനറേറ്റ് ചെയ്യുന്നു (1 to 6)
        const result = Math.floor(Math.random() * 6) + 1;

        let diceEmoji = '';
        switch (result) {
            case 1: diceEmoji = '⚀'; break;
            case 2: diceEmoji = '⚁'; break;
            case 3: diceEmoji = '⚂'; break;
            case 4: diceEmoji = '⚃'; break;
            case 5: diceEmoji = '⚄'; break;
            case 6: diceEmoji = '⚅'; break;
            default: diceEmoji = '🎲';
        }

        // 3. ഡിസ്‌പ്ലേ ടെക്സ്റ്റ് (ഇവിടെയാണ് നേരത്തെ തെറ്റ് പറ്റിയത്)
        const gameMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃  🎲 *DICE ROLL RESULT*
╠━━━━━━━━━━━━━❥❥❥
┃  *You rolled:* ${result} ${diceEmoji}
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 4. ഇമേജ് സഹിതം റിസൾട്ട് അയക്കുന്നു
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: gameMsg 
            });
        } else {
            await sock.sendMessage(from, { text: gameMsg });
        }

        // 5. സക്സസ് റിയാക്ഷൻ
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error('Game command error:', error);
        await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
    }
};
