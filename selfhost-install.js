const shell = require('shelljs');
const prompt = require('prompt');
const colors = require("colors/safe");
const wait = require('util').promisify(setTimeout);
const fs = require('fs');
const os = require('os');
const package = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const request = require('request')

console.log('\033[2J');

title()

async function title() {
    console.log('┌─────────────────────────────────┐')
    console.log('│       ' + colors.bold(colors.rainbow('The Guiding Lanterns')) + '      │')
    console.log('│                                 │')
    console.log('│       Selfhost installation     │')
    console.log('│             By Greep            │')
    console.log('└─────────────────────────────────┘')
    console.log(colors.grey(package.repository.url))
    os_check();
}

async function os_check(){

    console.log('')

    // Check OS
    console.log('# Checking Operating System...')
    await wait(2000)
    console.log(os.type())
    await wait(500)
    if (os.type() !== 'Linux'){
        console.error(colors.yellow('----- Warning: ------'))
        console.error('Your operating system is not Linux!')
        console.error('The script is highly recommended to be run on Linux system')
        console.error('We do not support on other systems than Linux')
        
        var schema = {
            properties: {
              validate: {
                description: colors.white(colors.underline('Are you sure to continue?') + ' (yes/no):'),
                type: 'string',
                pattern: /^\w+$/,
                default: 'no',
                required: true
              }
            }
        };
        prompt.message = '';
        prompt.delimiter = '';
        prompt.start();
        prompt.get(schema, function (err, result) {
            if (!result.validate.toLowerCase().includes('yes')){
                console.error(colors.red('Please run the script on Linux'))
                console.error(colors.red('Exiting...'))
                process.exit(1)
            } else if (result.validate.toLowerCase().includes('yes')){
                console.log(colors.cyan('okay, be careful!'))
                check_commands()
            }
          });
    } else {
        console.log(colors.green('You\'re safe!') + ' Support for The Guiding Lanterns is supported :)')
        check_commands()
    }
}

async function check_commands(){
    console.log('')

    // Check commands

    console.log('# Checking if git is installed...')
    await wait(2000)
    shell.exec('git --version',{silent: true}, function(code, stdout, stderr){
        if (code != 0){
            console.error(colors.red('----- ERROR: ------'))
            console.error('Git is not installed, please install git')
            if (os.type() == 'Linux') console.error('please execute the command: ' + colors.bold('apt install -y git'))
            else if (os.type() == 'Windows_NT') console.log('please install git at https://git-scm.com/download/win')
            else console.log(colors.bold('please install git'))
            console.error('And retry the installation after')
            console.error(colors.red('-------------------'))
            process.exit(2)
        } else {
            console.log(colors.green('Git is installed!') + ' Version: ' + stdout.replace('git version ', ''))
            version_check()
        }
    })
}

async function version_check(){

    console.log('# Checking versions...')
    
    var packageurl = 'https://raw.githubusercontent.com/Guiding-Lanterns/Guiding-Lanterns/master/package.json'
    request({
        url: packageurl,
        json: true
    }, async function (error, response, body) {
        console.log('Current local version: ' + package.version)
        await wait(3000)
        if (!error && response.statusCode === 200) {
            console.log('Current remote version ' + body.version)
            await wait(1000)
            if (package.version == body.version) {
                console.log(colors.green('Great!') + ' No pull required\nYou can pull manually by executing the command: git pull')
                create_folder()
            }
            else if (package.version != body.version){
                console.log(colors.yellow('A pull is required!'))

                var schema = {
                    properties: {
                      validate: {
                        description: colors.white(colors.underline('Do you want to pull changes?') + ' (yes/no):'),
                        type: 'string',
                        pattern: /^\w+$/,
                        default: 'yes',
                        required: true
                      }
                    }
                };
                prompt.message = '';
                prompt.delimiter = '';
                prompt.start();
                prompt.get(schema, function (err, result) {
                    if (!result.validate.toLowerCase().includes('yes')){
                        console.log(colors.yellow('okay! I\'ll not pull changes!'))
                    } else if (result.validate.toLowerCase().includes('yes')){
                        console.log(colors.cyan('okay, now pulling changes from GitHub!'))
                        shell.exec('git pull', {silent: true}, async function(code, stdout, stderr){
                            if (code != 0){
                                console.log(colors.green('Succefully pulled!') + colors.underline(colors.bold('Please restart the installation script!')))
                                process.exit(0)
                            } else {
                                console.error(colors.red('----- ERROR: ------'))
                                console.error('We\'re unable to pull changes')
                                console.error('Git output: ' + stderr + stdout)
                                console.error(colors.underline(colors.bold('Please restart the installation script!')))
                                console.error(colors.red('-------------------'))
                                process.exit(3)
                            }
                        })
                    }
                })
            }
        } else {
            console.error(colors.red('----- ERROR: ------'))
            console.error('We\'re unable to reach GitHub server')
            if (error !== null) console.error(error)
            console.error('Status Code : ' + response.statusCode)
            console.error(colors.red('-------------------'))
        }
    })
}

