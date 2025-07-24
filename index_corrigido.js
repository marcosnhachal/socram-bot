const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs-extra");
const path = require("path");

// Importar módulos personalizados
const StickerMaker = require("./utils/stickerMaker");

class WhatsAppBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--no-first-run",
                    "--no-zygote",
                    "--single-process",
                    "--disable-gpu"
                ]
            }
        });

        this.stickerMaker = new StickerMaker();
        
        this.setupEventHandlers();
        this.commands = this.getCommands();
    }

    setupEventHandlers() {
        // Evento para mostrar QR Code
        this.client.on("qr", (qr) => {
            console.log("Escaneie o QR Code abaixo com seu WhatsApp:");
            qrcode.generate(qr, { small: true });
        });

        // Evento quando o cliente está pronto
        this.client.on("ready", () => {
            console.log("Bot WhatsApp está pronto!");
            console.log("Comandos de sticker: !sticker, !fig, !texto");
            console.log("Digite !ajuda para ver todos os comandos");
        });

        // Evento para mensagens recebidas
        this.client.on("message", async (message) => {
            await this.handleMessage(message);
        });

        // Evento para erros
        this.client.on("auth_failure", (msg) => {
            console.error("Falha na autenticação:", msg);
        });

        this.client.on("disconnected", (reason) => {
            console.log("Cliente desconectado:", reason);
        });
    }

    async handleMessage(message) {
        try {
            // Ignorar mensagens de status e grupos (opcional)
            if (message.isStatus) return;
            
            const text = message.body.toLowerCase().trim();
            const isCommand = text.startsWith("!");
            
            if (!isCommand) return;

            const [command, ...args] = text.split(" ");
            const query = args.join(" ");

            console.log(`Comando recebido: ${command} de ${message.from}`);

            // Executar comando
            if (this.commands[command]) {
                await this.commands[command](message, query);
            } else {
                await message.reply("Comando não reconhecido. Digite !ajuda para ver os comandos disponíveis.");
            }

        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
            await message.reply("Ocorreu um erro ao processar sua solicitação. Tente novamente.");
        }
    }

    getCommands() {
        return {
            "!ajuda": this.helpCommand.bind(this),
            "!help": this.helpCommand.bind(this),
            
            // Comandos de sticker
            "!sticker": this.stickerCommand.bind(this),
            "!fig": this.stickerCommand.bind(this),
            "!figurinha": this.stickerCommand.bind(this),
            "!texto": this.textStickerCommand.bind(this),
            
            // Comandos utilitários
            "!ping": this.pingCommand.bind(this),
            "!status": this.statusCommand.bind(this),
            "!sobremim": this.aboutMeCommand.bind(this)
        };
    }

    async helpCommand(message) {
        const helpText = `
Bot WhatsApp - Comandos Disponíveis

STICKERS:
• !sticker - Converte imagem em sticker (responda uma imagem)
• !fig - Converte imagem em sticker (responda uma imagem)
• !texto [texto] - Cria sticker com texto

UTILITÁRIOS:
• !ping - Testa se o bot está funcionando
• !status - Mostra status do bot
• !ajuda - Mostra esta mensagem
• !sobremim - Informações sobre o criador do bot

Como usar:
• Para sticker: Envie uma imagem e responda com !sticker
• Para texto: !texto Olá Mundo
        `;
        
        await message.reply(helpText);
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
                await message.reply("Por favor, envie uma imagem ou responda a uma imagem com !sticker");
                return;
            }

            // Verificar se é uma imagem
            if (!media.mimetype.startsWith("image/")) {
                await message.reply("Por favor, envie apenas imagens (JPG, PNG, GIF, etc.)");
                return;
            }

            await message.reply("Criando sticker... Aguarde.");

            const imageBuffer = Buffer.from(media.data, "base64");
            
            // Verificar se é GIF animado
            const isAnimated = media.mimetype === "image/gif";
            
            let stickerBuffer;
            if (isAnimated) {
                stickerBuffer = await this.stickerMaker.createAnimatedSticker(imageBuffer);
            } else {
                stickerBuffer = await this.stickerMaker.createSticker(imageBuffer);
            }

            const stickerMedia = new MessageMedia("image/webp", stickerBuffer.toString("base64"));
            
            await this.client.sendMessage(message.from, stickerMedia, { 
                sendMediaAsSticker: true 
            });

            console.log("Sticker criado e enviado");

        } catch (error) {
            console.error("Erro ao criar sticker:", error);
            await message.reply("Erro ao criar sticker. Verifique se a imagem é válida.");
        }
    }

    async textStickerCommand(message, query) {
        if (!query) {
            await message.reply("Por favor, forneça o texto para o sticker.\nExemplo: !texto Olá Mundo");
            return;
        }

        try {
            await message.reply("Criando sticker de texto... Aguarde.");

            const stickerBuffer = await this.stickerMaker.createTextSticker(query, {
                fontSize: 40,
                fontColor: "#000000",
                backgroundColor: "#FFFFFF"
            });

            const stickerMedia = new MessageMedia("image/webp", stickerBuffer.toString("base64"));
            
            await this.client.sendMessage(message.from, stickerMedia, { 
                sendMediaAsSticker: true 
            });

            console.log(`Sticker de texto criado: ${query}`);

        } catch (error) {
            console.error("Erro ao criar sticker de texto:", error);
            await message.reply("Erro ao criar sticker de texto. Tente novamente.");
        }
    }

    async pingCommand(message) {
        const start = Date.now();
        const reply = await message.reply("Pong!");
        const end = Date.now();
        
        await reply.edit(`Pong! Latência: ${end - start}ms`);
    }

    async statusCommand(message) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const statusText = `
Status do Bot

Status: Online
Tempo ativo: ${hours}h ${minutes}m ${seconds}s
WhatsApp: Conectado
Sticker Maker: Funcionando

Bot desenvolvido para criar stickers
        `;

        await message.reply(statusText);
    }

    async aboutMeCommand(message) {
        const aboutMeText = `
Sobre o Criador do Bot

Nome: Marcos Uilissone Nhachale
Formação: Estudante de Física Aplicada
Origem: Natural de Mabote, província de Inhambane
        `;
        await message.reply(aboutMeText);
    }

    async start() {
        console.log("Iniciando Bot WhatsApp...");
        await this.client.initialize();
    }

    async stop() {
        console.log("Parando Bot WhatsApp...");
        await this.client.destroy();
    }
}

// Inicializar o bot
const bot = new WhatsAppBot();

// Manipular sinais de sistema para parada limpa
process.on("SIGINT", async () => {
    console.log("\nRecebido sinal de parada...");
    await bot.stop();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("\nRecebido sinal de término...");
    await bot.stop();
    process.exit(0);
});

// Iniciar o bot
bot.start().catch(error => {
    console.error("Erro ao iniciar o bot:", error);
    process.exit(1);
});

module.exports = WhatsAppBot;

