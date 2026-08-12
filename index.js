const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { Rcon } = require('samp-rcon');

// Pega as chaves confidenciais da "caixa forte" do Render
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

// Configuração da conexão RCON com o servidor da LemeHost via variáveis de ambiente
const rcon = new Rcon({
    host: process.env.RCON_HOST,
    port: parseInt(process.env.RCON_PORT),
    password: process.env.RCON_PASSWORD
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`Bot online como ${client.user.tag}!`);

    // Definindo os comandos /addwhitelist e /removerwhitelist
    const commands = [
        new SlashCommandBuilder()
            .setName('addwhitelist')
            .setDescription('Adiciona um nick à whitelist do servidor')
            .addStringOption(option =>
                option.setName('nick')
                    .setDescription('Nick do jogador')
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName('removerwhitelist')
            .setDescription('Remove um nick da whitelist do servidor')
            .addStringOption(option =>
                option.setName('nick')
                    .setDescription('Nick do jogador')
                    .setRequired(true))
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('Comandos de whitelist registrados no Discord com sucesso!');
    } catch (error) {
        console.error(error);
    }
});

// Ações executadas quando alguém usa o comando no Discord
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const nick = interaction.options.getString('nick');
    await interaction.deferReply();

    try {
        // Conecta no servidor da LemeHost via RCON
        await rcon.connect();

        if (interaction.commandName === 'addwhitelist') {
            // Executa o comando exato do seu servidor SA-MP
            await rcon.execute(`addwhiteliste ${nick}`);
            await interaction.editReply(`Sucesso! O nick **${nick}** foi adicionado à whitelist.`);
        } 
        else if (interaction.commandName === 'removerwhitelist') {
            await rcon.execute(`removerwhitelist ${nick}`);
            await interaction.editReply(`Sucesso! O nick **${nick}** foi removido da whitelist.`);
        }

        // Fecha a conexão RCON após enviar o comando
        await rcon.disconnect();

    } catch (error) {
        console.error(error);
        await interaction.editReply(`Erro ao conectar via RCON com o servidor. Verifique se a LemeHost está ligada.`);
    }
});

client.login(TOKEN);