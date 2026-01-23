export default {
    name: 'convert',
    async execute(m, { client, args }) {
        // റിപ്ലൈ മെസ്സേജ് ഉണ്ടോ എന്ന് നോക്കുന്നു, ഇല്ലെങ്കിൽ ആ മെസ്സേജ് തന്നെ എടുക്കുന്നു
        const quoted = m.quoted ? m.quoted : m;
        
        // മീഡിയയുടെ തരം (MIME type) കണ്ടെത്തുന്നു
        const mime = (quoted.msg || quoted).mimetype || '';

        if (!mime) {
            return m.reply(".convert ");
        }

        try {
            // ഫയൽ ഡൗൺലോഡ് ചെയ്യാതെ മെമ്മറി ബഫറിലേക്ക് മാറ്റുന്നു
            const mediaBuffer = await quoted.download();

            // 1. IMAGE -> STICKER
            if (/image/.test(mime)) {
                return await client.sendMessage(m.chat, { 
                    sticker: mediaBuffer 
                }, { quoted: m });
            } 
            
            // 2. VIDEO -> AUDIO / GIF / VOICE
            else if (/video/.test(mime)) {
                if (args[0] === 'gif') {
                    return await client.sendMessage(m.chat, { 
                        video: mediaBuffer, 
                        gifPlayback: true 
                    }, { quoted: m });
                }
                const isVoice = args[0] === 'voice';
                return await client.sendMessage(m.chat, { 
                    audio: mediaBuffer, 
                    mimetype: 'audio/ogg', 
                    ptt: isVoice 
                }, { quoted: m });
            } 
            
            // 3. AUDIO -> VOICE (PTT)
            else if (/audio/.test(mime)) {
                return await client.sendMessage(m.chat, { 
                    audio: mediaBuffer, 
                    mimetype: 'audio/ogg', 
                    ptt: true 
                }, { quoted: m });
            } 
            
            // 4. STICKER -> IMAGE
            else if (/sticker/.test(mime)) {
                return await client.sendMessage(m.chat, { 
                    image: mediaBuffer, 
                    caption: "✅ Converted to Image by Asura-MD" 
                }, { quoted: m });
            }

            else {
                m.reply("⚠️ സപ്പോർട്ട് ചെയ്യാത്ത ഫയൽ ഫോർമാറ്റ്!");
            }

        } catch (error) {
            console.error("Conversion Error:", error);
            m.reply("❌ .");
        }
    }
};
