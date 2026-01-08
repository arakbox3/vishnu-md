import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(from, { text: "❌ Please provide a question!\nExample: .ai who is Cristiano Ronaldo?" });
    }

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // 2. ആനിമേഷൻ (Thinking...)
        const { key } = await sock.sendMessage(from, { text: "👺 Asura MD AI is thinking..." });
        
        // 3. AI API (Blackbox AI - Free & Powerful)
        const response = await axios.post('https://www.blackbox.ai/api/chat', {
            messages: [{ role: "user", content: text }],
            id: "asura_md_chat",
            previewToken: null,
            userId: null,
            codeModelMode: true,
            agentMode: {},
            trendingAgentMode: {},
            isMicMode: false,
            isFullText: true
        });

        const aiResponse = response.data;

        const aiMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴀꜱᴜʀᴀ ᴍᴅ ꜱᴍᴀʀᴛ ᴀɪ*
*✧* 「 \`👺Asura MD\` 」
*╰──────────❂*

${aiResponse}

╭╌❲ *👺Asura MD Intelligence* ❳
╎ ⊙ 𝚀𝚞𝚎𝚛𝚢 : ${text.length > 20 ? text.substring(0, 20) + "..." : text}
╎ ⊙ 𝙼𝚘𝚍𝚎𝚕 : GPT-4 / Blackbox
╰╌╌╌╌╌╌╌╌╌╌࿐
╠━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━⛥❖⛥━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 4. ഫൈനൽ മെസ്സേജ് എഡിറ്റ് ചെയ്ത് അയക്കുന്നു
        await sock.sendMessage(from, { text: aiMsg, edit: key });
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("AI Chat Error:", e);
        await sock.sendMessage(from, { text: "❌ error !" });
    }
};
