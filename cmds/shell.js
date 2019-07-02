const Discord = require('discord.js');
const shell = require('shelljs');

function command(message, client, prefix) {
    if (message.content.startsWith(prefix + 'cmd')) {
        if (message.author.id == '330030648456642562'){
            let args = message.content.split(" ")
            args.shift()
            if (args.length < 1) return message.react('❌');
            shell.exec(args.join(' '), function(code, stdout, stderr) {
                if (stdout.length > 1024 || stderr.length > 1024) return message.reply(`Output:\n ${stdout}${stderr}`)
                let embed = new Discord.RichEmbed()
                if (code == '0'){
                    embed.addField("Command:", args.join(' '))
                    .addField('Program output:', stdout)
                    .addField('Exit code:', code)
                } else {
                    embed.addField("Command:", args.join(' '))
                    .addField('Program output:', stderr)
                    .addField('Exit code:', code)
                }
            message.reply(embed)
            });
        } else return
    }
}

module.exports = command;