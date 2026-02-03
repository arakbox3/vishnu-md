import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

export const handleMessages = async (sock, chatUpdate) => {
    try {
        if (!['notify', 'append'].includes(chatUpdate.type)) return;

        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Ensure we handle messages from Groups, Private DMs, and Broadcasts
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // Extract message body across all media types
        const mtype = Object.keys(msg.message)[0];

        let body = (mtype === 'conversation') ? msg.message.conversation :
           (mtype === 'extendedTextMessage') ? msg.message.extendedTextMessage.text :
           (mtype === 'imageMessage') ? msg.message.imageMessage.caption :
           (mtype === 'videoMessage') ? msg.message.videoMessage.caption :
           (mtype === 'documentMessage') ? msg.message.documentMessage.caption :
           (mtype === 'pollUpdateMessage') ? msg.message.pollUpdateMessage.pollUpdate.vote.selectedOptions[0] : 
           (mtype === 'templateButtonReplyMessage') ? msg.message.templateButtonReplyMessage.selectedId :
           (mtype === 'interactiveResponseMessage') ? JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
           (mtype === 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId :
           (mtype === 'listResponseMessage') ? msg.message.listResponseMessage.singleSelectReply.selectedRowId :
           (msg.message.viewOnceMessageV2) ? msg.message.viewOnceMessageV2.message.imageMessage?.caption || msg.message.viewOnceMessageV2.message.videoMessage?.caption : '';

           // (Quoted/Reply Message)
         if (!body && mtype === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo) {
           body = msg.message.extendedTextMessage.text;
           }

         if (!body) return; 

        // Define allowed prefixes
        const prefixes = ".!@#$%^&*()_+-=[]{};':\"\\|,.<>/?~₹";
        const firstChar = body.charAt(0);
        const isCmd = prefixes.includes(firstChar);

        if (!isCmd) return;

        const prefix = firstChar;
        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        if (!commandName) {
            await sock.sendMessage(from, { text: "👺 *Asura-MD:* Please enter a command after the prefix (e.g., .menu) 🥰" }, { quoted: msg });
            return;
        }

        // Command File Execution 
        const commandFile = `${commandName.toLowerCase()}.js`;
        const commandPath = path.join(process.cwd(), 'commands', commandFile);

        if (fs.existsSync(commandPath)) {
            try {
                // Import with Cache Busting to ensure updates take effect
                const fileUrl = `${pathToFileURL(commandPath).href}?t=${Date.now()}`;
                const commandModule = await import(fileUrl);
                
                // Flexible Export: handles 'export default' and 'module.exports'
                const runCommand = commandModule.default || commandModule;

                if (typeof runCommand === 'function') {
                    console.log(`\x1b[1;32m[SUCCESS]\x1b[0m Executing ${commandName} for ${from}`);
                    
                    // Typing status to make it look professional
                    await sock.sendPresenceUpdate('composing', from);

                    // Execute with a Timeout (Prevent bot from hanging on slow commands)
                    await Promise.race([
                        runCommand(sock, msg, args),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000))
                    ]);

                } else {
                    throw new Error("Command file does not export a valid function.");
                }

            } catch (err) {
                console.error(`\x1b[1;31m[EXECUTION ERROR]\x1b[0m In ${commandName}:`, err.message);
                
                let errorMsg = "❌ *Asura-MD Error* ❌\n\n";
                errorMsg += `*Command:* ${commandName}\n`;
                errorMsg += `*Reason:* ${err.message === 'Timeout' ? 'Server Busy/Slow' : 'Internal Bug'}`;
                
                await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
            }
        } else {
            console.log(`\x1b[1;33m[IGNORE]\x1b[0m Command not found: ${commandName}`);
        }

    } catch (err) {
        console.error("\x1b[31m[UPSERT ERROR]\x1b[0m", err);
      }
};
