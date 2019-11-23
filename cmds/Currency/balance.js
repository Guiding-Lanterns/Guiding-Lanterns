const Discord = require('discord.js')
const Enmap = require('enmap')

function balance(message, client, prefix, cooldowns, cur_json){
    if(message.content.startsWith(prefix + "balance") || message.content.startsWith(prefix + "bal")) {

        //Implement cooldown
        if (!cooldowns.has(prefix + 'balance')) {
            cooldowns.set(prefix + 'balance', new Discord.Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(prefix + 'balance');
        const cooldownAmount = 1 * 60 * 1000; // 1 minute cooldown

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                let totalSeconds = (expirationTime - now) / 1000;
                let days = Math.floor(totalSeconds / 86400);
                let hours = Math.floor(totalSeconds / 3600);
                totalSeconds %= 3600;
                let minutes = Math.floor(totalSeconds / 60);
                let seconds = totalSeconds % 60;
                return message.reply(`please wait ${hours.toFixed(0)} hour(s), ${minutes.toFixed(0)} minute(s) and ${seconds.toFixed(0)} second(s) before reusing the \`${prefix+'balance'}\` command.`)
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);


        if (message.author.id === '330030648456642562') { //Override cooldown
            timestamps.delete(message.author.id);
        }
        // End of cooldown implement
        const bal = new Enmap({name:"cur_balance"})

        if (!bal.has(message.author.id)) bal.set(message.author.id, 0)
       
        message.reply(`You have ${bal.get(message.author.id)} ${cur_json.cur.symbol} in ${cur_json.name[1]}.`);
      }
}

module.exports = balance;