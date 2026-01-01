const fs = require('fs');

module.exports = {
    name: 'alive',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const imagePath = './media/thumb.jpg'; // ചിത്രത്തിന്റെ പാത്ത്

        const aliveMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *\`👺Asura MD\`* 」
*╰─────────────────❂*
*Hello! I'm Asura MD, your fastest Assistant - alive and sparkling now! ✨*

╔━━━━━━━━━━━━━❥❥❥
┃ *⊙👀status:- online 🤩*
┃ *⊙📳mode:-  public ✅*
╠━━━━━━━━━━━━━❥❥❥
┃ *⊙🫀health:-  💯%*
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // ചിത്രം ഉണ്ടെങ്കിൽ അത് സഹിതം അയക്കും, ഇല്ലെങ്കിൽ വെറും ടെക്സ്റ്റ് മാത്രം അയക്കും
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: aliveMsg 
            });
        } else {
            await sock.sendMessage(from, { text: aliveMsg });
        }
    }
};
