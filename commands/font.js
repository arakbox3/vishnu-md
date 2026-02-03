import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) return await sock.sendMessage(chat, { text: "👺 *Please provide text!* \nExample: `.font Asura`" }, { quoted: msg });

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
        "Sans Bold Italic": {
          c: "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯",
          n: "𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗"          
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
            c: "₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ₳฿₵ĐɆ₣₲ⱧłJ₭Ⱡ₥₦Ø₱QⱤ₴₮ɄV₩ӾɎⱫ",
            n: "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡" 
        },
       "Ornate Style": {
           c: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷",
          n: "𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡" 
        },
        "Square Box": {
            c: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉",
            n: "⓪①②③④⑤⑥⑦⑧⑨"  }
    };

    const normalChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const normalNums = "0123456789";

    let responseText = `👺 *ASURA FONT GENERATOR*\n\n*Input:* ${text}\n\n`;

    Object.keys(charMaps).forEach((key) => {
        const map = charMaps[key];
        const styled = text.split('').map(char => {
            const cIdx = normalChars.indexOf(char);
            if (cIdx !== -1) return Array.from(map.c)[cIdx];
            const nIdx = normalNums.indexOf(char);
            if (nIdx !== -1) return Array.from(map.n)[nIdx];
            return char;
        }).join('');

        // ഓരോ ഫോണ്ടിന്റെയും പേരും അതിന്റെ റിസൾട്ടും ചേർക്കുന്നു
        responseText += `*${key}:*\n\`\`\`${styled}\`\`\`\n\n`;
    });

    responseText += `_© ᴀsᴜʀᴀ ᴍᴅ | ᴀʀᴜɴ_`;

    try {
        // ലളിതമായ ടെക്സ്റ്റ് മെസ്സേജ് അയക്കുന്നു (ഇത് എല്ലായിടത്തും വർക്ക് ആകും)
        await sock.sendMessage(chat, { text: responseText }, { quoted: msg });
        
        const songPath = './media/song.opus';
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
        }
    } catch (e) {
        console.error("Font Error:", e);
    }
};
