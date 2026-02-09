import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

// നിങ്ങളുടെ വിവരങ്ങൾ ഇവിടെ നൽകുക
const apiId = 12938494; 
const apiHash = "bdbdfa189d74ffd44b5be4bed1a26247";
const botToken = "7599052852:AAEMW-41BN1j3FwjkTN7bUkTTcliGAt5z8A";
const channelId = "-1001891724070";

const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
let isStarted = false;
let audioCache = new Map();

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const text = (msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();

    try {
        // ബോട്ട് ലോഗിൻ സെക്ഷൻ
        if (!isStarted) {
            await client.start({ botAuthToken: botToken });
            isStarted = true;
            console.log("✅ Telegram Bot Connected!");
        }

        // ഓഡിയോ ലിസ്റ്റ് കാണിക്കാനുള്ള കമാൻഡ്
        if (text === '.audio' || text === '.music') {
            await sock.sendMessage(from, { text: "🔍 *Fetching from Asura DB...*" });

            // ബോട്ടുകൾക്ക് Search പകരമായി getMessages ആണ് സുരക്ഷിതം
            const result = await client.getMessages(channelId, {
                filter: new Api.InputMessagesFilterMusic(),
                limit: 40 // എത്ര പാട്ടുകൾ വേണം എന്നത് ഇവിടെ തീരുമാനിക്കാം
            });

            if (!result || result.length === 0) {
                return sock.sendMessage(from, { text: "❌ *No audio found! Check if bot is admin in channel.*" });
            }

            // ലിസ്റ്റ് മിക്സ് ചെയ്യാൻ (Shuffle)
            const shuffled = [...result].sort(() => 0.5 - Math.random()).slice(0, 15);
            audioCache.set(sender, shuffled);

            let listMsg = `*👺 ASURA MD AUDIO DB*\n\n`;
            shuffled.forEach((m, index) => {
                const attr = m.media.document.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const title = attr?.title || attr?.fileName || "Unknown Track";
                listMsg += `*${index + 1}* ➠ ${title}\n\n`;
            });

            listMsg += `> *Reply with number to play!*`;
            return await sock.sendMessage(from, { text: listMsg }, { quoted: msg });
        }

        // പ്ലേ ചെയ്യാനുള്ള ലോജിക് (നമ്പർ റിപ്ലൈ ചെയ്താൽ)
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg && quotedMsg.quotedMessage && !isNaN(text)) {
            const quotedText = quotedMsg.quotedMessage.conversation || quotedMsg.quotedMessage.extendedTextMessage?.text || "";
            
            if (quotedText.includes("ASURA MD")) {
                const index = parseInt(text) - 1;
                const userFiles = audioCache.get(sender);

                if (!userFiles || !userFiles[index]) {
                    return sock.sendMessage(from, { text: "⚠️ *Invalid selection. Please try again!*" });
                }

                const selected = userFiles[index];
                await sock.sendMessage(from, { text: `⚡ *Downloading audio... Please wait.*` }, { quoted: msg });

                // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
                const buffer = await client.downloadMedia(selected.media, { 
                    workers: 4 
                });

                const attr = selected.media.document.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const fileName = attr?.title ? `${attr.title}.mp3` : "Asura_Audio.mp3";

                await sock.sendMessage(from, {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    fileName: fileName,
                    ptt: false // Voice note ആയി അയക്കണമെങ്കിൽ true ആക്കുക
                }, { quoted: msg });
                
                // അയച്ചു കഴിഞ്ഞാൽ ക്യാഷ് ക്ലിയർ ചെയ്യാം (Optional)
                // audioCache.delete(sender);
            }
        }

    } catch (error) {
        console.error("Error Log:", error);
        // Error മെസ്സേജ് വാട്സാപ്പിൽ വരാൻ താഴെ ഉള്ളത് ഉപയോഗിക്കാം
        // await sock.sendMessage(from, { text: `❌ Error: ${error.message}` });
    }
};
