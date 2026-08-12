const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('samp-rcon');

// COLE AQUI SUAS INFORMAÇÕES:
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

// Dados RCON do seu servidor na LemeHost (pegue no painel deles)
const rcon = new Rcon({
    host: 'I142.132.203.47', // Ex: s1.lemehost.com (sem a porta)
    port: parseInt('19291'),   // Porta RCON fornecida pela LemeHost
    password: 'Lucas1508'          // Senha RCON do painel
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Bot online!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('addwhitelist')
            .setDescription('Adiciona um nick à whitelist')
            .addStringOption(option =>
                option.setName('nick')
                    .setDescription('Nick do jogador')
                    .setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Comando /addwhitelist registrado com sucesso!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'addwhitelist') {
        const nick = interaction.options.getString('nick');
        await interaction.deferReply();

        try {
            await rcon.connect();
            await rcon.execute(`addwl ${nick}`); 
            await rcon.disconnect();

            return interaction.editReply(`Sucesso! O nick **${nick}** foi autorizado na whitelist.`);
        } catch (error) {
            console.error(error);
            return interaction.editReply(`Erro ao conectar com o servidor da LemeHost.`);
        }
    }
});

client.login(TOKEN);