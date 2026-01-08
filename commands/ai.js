import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(from, { text: "❌ Please provide a question!\nExample: .ai who is Cristiano Ronaldo?" });
    }

    let thinkingMsg;
    try {
        // 1. റിയാക്ഷൻ (Processing)
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // 2. ആനിമേഷൻ (Thinking...)
        thinkingMsg = await sock.sendMessage(from, { text: "👺 Asura MD is thinking..." });

        let aiResponse = "";

        // --- 3 POWERFUL API LOGIC ---
        try {
            // API 1: Itzpire (High speed)
            const res1 = await axios.get(`https://itzpire.com/ai/gpt-web?q=${encodeURIComponent(text)}`);
            aiResponse = res1.data.data;
        } catch (e) {
            try {
                // API 2: Sandipapi (GPT-4 based)
                const res2 = await axios.get(`https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(text)}`);
                aiResponse = res2.data.answer;
            } catch (e2) {
                // API 3: Guru (Backup)
                const res3 = await axios.get(`https://api.guruapi.tech/ai/gpt4?username=asura&query=${encodeURIComponent(text)}`);
                aiResponse = res3.data.msg;
            }
        }

        if (!aiResponse) throw new Error("No response from any AI");

        const aiMsg = `
${aiResponse}

 ⊙ 𝚀𝚞𝚎𝚛𝚢 : ${text.length > 20 ? text.substring(0, 20) + "..." : text}

> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        try {
            await sock.sendMessage(from, { text: aiMsg, edit: thinkingMsg.key });
        } catch (editError) {
            await sock.sendMessage(from, { text: aiMsg });
        }
        
        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("AI Chat Error:", e);
        const errorText = "❌ All AI servers are busy. Please try again later!";
        if (thinkingMsg) {
            await sock.sendMessage(from, { text: errorText, edit: thinkingMsg.key }).catch(() => sock.sendMessage(from, { text: errorText }));
        }
    }
};
