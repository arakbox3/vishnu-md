import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(chat, { text: "❌ Usage: .font [text]\nExample: .font Asura" });
    }

    const charMaps = {
    doubleStruck: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫",

    //  Bold Italic (Serif style)
    boldItalic: "𝑨𝑩𝑪𝑫𝑬𝑭𝑮𝑯𝑰𝑱𝑲𝑳𝑴𝑵𝑶𝑷𝑸𝑹𝑺𝑻𝑼𝑽𝑾𝑿𝒀𝒁𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛",

    //  Sans-Serif Bold
    sansBold: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝒌𝒍𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝗅𝘆𝘇",

    // . Sans-Serif Italic
    sansItalic: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝒌🇱𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻",

    // . Sans-Serif Bold Italic
    sansBoldItalic: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝕞𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",

    // . Fraktur Bold (Ancient/Gothic style)
    ancientBold: "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟",

    // . Script Bold (Elegant Cursive/Handwriting)
    handwritingBold: "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃",

    //  Circled (Letters inside white circles)
    circled: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",

    //  Negative Circled (Letters inside black circles)
    circledDark: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩",

    //  Squared (Letters inside boxes)
    squared: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",

    // Monospace (Typewriter style)
    monospace: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣",

    //  Fraktur (Classic Gothic - light)
    ancient: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜𝔩𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",

    //  Script (Light Cursive)
    handwriting: "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏",

    //  Mathematical Bold (Serif)
    boldSerif: "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏Ｑ𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳",

    //  Mathematical Italic (Serif)
    italicSerif: "𝐴𝐵𝐶𝐷𝐸𝐹𝐺𝐻𝐼𝐽𝐾𝐿𝑀𝑁𝑂𝑃𝑄𝑅𝑆𝑇𝑈𝑉𝑊𝑋𝑌𝑍𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧",

    //  Sans-Serif Regular
    sansNormal: "𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓",

    //  Small Caps (Capital style for all)
    smallCaps: "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ",

    //  Negative Squared (White letters in black boxes)
    squaredDark: "🅰🅱🅲🅓🅔🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉",

    //  Bubble (Similar to circled but different font weight)
    bubble: "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ",

    //  Parenthesized (Letters in brackets)
    parenthesis: "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵",

    //latter Emoji 
    emoji: "🍎🐻🐮🥟🥚🔥👧🖐🧊🗾🪁😂📫💅🦦💩❓🌹🧼🐢⬆️🏐💦❌🧶🦓",

    OrnateParentheses: " ﴾Ä̤﴿﴾B̤̈﴿﴾C̤̈﴿﴾D̤̈﴿﴾Ë̤﴿﴾F̤̈﴿﴾G̤̈﴿﴾Ḧ̤﴿﴾Ï̤﴿﴾J̤̈﴿﴾K̤̈﴿﴾L̤̈﴿﴾M̤̈﴿﴾N̤̈﴿﴾Ö̤﴿﴾P̤̈﴿﴾Q̤̈﴿﴾R̤̈﴿﴾S̤̈﴿﴾T̤̈﴿﴾Ṳ̈﴿﴾V̤̈﴿﴾Ẅ̤﴿﴾Ẍ̤﴿﴾Ÿ̤﴿﴾Z̤̈﴿",

    Shade:  " A░B░C░D░E░F░G░H░I░J░K░L░M░N░O░P░Q░R░S░T░U░V░W░X░Y░Z░",

   Brackets:  "【A】【B】【C】【D】【E】【F】【G】【H】【I】【J】【K】【L】【M】【N】【O】【P】【Q】【R】【S】【T】【U】【V】【W】【X】【Y】【Z】",

   Money:  "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ",

   DottedAngleBrackets:  "⦑A⦒⦑B⦒⦑C⦒⦑D⦒⦑E⦒⦑F⦒⦑G⦒⦑H⦒⦑I⦒⦑J⦒⦑K⦒⦑L⦒⦑M⦒⦑N⦒⦑O⦒⦑P⦒⦑Q⦒⦑R⦒⦑S⦒⦑T⦒⦑U⦒⦑V⦒⦑W⦒⦑X⦒⦑Y⦒⦑Z⦒",

   X's: "A͓̽B͓̽C͓̽D͓̽E͓̽F͓̽G͓̽H͓̽I͓̽J͓̽K͓̽L͓̽M͓̽N͓̽O͓̽P͓̽Q͓̽R͓̽S͓̽T͓̽U͓̽V͓̽W͓̽X͓̽Y͓̽Z͓̽",

̾   Lightning: "A͛B͛C͛D͛E͛F͛G͛H͛I͛J͛K͛L͛M͛N͛O͛P͛Q͛R͛S͛T͛U͛V͛W͛X͛Y͛Z͛",

   Zigzags: "A͛⦚B͛⦚C͛⦚D͛⦚E͛⦚F͛⦚G͛⦚H͛⦚I͛⦚J͛⦚K͛⦚L͛⦚M͛⦚N͛⦚O͛⦚P͛⦚Q͛⦚R͛⦚S͛⦚T͛⦚U͛⦚V͛⦚W͛⦚X͛⦚Y͛⦚Z͛⦚",

   UpArrows: "A͎B͎C͎D͎E͎F͎G͎H͎I͎J͎K͎L͎M͎N͎O͎P͎Q͎R͎S͎T͎U͎V͎W͎X͎Y͎Z͎",

   VerticalBrackets:  "A̺͆B̺͆C̺͆D̺͆E̺͆F̺͆G̺͆H̺͆I̺͆J̺͆K̺͆L̺͆M̺͆N̺͆O̺͆P̺͆Q̺͆R̺͆S̺͆T̺͆U̺͆V̺͆W̺͆X̺͆Y̺͆Z̺͆",

   Tildes:  "A≋B≋C≋D≋E≋F≋G≋H≋I≋J≋K≋L≋M≋N≋O≋P≋Q≋R≋S≋T≋U≋V≋W≋X≋Y≋Z≋",

    };

    const numMaps = {
  //  Double Struck (Outline)
    doubleStruck: "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",

    //  Sans-Serif Bold
    sansBold: "𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",

    //  Sans-Serif Regular
    sansNormal: "𝟢𝟣𝟤𝟥𝟦𝟧𝟨𝟩𝟪𝟫",

    //  Monospace (Typewriter)
    monospace: "𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",

    //  Bold Serif
    boldSerif: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗",

    //  Circled (White circles)
    circled: "⓪①②③④⑤⑥⑦⑧⑨",

    //  Circled Dark (Black circles)
    circledDark: "🄀➊➋➌➍➎➏➐➑➒",

    //  Parenthesized (With brackets)
    parenthesis: "⑴⑵⑶⑷⑸⑹⑺⑻⑼",

    //  Fullwidth (Wide spacing)
    fullWidth: "０１２３４５６７８９",

    };

    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const normalNums = "0123456789";

    const styleText = (input, charMap, numMap) => {
        const cArray = charMap ? Array.from(charMap) : [];
        const nArray = numMap ? Array.from(numMap) : [];
        
        return input.split('').map(char => {
            const charIndex = normalChars.indexOf(char);
            if (charIndex !== -1 && cArray[charIndex]) return cArray[charIndex];

            const numIndex = normalNums.indexOf(char);
            if (numIndex !== -1 && nArray[numIndex]) return nArray[numIndex];

            return char; 
        }).join('');
    };

    // --- മാറ്റം വരുത്തിയ ഭാഗം ---
    let result = "";
    Object.keys(charMaps).forEach((key, index) => {
        const styled = styleText(text, charMaps[key], numMaps[key] || numMaps.sansBold);
        result += `*${index + 1}.* \`${styled}\`\n`;
    });
    // -------------------------

    const fontDesign = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Font Generator*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*

╭•°•❲ *Result for: ${text}* ❳•°•
${result}     
╰╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    const imagePath = './media/thumb.jpg'; 
    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { image: { url: imagePath }, caption: fontDesign }, { quoted: msg });
    } else {
        await sock.sendMessage(chat, { text: fontDesign }, { quoted: msg });
    }

    const songPath = './media/song.opus'; 
    if (fs.existsSync(songPath)) {
        await sock.sendMessage(chat, { 
            audio: { url: songPath }, 
            mimetype: 'audio/mpeg', 
            ptt: true 
        }, { quoted: msg });
    }
};
