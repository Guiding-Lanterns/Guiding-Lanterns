const Discord = require('discord.js');

function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = function(member, client) {
    member.user.send(`Howdy ! I can help you to better integrate into the kingdom! That's the role of a lady-in-waiting!\n\nWe (mostly the Royal Guard) regularly post announcements about the server. <#563241725133455391>\n\nYou can get more roles and change the colour of your name here: <#643107104504152065>\n\nIf you've joined the subreddit at https://reddit.com/r/tangled , you can type \`!subbed\` to get the Friend of Rapunzel badge!\n\nDon't forget to participate because I count your messages and transform them into experience, and thanks to this experience you can gain levels. The higher you are, the more rewards you will get! (Type \`!rank\` in #bot-commands to see your level!)\n\n**__And above all, don't forget to have fun in the world of Tangled!__**`).catch(e=>console.log(e))
    member.roles.add('562608575227363329')

    const messages = [
        'Welcome and hello to Kingdom of Corona :sunny:',
        'Welcome, welcome to Kingdom Of Corona :sunny:',
        'Hello and welcome :sunny:, we are so happy that you are with us <:RapunzelExcited:570818890259628052>. Have a great time here!',
        ':wave:',
        '<:RapunzelExcited:570818890259628052>',
        'Have a great time here! <:PascalYes:567339119009726474>',
        'Hello! <:heureuse:570820764799074335>',
        'Welcome, welcome to Kingdom of Corona :sunny: Have a good time here <:PascalYes:567339119009726474>',
        'Bienvenue !',
        'Put down your luggages and enjoy the kingdom! :sunny:'
    ];

    let welcomemsg = randomItem(messages);

    let embed = new Discord.MessageEmbed()
    embed.setColor("#01B023")
    .setTimestamp()
    .addField(`${welcomemsg}`, `Hey, **say welcome to __${member.user.username}__** 🙌`)
    .setThumbnail('http://www.youloveit.com/uploads/posts/2017-11/1511021094_youloveit_com_tangled_the_series_animated_gifs_emotions03.gif')
    .setFooter(`${member.user.tag} just landed in the Kingdom of Corona!`, `${member.user.displayAvatarURL()}`)
    client.channels.fetch('658808055558832132').then(channel=>{
        channel.send(embed);
    })
}
