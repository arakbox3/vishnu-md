import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';

// യൂസർ സെലക്ഷൻ സ്റ്റോർ ചെയ്യാൻ
if (!global.fontStorage) global.fontStorage = {};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const inputMsg = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || "").trim();

    // --- 1. number Handler ---
    if (!isNaN(inputMsg) && global.fontStorage[sender]) {
        const index = parseInt(inputMsg) - 1;
        const fonts = global.fontStorage[sender];
        if (fonts[index]) {
            return await sock.sendMessage(chat, { text: fonts[index] }, { quoted: msg });
        }
    }

    // --- 2. മെയിൻ കമാൻഡ് (.font) ---
    const text = args.join(" ");
    if (!text) {
        if (inputMsg.startsWith('.')) return; 
        return; 
    }

    const charMaps = {
        "Double Struck": {
            c: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",
            n: "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡"
        },
        "Bold Italic": {
            c: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",
            n: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        },
        "Sans Bold": {
            c: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇",
            n: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵"
        },
        "Ancient Bold": {
            c: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",
            n: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        },
        "Handwriting": {
            c: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",
            n: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"
        },
        "Circled": {
            c: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",
            n: "⓪①②③④⑤⑥⑦⑧⑨"
        },
        "Monospace": {
            c: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",
            n: "𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
        },
        "Money Style": {
            c: "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ",
            n: "0123456789"
        }
    };

    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const normalNums = "0123456789";

    let result = "";
    let userFonts = [];
    const keys = Object.keys(charMaps);

    keys.forEach((key, i) => {
        const map = charMaps[key];
        const cArray = Array.from(map.c);
        const nArray = Array.from(map.n);

        const styled = text.split('').map(char => {
            const cIdx = normalChars.indexOf(char);
            if (cIdx !== -1 && cArray[cIdx]) return cArray[cIdx];
            const nIdx = normalNums.indexOf(char);
            if (nIdx !== -1 && nArray[nIdx]) return nArray[nIdx];
            return char;
        }).join('');

        userFonts.push(styled);
        result += `*${i + 1}.* \`${styled}\`\n`;
    });

    // സ്റ്റോറേജ് അപ്‌ഡേറ്റ് ചെയ്യുന്നു
    global.fontStorage[sender] = userFonts;

   const fontDesign = `
*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Font Generator*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*

╭•°•❲ *Result for: ${text}* ❳•°•
${result}     
╰╌╌╌╌╌╌╌╌╌╌࿐
> *Reply with number (1-${keys.length}) to get the font.*
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // ചിത്രം അയക്കുന്നു
    const imagePath = './media/thumb.jpg'; 
    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { image: { url: imagePath }, caption: fontDesign }, { quoted: msg });
    } else {
        await sock.sendMessage(chat, { text: fontDesign }, { quoted: msg });
    }

    // ഓഡിയോ അയക്കുന്നു
    const songPath = './media/song.opus'; 
    if (fs.existsSync(songPath)) {
        await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg });
    }
};
