// All commands listed here

function cmds_index(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel, dbl){
    
    /*--------------------------------
    -------------- Owner -------------
    --------------------------------*/

    const eval_cmd = require('./Owner/eval.js');
    eval_cmd(message, client, prefix);

    const command = require('./Owner/shell.js');
    command(message, client, prefix);

    const claimlog = require('./Owner/log.js');
    claimlog(message, client, prefix);

    const worldsmanager = require('./Owner/worlds.js')
    worldsmanager(message, client, prefix, functiondate, functiontime, getlogchannel())

    /*--------------------------------
    ------------- Worlds -------------
    --------------------------------*/

    const quotes = require('./Worlds/quotes.js');
    quotes(message, client, prefix, functiondate, functiontime, getlogchannel());

    const picture = require('./Worlds/pics.js')
    picture(message, client, prefix, functiondate, functiontime, getlogchannel())

    /*--------------------------------
    --------------- Fun --------------
    --------------------------------*/

    const eight_ball = require('./Fun/8ball.js');
    eight_ball(message, client, prefix, functiondate, functiontime, getlogchannel());

    const bot_ping = require('./Fun/ping.js');
    bot_ping(message, client, prefix);

    /*--------------------------------
    --------------- Util -------------
    --------------------------------*/

    const wolfram_short = require('./Util/wolfram_short.js');
    wolfram_short(message, client, prefix);

    const voted = require('./Util/voted.js');
    voted(message, client, prefix, dbl);

    const image_search_request = require('./Util/img_search.js')
    image_search_request(message, client, prefix, functiondate, functiontime, getlogchannel(), dbl)

    const about = require('./Util/about.js');
    about(message, client, prefix);

    const setPrefix = require('./Util/prefix.js')
    setPrefix(message, client, prefix);

    const geturlofattachment = require('./Util/geturlofattach.js')
    geturlofattachment(message, client, prefix);

    /*--------------------------------
    -------------- Other -------------
    --------------------------------*/

    const help = require('./Other/help.js');
    help(message, client, prefix);

    const bug = require('./Other/bug.js');
    bug(message, client, prefix);

    const suggest = require('./Other/suggest.js');
    suggest(message, client, prefix);


    /*--------------------------------
    --------- Guild-specific ---------
    --------------------------------*/

    if (message.guild.id == '562602234265731080') { // Kingdom of Corona
        const lantern = require('./Guild/lantern.js');
        lantern(message, client, prefix, getlogchannel());

        const screenshot = require('./Guild/screenshot.js');
        screenshot(message, client, prefix, functiondate, functiontime, cooldowns, getlogchannel(), dbl);
    }

    //-----------------------------------------------------------------------------------------------

}

module.exports = cmds_index;