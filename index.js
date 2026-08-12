const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('rcon-client');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Bot online como ${client.user.tag}!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('addwhitelist')
            .setDescription('Adiciona um nick à whitelist')
            .addStringOption(option => option.setName('nick').setDescription('Nick').setRequired(true)),
        new SlashCommandBuilder()
            .setName('removerwhitelist')
            .setDescription('Remove um nick da whitelist')
            .addStringOption(option => option.setName('nick').setDescription('Nick').setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Comandos registrados!');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const nick = interaction.options.getString('nick');
    await interaction.deferReply();

    try {
        const rcon = await Rcon.connect({
            host: process.env.RCON_HOST,
            port: parseInt(process.env.RCON_PORT),
            password: process.env.RCON_PASSWORD
        });

        if (interaction.commandName === 'addwhitelist') {
            await rcon.send(`addwhiteliste ${nick}`);
            await interaction.editReply(`Sucesso! Nick **${nick}** adicionado à whitelist.`);
        } else if (interaction.commandName === 'removerwhitelist') {
            await rcon.send(`removerwhitelist ${nick}`);
            await interaction.editReply(`Sucesso! Nick **${nick}** removido da whitelist.`);
        }

        await rcon.end();
    } catch (error) {
        console.error(error);
        await interaction.editReply(`Erro ao conectar no RCON do servidor.`);
    }
});

client.login(TOKEN);