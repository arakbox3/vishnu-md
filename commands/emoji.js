import fs from 'fs';

const handler = async (sock, msg, args) => {
    const { remoteJid, key } = msg;

    // 50 ഇമോജികളുടെ ലിസ്റ്റ്
    const emojis = [
        "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
        "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
        "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
        "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
        "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
        "😈", "👿", "👹", "👺", "☠", "💀", "⚰", "🥀", "👻", "☪️",
        "☸", "🕉", "✝️", "☦", "🌚", "🌝", "✋", "⏹", "🛑", "🔚"
    ];

    // ആദ്യം ഒരു മെസ്സേജ് അയക്കുന്നു
    let { key: editKey } = await sock.sendMessage(remoteJid, { text: "Starting Emoji Dance... 💃" });

    // ഓരോ 500ms - 1s ഇടവേളയിൽ മെസ്സേജ് എഡിറ്റ് ചെയ്യുന്നു
    for (let i = 0; i < emojis.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800)); // വേഗത ക്രമീകരിക്കാൻ സമയം മാറ്റാം
        await sock.sendMessage(remoteJid, { 
            text: emojis[i], 
            edit: editKey 
        });
    }

    // അവസാനം ഒരു ഫിനിഷിംഗ് മെസ്സേജ്
    await sock.sendMessage(remoteJid, { 
        text: "Dance Finished! 👺 ASURA-MD", 
        edit: editKey 
    });
};

export default handler;
