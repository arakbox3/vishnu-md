import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default {
    name: 'convert',
    async execute(m, { client, args }) {
        try {
            // മറുപടി നൽകിയ മെസ്സേജ് ഉണ്ടോ എന്ന് നോക്കുന്നു
            const quoted = m.quoted ? m.quoted : m;
            const type = Object.keys(quoted.msg || quoted)[0];
            const mime = (quoted.msg || quoted).mimetype || '';

            if (!mime) return m.reply("❌ ഏതെങ്കിലും മീഡിയ ഫയലിന് (Image, Video, Audio, Sticker, PDF) reply അടിക്കൂ.");

            m.reply("🔄 *Asura MD: Converting File...*");

            // --- ബാഹ്യ ഡൗൺലോഡ് ഇല്ലാതെ ബഫർ എടുക്കുന്ന രീതി ---
            const messageType = mime.split('/')[0].replace('application', 'document');
            const stream = await downloadContentFromMessage(quoted.msg || quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            // ---------------------------------------------

            // 1. ഫോട്ടോ അല്ലെങ്കിൽ സ്റ്റിക്കർ -> PDF ആക്കാൻ (.convert pdf)
            if (args[0] === 'pdf') {
                return await client.sendMessage(m.chat, { 
                    document: buffer, 
                    mimetype: 'application/pdf', 
                    fileName: `Asura-Intel-${Date.now()}.pdf` 
                }, { quoted: m });
            }

            // 2. ഇമേജ് -> സ്റ്റിക്കർ
            if (/image/.test(mime)) {
                return await client.sendMessage(m.chat, { sticker: buffer }, { quoted: m });
            }

            // 3. വീഡിയോ -> GIF അല്ലെങ്കിൽ വോയ്‌സ്
            else if (/video/.test(mime)) {
                if (args[0] === 'gif' || mime.includes('gif')) {
                    return await client.sendMessage(m.chat, { video: buffer, gifPlayback: true }, { quoted: m });
                }
                return await client.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg', ptt: args[0] === 'voice' }, { quoted: m });
            }

            // 4. സ്റ്റിക്കർ -> ഇമേജ്
            else if (/sticker/.test(mime)) {
                return await client.sendMessage(m.chat, { image: buffer, caption: "✅ Converted by Asura-MD" }, { quoted: m });
            }

            // 5. ഓഡിയോ -> വോയ്‌സ് (PTT)
            else if (/audio/.test(mime)) {
                return await client.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg', ptt: true }, { quoted: m });
            }

            // 6. ഡോക്യുമെന്റ് / PDF -> ഇമേജ് (ഇത് ചില ഫോണുകളിൽ സപ്പോർട്ട് ചെയ്യും)
            else if (/document|pdf/.test(mime)) {
                return await client.sendMessage(m.chat, { document: buffer, mimetype: mime, fileName: `Asura-File.pdf` }, { quoted: m });
            }

            else {
                m.reply("⚠️ Unsupported.");
            }

        } catch (error) {
            console.error(error);
            m.reply("❌ Error:");
        }
    }
};
