const handler = async (sock, msg, args) => {
const chat = msg.key.remoteJid

// large emoji pool
const emojis = [
"😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇",
"🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚",
"😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩",
"🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣",
"😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬",
"😈","👿","👹","👺","💀","☠️","👻","🤖","🎃","🔥",
"✨","⚡","💫","🌟","⭐","🌙","🌚","🌝","☀️","🌈"
];

    try {
        let { key } = await sock.sendMessage(chat, { text: "💃 *Emoji Dance Starting...* 🕺" });

        let frameSize = 10;
        // ഒരുപാട് ഫ്രെയിമുകൾ ഒഴിവാക്കാൻ slice ഉപയോഗിച്ച് കുറച്ചു മാത്രം എടുക്കാം (Optional)
        for (let i = 0; i < emojis.length; i += frameSize) {
            let frame = emojis.slice(i, i + frameSize).join(" ");
            
            await new Promise(r => setTimeout(r, 2500)); 

            await sock.sendMessage(chat, {
                text: frame,
                edit: key
            });
        }

        await sock.sendMessage(chat, {
            text: "✅ *Emoji Dance Finished*\n👺 ASURA-MD",
            edit: key
        });

    } catch (e) {
        console.log("Emoji Dance Error:", e);
    }
};

export default handler;
