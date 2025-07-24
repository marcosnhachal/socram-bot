const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');

// Importar módulos personalizados
const MusicDownloader = require('./utils/musicDownloader');
const StickerMaker = require('./utils/stickerMaker');

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu'
                ]
            }
        });

        this.musicDownloader = new MusicDownloader();
        this.stickerMaker = new StickerMaker();
        
        this.setupEventHandlers();
        this.commands = this.getCommands();
    }

    setupEventHandlers() {
        // Evento para mostrar QR Code
        this.client.on('qr', (qr) => {
            console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
            qrcode.generate(qr, { small: true });
        });

        // Evento quando o cliente está pronto
        this.client.on('ready', () => {
            console.log('✅ Bot WhatsApp está pronto!');
            console.log('🎵 Comandos de música: !musica, !mp3, !buscar');
            console.log('🎨 Comandos de sticker: !sticker, !fig, !texto');
            console.log('ℹ️  Digite !ajuda para ver todos os comandos');
        });

        // Evento para mensagens recebidas
        this.client.on('message', async (message) => {
            await this.handleMessage(message);
        });

        // Evento para erros
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Falha na autenticação:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('🔌 Cliente desconectado:', reason);
        });
    }

    async handleMessage(message) {
        try {
            // Ignorar mensagens de status e grupos (opcional)
            if (message.isStatus) return;
            
            const text = message.body.toLowerCase().trim();
            const isCommand = text.startsWith('!');
            
            if (!isCommand) return;

            const [command, ...args] = text.split(' ');
            const query = args.join(' ');

            console.log(`📨 Comando recebido: ${command} de ${message.from}`);

            // Executar comando
            if (this.commands[command]) {
                await this.commands[command](message, query);
            } else {
                await message.reply('❓ Comando não reconhecido. Digite !ajuda para ver os comandos disponíveis.');
            }

        } catch (error) {
            console.error('❌ Erro ao processar mensagem:', error);
            await message.reply('❌ Ocorreu um erro ao processar sua solicitação. Tente novamente.');
        }
    }

    getCommands() {
        return {
            '!ajuda': this.helpCommand.bind(this),
            '!help': this.helpCommand.bind(this),
            
            // Comandos de música
            '!musica': this.musicCommand.bind(this),
            '!mp3': this.musicCommand.bind(this),
            '!baixar': this.musicCommand.bind(this),
            '!buscar': this.searchCommand.bind(this),
            
            // Comandos de sticker
            '!sticker': this.stickerCommand.bind(this),
            '!fig': this.stickerCommand.bind(this),
            '!figurinha': this.stickerCommand.bind(this),
            '!texto': this.textStickerCommand.bind(this),
            
            // Comandos utilitários
            '!ping': this.pingCommand.bind(this),
            '!status': this.statusCommand.bind(this)
        };
    }

    async helpCommand(message) {
        const helpText = `
🤖 *Bot WhatsApp - Comandos Disponíveis*

🎵 *MÚSICA:*
• !musica [nome/url] - Baixa música do YouTube
• !mp3 [nome/url] - Baixa música em MP3
• !buscar [nome] - Busca músicas no YouTube

🎨 *STICKERS:*
• !sticker - Converte imagem em sticker (responda uma imagem)
• !fig - Converte imagem em sticker (responda uma imagem)
• !texto [texto] - Cria sticker com texto

ℹ️ *UTILITÁRIOS:*
• !ping - Testa se o bot está funcionando
• !status - Mostra status do bot
• !ajuda - Mostra esta mensagem

📝 *Como usar:*
• Para música: !musica Imagine Dragons Believer
• Para sticker: Envie uma imagem e responda com !sticker
• Para texto: !texto Olá Mundo
        `;
        
        await message.reply(helpText);
    }

    async musicCommand(message, query) {
        if (!query) {
            await message.reply('❓ Por favor, forneça o nome da música ou URL do YouTube.\nExemplo: !musica Imagine Dragons Believer');
            return;
        }

        try {
            await message.reply('🔍 Buscando música... Aguarde um momento.');
            
            const audioPath = await this.musicDownloader.downloadAudio(query, 'mp3');
            
            if (!fs.existsSync(audioPath)) {
                await message.reply('❌ Não foi possível baixar a música. Tente novamente.');
                return;
            }

            const media = MessageMedia.fromFilePath(audioPath);
            const fileName = path.basename(audioPath, '.mp3');
            
            await message.reply(media, undefined, { 
                caption: `🎵 *${fileName}*\n\n_Baixado pelo Bot WhatsApp_ 🤖` 
            });

            console.log(`✅ Música enviada: ${fileName}`);

        } catch (error) {
            console.error('❌ Erro no comando de música:', error);
            await message.reply('❌ Erro ao baixar música. Verifique se o nome/URL está correto.');
        }
    }

    async searchCommand(message, query) {
        if (!query) {
            await message.reply('❓ Por favor, forneça o termo de busca.\nExemplo: !buscar Imagine Dragons');
            return;
        }

        try {
            await message.reply('🔍 Buscando músicas... Aguarde.');
            
            const results = await this.musicDownloader.searchMusic(query, 5);
            
            if (results.length === 0) {
                await message.reply('❌ Nenhuma música encontrada para este termo.');
                return;
            }

            let searchText = `🎵 *Resultados da busca para: ${query}*\n\n`;
            
            results.forEach((result, index) => {
                searchText += `${index + 1}. *${result.title}*\n`;
                searchText += `   👤 ${result.uploader}\n`;
                searchText += `   ⏱️ ${result.duration}\n`;
                searchText += `   🔗 ${result.url}\n\n`;
            });

            searchText += '_Para baixar, use: !musica [URL ou nome da música]_';
            
            await message.reply(searchText);

        } catch (error) {
            console.error('❌ Erro na busca:', error);
            await message.reply('❌ Erro ao buscar músicas. Tente novamente.');
        }
    }

    async stickerCommand(message, query) {
        try {
            // Verificar se a mensagem tem mídia ou se é uma resposta a uma imagem
            let media = null;
            
            if (message.hasMedia) {
                media = await message.downloadMedia();
            } else if (message.hasQuotedMsg) {
                const quotedMsg = await message.getQuotedMessage();
                if (quotedMsg.hasMedia) {
                    media = await quotedMsg.downloadMedia();
                }
            }

            if (!media) {
                await message.reply('❓ Por favor, envie uma imagem ou responda a uma imagem com !sticker');
                return;
            }

            // Verificar se é uma imagem
            if (!media.mimetype.startsWith('image/')) {
                await message.reply('❌ Por favor, envie apenas imagens (JPG, PNG, GIF, etc.)');
                return;
            }

            await message.reply('🎨 Criando sticker... Aguarde.');

            const imageBuffer = Buffer.from(media.data, 'base64');
            
            // Verificar se é GIF animado
            const isAnimated = media.mimetype === 'image/gif';
            
            let stickerBuffer;
            if (isAnimated) {
                stickerBuffer = await this.stickerMaker.createAnimatedSticker(imageBuffer);
            } else {
                stickerBuffer = await this.stickerMaker.createSticker(imageBuffer);
            }

            const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));
            
            await this.client.sendMessage(message.from, stickerMedia, { 
                sendMediaAsSticker: true 
            });

            console.log('✅ Sticker criado e enviado');

        } catch (error) {
            console.error('❌ Erro ao criar sticker:', error);
            await message.reply('❌ Erro ao criar sticker. Verifique se a imagem é válida.');
        }
    }

    async textStickerCommand(message, query) {
        if (!query) {
            await message.reply('❓ Por favor, forneça o texto para o sticker.\nExemplo: !texto Olá Mundo');
            return;
        }

        try {
            await message.reply('✍️ Criando sticker de texto... Aguarde.');

            const stickerBuffer = await this.stickerMaker.createTextSticker(query, {
                fontSize: 40,
                fontColor: '#000000',
                backgroundColor: '#FFFFFF'
            });

            const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'));
            
            await this.client.sendMessage(message.from, stickerMedia, { 
                sendMediaAsSticker: true 
            });

            console.log(`✅ Sticker de texto criado: ${query}`);

        } catch (error) {
            console.error('❌ Erro ao criar sticker de texto:', error);
            await message.reply('❌ Erro ao criar sticker de texto. Tente novamente.');
        }
    }

    async pingCommand(message) {
        const start = Date.now();
        const reply = await message.reply('🏓 Pong!');
        const end = Date.now();
        
        await reply.edit(`🏓 Pong! Latência: ${end - start}ms`);
    }

    async statusCommand(message) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const statusText = `
🤖 *Status do Bot*

✅ Status: Online
⏱️ Tempo ativo: ${hours}h ${minutes}m ${seconds}s
📱 WhatsApp: Conectado
🎵 Downloader: Funcionando
🎨 Sticker Maker: Funcionando

_Bot desenvolvido para baixar músicas e criar stickers_
        `;

        await message.reply(statusText);
    }

    async start() {
        console.log('🚀 Iniciando Bot WhatsApp...');
        await this.client.initialize();
    }

    async stop() {
        console.log('🛑 Parando Bot WhatsApp...');
        await this.client.destroy();
    }
}

// Inicializar o bot
const bot = new WhatsAppBot();

// Manipular sinais de sistema para parada limpa
process.on('SIGINT', async () => {
    console.log('\n🛑 Recebido sinal de parada...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Recebido sinal de término...');
    await bot.stop();
    process.exit(0);
});

// Iniciar o bot
bot.start().catch(error => {
    console.error('❌ Erro ao iniciar o bot:', error);
    process.exit(1);
});

module.exports = WhatsAppBot;

