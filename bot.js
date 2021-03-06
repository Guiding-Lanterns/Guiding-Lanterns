try{
const Discord = require('discord.js'); // Defines the Discord.js library
const {MessageAttachment} = require('discord.js') // Defines attachment config (for sending files)
const client = new Discord.Client({
    fetchAllMembers: true,
    autoReconnect: true
  });
  const fs = require('fs');
  const configfile = "./data/config.json";
  const config = JSON.parse(fs.readFileSync(configfile, "utf8")); // Retrieves the contents of the configuration file (the prefix and the login token)
  const packagefile = "./package.json";
  const package = JSON.parse(fs.readFileSync(packagefile, "utf8"));
  const Themeparks = require('themeparks')
  const ThemeparksList = {};
  for (const park in Themeparks.Parks) {
    ThemeparksList[park] = new Themeparks.Parks[park]();
}

  const execArgs = process.argv.slice(2);
if (execArgs.includes('-s')) {
    console.log('Started with shard')
    // console.log = (text) => client.shard.send(text)
}
else {
    console.log('Started without shard')
}
if (execArgs.includes('-n')) {
    console.log('Started as nightly')
    client.login(config.token_nightly)
}
else {
    console.log('Started as normal')
    client.login(config.token)
}

const channel_id = require('./data/channel_ids.json');
const num_members_guild = require('./counter/guild-member.js');

var getlogchannel
const cooldowns = new Discord.Collection(); //Stores cooldown info for screenshot()
const nightly = '577477992608038912'
var logchannel

const inviteTracker = require('./events/invite-track.js'); // Define the invite tracker plugin
const shell = require('shelljs'); // Require for executing shell commands (such as git)

const Enmap = require("enmap"); // Define enmap, a database integrated with the bot
const guildPrefix = new Enmap({name: "guildPrefix"}); // Define a new table for custom prefixes
const userLang = new Enmap({name: "user_languages"}); // Define a new table for user languages
const giveawayDB = new Enmap({name: "giveaway"}); // Define a new table for giveaways

const DiscordGiveaways = require("discord-giveaways");
const GiveawayManager = class extends DiscordGiveaways.GiveawaysManager {
    async getAllGiveaways(){
        return giveawayDB.fetchEverything().array();
    }
    async saveGiveaway(messageID, giveawayData){
        giveawayDB.set(messageID, giveawayData);
        return true;
    }
    async editGiveaway(messageID, giveawayData){
        giveawayDB.set(messageID, giveawayData);
        return true;
    }
    async deleteGiveaway(messageID){
        giveawayDB.delete(messageID);
        return true;
    }
    async refreshStorage(){
        return client.shard.broadcastEval(() => this.getAllGiveaways());
    }
};
const giveawaysManager = new GiveawayManager(client, {
    storage: false,
    updateCountdownEvery: 30 * 1000,
    default: {
        botsCanWin: false,
        embedColor: "#FF0000",
        reaction: "✨"
    }
});
client.giveawaysManager = giveawaysManager;

const getGuildPrefix = (message) => {
    if (!guildPrefix.has(message.guild.id)) guildPrefix.set(message.guild.id, config.prefix) // If the server has not a prefix, give the default one
    return guildPrefix.get(message.guild.id); // Gives the prefix for the server
}
const getUserLang = (message) => {
    if (!userLang.has(message.author.id)) userLang.set(message.author.id, "en_US")
    return userLang.get(message.author.id);
}
const giveUserLang = (message) => {
    if (!userLang.has(message.author.id)) userLang.set(message.author.id, "en_US")
    return JSON.parse(fs.readFileSync(`./lang/${userLang.get(message.author.id)}.json`, "utf8"));
}

function functiondate() { // The function it gives a date (here the current date)
    const datefu = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = datefu.getFullYear();
    const month = months[datefu.getMonth()];
    const getdate = datefu.getDate();
    const date = getdate + ' ' + month + ' ' + year;
    return date;
}; // End of the function

function functiontime() { // The function it gives a time (here the current time)
    const datefu = new Date();
    const hour = datefu.getHours();
    const min = datefu.getMinutes();
    const sec = datefu.getSeconds();
    const time = hour + ':' + min + ':' + sec;
    return time
} // End of the function


client.on('ready', async () => { // If bot was connected:

    if (client.user.id == config.public) logchannel = config.log_channel //Set a channel for logging
    else if (client.user.id == nightly) logchannel = '589337521553539102' // if nightly send to log nightly
    getlogchannel = () => client.channels.cache.get(logchannel)
    const countdown = require('./counter/countdown.js');
    const num_guilds = require('./counter/guilds.js');
    const ver = require('./counter/version.js')

    if (!getlogchannel) {
        console.error('Discord log channel not found. Sending log in the console (there might be in double)')
        getlogchannel().send = (text) =>  console.log(text)
    }

    if (!client.shard) {
        console.log(`[Client] connected as ${client.user.tag}`)
        getlogchannel().send(`${client.user.tag} is connected`)
    } else {
        console.log(`[Client] connected as ${client.user.tag} in shard ${client.shard.ids[0]}`)
        getlogchannel().send(`${client.user.tag} is connected in shard ${client.shard.ids[0]}`) 
    }

    require('./events/daily-reddit.js')(client)

    if (client.user.id == config.public){

        // client.channels.cache.get('741594861408354325').messages.fetch('754365382189514802').then(m => {
        //     console.log("Cached reaction (rules accept) message.");
        //     console.log(m.content)
        // }).catch(e => {
        // console.error("Error loading (rules accept) message.");
        // console.error(e);
        // });

        /*
        const lant_num_members_guild = () => num_members_guild(client, "562602234265731080", channel_id.members);
        lant_num_members_guild(); //Set the Member count
        
        const lant_num_guilds = () => num_guilds(client, channel_id.guilds);
        lant_num_guilds(); //Set the guilds count
        */
        const lant_ver = () => ver(client, channel_id.version);
        lant_ver(); //Set version number in the version number channel
        require('./events/ver-check.js')(client);
    
        const totalguildsize = await client.shard.fetchClientValues('guilds.size')
        
        inviteTracker.ready(client); // Starts the invite tracker plugin

        const loginterval = function() { // send automatic log file
            console.log(`[ ${functiondate()} - ${functiontime()} ] Sending log file...`)
            const attachment = new MessageAttachment('./logs/bot.log') // Defines the log file to send
            getlogchannel().send('Daily log file:', attachment) // Send the file
            .then(function(){
                console.log(`[ ${functiondate()} - ${functiontime()} ] Log file sent, erasing old file...`)
                fs.writeFileSync('./logs/bot.log', '') // Recreates the log file
                console.log(`[ ${functiondate()} - ${functiontime()} ] Old log file succefully erased!`)
            })
            .catch(err=>getlogchannel().send('Error during sending the weekly log file: ' + err + '\nThe file was anyway recreated').then(fs.writeFileSync('./logs/bot.log', '')))
        }
        var dailythings = new Promise(function(resolve, reject) {
            setInterval(function(){
                loginterval()
            }, 8.64e+7); // do this every day    
          });
        dailythings

    } else if (client.user.id == nightly || execArgs.includes('-n')){
        /*
        const lant_num_members_guild = () => num_members_guild(client, "570024448371982373", channel_id.nightly_members);
        lant_num_members_guild();

        const lant_num_guilds = () => num_guilds(client, channel_id.nightly_guilds);
        lant_num_guilds();
        */

        client.user.setStatus('dnd');
        client.user.setActivity('with alchemy. Version ' + package.version + ' (beta)');
        
        const interval = new Promise(function() {
            setInterval(function() {
                const attachment = new MessageAttachment('./logs/bot_nightly.log')
                getlogchannel().send('Log file:', attachment)
                .then(m=>fs.writeFileSync('./logs/bot_nightly.log', ''))
                .catch(err=>getlogchannel().send('Error during sending the log file: ' + err + '\nThe file was anyway recreated').then(fs.writeFileSync('./logs/bot_nightly.log', '')))
            }, 3600000);
        }).catch(err=>getlogchannel().send('Error during sending the log file: ' + err + '\nThe file was anyway recreated').then(fs.writeFileSync('./logs/bot_nightly.log', '')))
        interval
    }
}); // End


client.on('message', message => { // If any message was recived
    try {
    var prefix
    if (client.user.id != nightly && message.channel.type === 'text') prefix = getGuildPrefix(message); // Gets the server prefix from the database
    else if (client.user.id == nightly && message.channel.type === 'text') prefix = '?'
    if (message.channel.type === 'text') var langtext = getUserLang(message); // Gets the user language from the database
    if (message.channel.type === 'text') var lang = giveUserLang(message); // Gets the user language from the database

    if (client.user.id == nightly) console.log(`${message.author.tag}: " ${message.content} " in #${message.channel.name}`)

    if (message.author.bot) return; // If is a bot, do nothing

    //Check if user has supported
    if (client.user.id == config.public) require('./support/support_check.js')(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel, config)

    //All commands listed in cmds_index.js
    require('./cmds/cmds_index.js')(message, client, prefix, config, functiondate, functiontime, cooldowns, getlogchannel, guildPrefix, userLang, lang, langtext, ThemeparksList);

    //Lists of mini-games
    require('./games/games_index.js')(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel, guildPrefix, userLang, lang, langtext);

    } catch (e) {
        console.log(e)
        getlogchannel().send(`**Message event ERROR** : ${e}`)
    }
});

client.on('guildMemberAdd', member => { // If any member join a server (or guild in Discord language)
    if (member.user.bot) return
    if (member.guild.id == '562602234265731080') { // If the member join Kingdom of Corona, do the welcome script
        require('./events/welcome.js')(member, client)
    }
    console.log(`\n${member.user.tag} joined ${member.guild.name} at ${functiondate(0)} at ${functiontime(0)}\n`) // Send at the console who joined
})

client.on('guildMemberRemove', member => { // If any member leave a server (or guild in Discord language)
    if (member.user.bot) return
    if (member.guild.id == '562602234265731080') { // If the member leave Kingdom of Corona, do the goodbye script
        require('./events/goodbye.js')(member, client);
    }
    console.log(`\n${member.user.tag} left ${member.guild.name} at ${functiondate(0)} at ${functiontime(0)}\n`) // Send at the console who left
})

// client.on('guildMemberUpdate', (oldMember, newMember) => { 
//     if (oldMember.user.bot) return
//     if (oldMember.guild.id === '562602234265731080' && newMember.guild.id === '562602234265731080') { 
//         if(!oldMember.roles.cache.some(r=> r.id == '562608575227363329') && newMember.roles.cache.some(r=> r.id == '562608575227363329')){
//             require('./events/welcome.js')(oldMember, newMember, client);
//         } else return
//     } else return
// })

client.on('guildCreate', async guild => { // If the bot join a server
    const botjoinguildlog = `${client.user.username} joined __${guild.name}__\n*ID: ${guild.id}*` // Set the text
    console.log(`[${functiondate(0)} - ${functiontime(0)}]\n${botjoinguildlog}`) // Send at the console
    getlogchannel().send(botjoinguildlog) // Send at the Discord log channel

    const totalguildsize = await client.shard.fetchClientValues('guilds.size')
    /* Unused now
    if (client.user.id == config.public || client.user.id == nightly) {
        const lant_num_guilds = () => num_guilds(client, channel_id.guilds);
        lant_num_guilds(); // Change the servers count (+1)
    }
    */
})

client.on('guildDelete', async guild => { // If the bot leave a server
    const botleftguildlog = `${client.user.username} left __${guild.name}__\n*ID: ${guild.id}*`
    console.log(`[${functiondate(0)} - ${functiontime(0)}]\n${botleftguildlog}`)
    getlogchannel().send(botleftguildlog)

    const totalguildsize = await client.shard.fetchClientValues('guilds.size')
    /* Unused now
    if (client.user.id == config.public || client.user.id == nightly) {
        const lant_num_guilds = () => num_guilds(client, channel_id.guilds);
        lant_num_guilds(); // Change the servers count (-1)
    }
    */
})

client.on('messageReactionAdd', (reaction, user) => {
    // if (reaction.message.guild.id == '562602234265731080') { // r/Tangled
    //     const role_react_accept_rules = require('./events/react-accept-rules-welcome.js')
    //     role_react_accept_rules(client, reaction, user, getlogchannel(), functiondate(), functiontime())
    // }

    require('./events/starboard.js')(client, reaction, getlogchannel(), functiondate(), functiontime())
})

client.on('disconnect', event => {
    var eventcodemsg = 'Event Code Message not set for this code'
    if (event === '1000') eventcodemsg = 'Normal closure'
    if (event === '1001') eventcodemsg = 'Can\'t connect to WebSocket'
    const eventmsg = `Bot down : code ${event}: "${eventcodemsg}"`
    console.log(`[${functiondate(0)} - ${functiontime(0)}] ` + eventmsg)
    getlogchannel().send(eventmsg)
})

client.on('reconnecting', () => {
    const eventmsg = `[${functiondate(0)} - ${functiontime(0)} -- MAIN] reconnecting to WebSocket`
    console.log(eventmsg)
})

client.on('debug', text => {
    if (!text.toLowerCase().includes('heartbeat') || execArgs.includes('-n')){
        console.log(text)
    }
})

}catch(e){
console.log(e)
}
