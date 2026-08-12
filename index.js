const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('samp-rcon');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const rcon = new Rcon({
    host: process.env.RCON_HOST,
    port: parseInt(process.env.RCON_PORT),
    password: process.env.RCON_PASSWORD
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Bot online como ${client.user.tag}!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('addwhitelist')
            .setDescription('Adiciona um nick à whitelist do servidor')
            .addStringOption(option =>
                option.setName('nick')
                    .setDescription('Nick do jogador')
                    .setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Comando /addwhitelist registrado no Discord com sucesso!');
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
            return interaction.editReply(`Erro ao conectar via RCON com o servidor.`);
        }
    }
});

client.login(TOKEN);