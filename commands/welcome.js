import fs from 'fs';

export default async (sock) => {
    // ഗ്രൂപ്പിൽ മാറ്റങ്ങൾ വരുമ്പോൾ ഇത് പ്രവർത്തിക്കും
    sock.ev.on('group-participants.update', async (anu) => {
        try {
            // ആരെങ്കിലും ഗ്രൂപ്പിൽ ജോയിൻ ചെയ്താൽ മാത്രം (Action: add)
            if (anu.action === 'add') {
                const chat = anu.id;
                const metadata = await sock.groupMetadata(chat);
                const thumbPath = "./media/thumb.jpg";

                for (let jid of anu.participants) {
                    // പുതിയ മെമ്പറുടെ പേരും ഗ്രൂപ്പ് വിവരങ്ങളും
                    const userName = jid.split('@')[0];
                    const groupName = metadata.subject;
                    const groupDesc = metadata.desc || "Welcome to our group!";

                    const welcomeText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 👺 *Welcome to Group*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *New Member!* ❳•°•
 ⊙👤 *USER:* @${userName}
 ⊙🏰 *GROUP:* ${groupName}
╰╌╌╌╌╌╌╌╌╌╌࿐
> *📜 DESCRIPTION:*
${groupDesc}

> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

                    // വെൽക്കം മെസ്സേജ് അയക്കുന്നു
                    await sock.sendMessage(chat, {
                        image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://i.imgur.com/your-image.jpg' },
                        caption: welcomeText,
                        mentions: [jid]
                    });
                }
            }
        } catch (err) {
            console.log('Welcome Error: ', err);
        }
    });
};
