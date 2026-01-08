import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(from, { text: "❌ Please provide a prompt!\nExample: .ai a futuristic city" });
    }

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🎨", key: msg.key } });

        // 2. ആനിമേഷൻ മെസ്സേജ്
        const { key } = await sock.sendMessage(from, { text: "👺 Asura AI is generating Text & Image..." });

        // 3. AI Text & Image ഒന്നിച്ചു Fetch ചെയ്യുന്നു (Promise.all വഴി സ്പീഡ് കൂട്ടാം)
        const [textRes, imgRes] = await Promise.all([
            axios.get(`https://api.hercai.onrender.com/v3/hercai?question=${encodeURIComponent(text)}`),
            axios.get(`https://api.hercai.onrender.com/v3/hercai-is?question=${encodeURIComponent(text)}`)
        ]);

        const aiReply = textRes.data.reply;
        const aiImage = imgRes.data.url; // API നൽകുന്ന ഇമേജ് ലിങ്ക്

        const caption = `
${aiReply}

 ⊙ 𝚀𝚞𝚎𝚛𝚢 : ${text}
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 4. ആദ്യം ടെക്സ്റ്റ് മെസ്സേജ് എഡിറ്റ് ചെയ്ത് മാറ്റുന്നു (അല്ലെങ്കിൽ ഡിലീറ്റ് ചെയ്യാം)
        await sock.sendMessage(from, { delete: key });

        // 5. ഫൈനൽ ഔട്ട്‌പുട്ട്: ഇമേജും അതിന്റെ കൂടെ ടെക്സ്റ്റ് ക്യാപ്‌ഷനും
        await sock.sendMessage(from, { 
            image: { url: aiImage }, 
            caption: caption 
        }, { quoted: msg });

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("Asura AI Error:", e);
        await sock.sendMessage(from, { text: "❌ Sorry, I couldn't generate that." });
    }
};
