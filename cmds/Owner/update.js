const Discord = require('discord.js');
const shell = require('shelljs');
const fs = require('fs');

function update(message, client, prefix) {
    if (message.content.startsWith(prefix + 'update')) {
        if (message.author.id === '330030648456642562'  || message.author.id === "460348027463401472"){
        try {
            message.channel.startTyping()
            shell.exec('pm2 stop GL && git pull && npm install && pm2 start GL', {silent:true}, function(code, stdout, stderr) {
                message.reply(`Output:\n\`\`\`${stdout}${stderr}\`\`\``).then(m=>message.channel.stopTyping(true));
            });
        } catch (err) {
            message.reply(`EVAL **__ERROR__**\n\`\`\`xl\n'pm2 stop GL && git pull && npm install && pm2 start GL'\`\`\``);
            message.channel.stopTyping(true)
        }
        }else return;
    }
}

module.exports = update;