async function create_folder(){
    console.log(`\n# Creating data/ folder...`)
    await wait(2000)

    fs.mkdir(`./data`, async function(err){
        if (!err){
            console.log(colors.green(`Succefully created data/ folder!`))
        } else {
            if (err.code == 'EEXIST') {
                console.log(colors.yellow('data/ folder already exists!'))
                support()
            }
            else {
                console.error(colors.red('----- ERROR: ------'))
                console.error(`We\'re unable to create data/ folder`)
                console.error('Please check your permissions!')
                console.error('And then restart the installation script')
                console.error(colors.red('-------------------'))
                process.exit(4)
            }
        }
    })
}

async function support(){
    console.log(`\n# Making support data file`)
    await wait(2000)

    fs.access('./data/support_db.json', fs.constants.F_OK, (err) => {
        if (!err) {
            console.log(colors.yellow(`Support data file exists!`));
            var schema = {
                properties: {
                  validate: {
                    description: colors.white(colors.underline('Do you want to recreate the file?') + ' (yes/no):'),
                    type: 'string',
                    pattern: /^\w+$/,
                    default: 'no',
                    required: true
                  }
                }
            };
            prompt.message = '';
            prompt.delimiter = '';
            prompt.start();
            prompt.get(schema, function (err, result) {
                if (!result.validate.toLowerCase().includes('no')){
                    console.log(colors.cyan('okay, recreating the file'))
                    fs.writeFileSync('./data/support_db.json', '{}')
                    var array = {};
                
                    console.log('> You can add first your ID and Tag firstly to the database')
                    support_prompt(array)
                } else if (result.validate.toLowerCase().includes('no')){
                    console.log(colors.cyan('okay, adding members to the file!'))
                    var array = JSON.parse(fs.readFileSync('./data/support_db.json', 'utf8'));
                    support_prompt(array)
                }
            });
        } else if (err){  
            fs.writeFileSync('./data/support_db.json', '{}')
            var array = {};
                
            console.log('> You can add first your ID and Tag firstly to the database')
            support_prompt(array)
        }
    });
}

async function support_prompt(array){
    var schema = {
        properties: {
          id: {
            description: colors.white(colors.underline('Please give a user ID: ')),
            type: 'string',
            pattern: /^[0-9]+$/,
            message: 'ID must be only numbers',
            default: '330030648456642562',
            required: true
          },
          tag: {
            description: colors.white(colors.underline('Please give a Discord Tag: ')),
            type: 'string',
            pattern: /^[a-zA-Z0-9\s\-\_\#]+$/,
            message: 'Tag must be only letters, numbers, spaces, dashes, and underscores. Don\'t forget to add the tag at the end (#0000)',
            default: 'Greep#3022',
            required: true
          }
        }
    };
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();
    prompt.get(schema, async function (err, result) {
        if (!result.id){
            console.log('Exiting support data creator...')
            await wait(2000)
            config()
        }
        array[result.id] = {
            "name" : result.tag
        };
        fs.writeFile('./data/support_db.json', JSON.stringify(array), async function(x){
            if (x) {
                console.error(colors.red('----- ERROR: ------'))
                console.error(`We\'re unable to create support data`)
                console.error('Details:')
                console.error(x)
                console.error(colors.red('-------------------'))
                process.exit(10)
            } else {
                console.log(colors.green('Sucess!'))
                var schema = {
                    properties: {
                      validate: {
                        description: colors.white(colors.underline('Do you want to add another person in the support data?') + ' (yes/no):'),
                        type: 'string',
                        pattern: /^\w+$/,
                        default: 'no',
                        required: true
                      }
                    }
                };
                prompt.message = '';
                prompt.delimiter = '';
                prompt.start();
                prompt.get(schema, async function (err, result) {
                    if (!result.validate.toLowerCase().includes('yes')){
                        console.log('Exiting support data creator...')
                        await wait(2000)
                        config()
                    } else if (result.validate.toLowerCase().includes('yes')){
                        return support_prompt(array)
                    }
                });
            }
        });
    });
}

async function config(){
    console.log('\n# Creating configuration:')
    await wait(1000);

    fs.access('./data/config.json', fs.constants.F_OK, (err) => {
        if (!err) {
            console.log(colors.yellow(`Config file exists!`) + colors.cyan(' recreating the file'));
            fs.writeFileSync('./data/config.json', '{}')
            var array = {};
        } else if (err){  
            fs.writeFileSync('./data/config.json', '{}')
            var array = {};
        }
    });

    await wait(1000);

    var schema = {
        properties: {
          token: {
            description: colors.white(colors.underline('Enter bot token') + colors.grey(' (https://discordapp.com/developers):')),
            type: 'string',
            required: true,
            message: colors.red('Please enter a token')
          },
          prefix: {
            description: colors.white(colors.underline('Enter default prefix:')),
            type: 'string',
            default: '!',
            required: true
          },
        }
    };
    prompt.message = '';
    prompt.delimiter = '';
    prompt.start();
    prompt.get(schema, function (err, result) {
        array = {
            "token" : result.token,
            "prefix": result.prefix
        };
        fs.writeFile('./data/config.json', JSON.stringify(array), async function(x){
            if (x) {
                console.error(colors.red('----- ERROR: ------'))
                console.error(`We\'re unable to create config data`)
                console.error('Details:')
                console.error(x)
                console.error(colors.red('-------------------'))
                process.exit(11)
            } else {
                console.log(colors.green('Sucess!'))
            }
        });
    });
}