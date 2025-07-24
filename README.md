# 🤖 Bot WhatsApp - Música e Stickers

Um bot completo para WhatsApp que permite baixar músicas do YouTube e criar stickers personalizados.

## 🚀 Funcionalidades

### 🎵 Download de Música
- Baixar músicas do YouTube por nome ou URL
- Buscar músicas no YouTube
- Conversão automática para MP3
- Suporte a playlists e vídeos individuais

### 🎨 Criação de Stickers
- Converter imagens em stickers para WhatsApp
- Suporte a imagens estáticas e GIFs animados
- Criar stickers com texto personalizado
- Redimensionamento automático para formato WhatsApp

## 📋 Pré-requisitos

### Sistema
- Node.js 16+ instalado
- Python 3.7+ instalado
- Sistema operacional: Windows, macOS ou Linux

### Dependências Python
```bash
pip install yt-dlp
```

## 🛠️ Instalação

1. **Clone ou baixe o projeto:**
```bash
git clone <url-do-projeto>
cd whatsapp-bot
```

2. **Instale as dependências Node.js:**
```bash
npm install
```

3. **Verifique se o yt-dlp está instalado:**
```bash
yt-dlp --version
```

## 🎯 Como Usar

### 1. Iniciar o Bot
```bash
npm start
```

### 2. Conectar ao WhatsApp
1. Execute o comando acima
2. Um QR Code aparecerá no terminal
3. Abra o WhatsApp no seu celular
4. Vá em **Dispositivos Conectados** > **Conectar um dispositivo**
5. Escaneie o QR Code
6. Aguarde a mensagem "Bot WhatsApp está pronto!"

### 3. Comandos Disponíveis

#### 🎵 Comandos de Música
- `!musica [nome/url]` - Baixa música do YouTube
- `!mp3 [nome/url]` - Baixa música em formato MP3
- `!buscar [nome]` - Busca músicas no YouTube

**Exemplos:**
```
!musica Imagine Dragons Believer
!mp3 https://youtube.com/watch?v=abc123
!buscar The Beatles Hey Jude
```

#### 🎨 Comandos de Sticker
- `!sticker` - Converte imagem em sticker (responda uma imagem)
- `!fig` - Mesmo que !sticker
- `!texto [texto]` - Cria sticker com texto

**Exemplos:**
```
!sticker (responda uma imagem)
!texto Olá Mundo
!fig (responda um GIF)
```

#### ℹ️ Comandos Utilitários
- `!ajuda` - Mostra lista de comandos
- `!ping` - Testa se o bot está funcionando
- `!status` - Mostra status do bot

## 📁 Estrutura do Projeto

```
whatsapp-bot/
├── index.js                 # Arquivo principal do bot
├── utils/
│   ├── musicDownloader.js   # Módulo de download de música
│   └── stickerMaker.js      # Módulo de criação de stickers
├── downloads/               # Músicas baixadas
├── temp/                    # Arquivos temporários
├── package.json             # Dependências Node.js
└── README.md               # Este arquivo
```

## ⚙️ Configurações Avançadas

### Qualidade de Áudio
Edite `utils/musicDownloader.js` linha 45 para alterar a qualidade:
```javascript
const command = `yt-dlp -x --audio-format ${format} --audio-quality 0 ...`;
// 0 = melhor qualidade, 9 = menor qualidade
```

### Configurações de Sticker
Edite `utils/stickerMaker.js` para personalizar:
- Tamanho máximo (padrão: 512x512)
- Qualidade WebP (padrão: 80)
- Cores de fundo e borda

## 🔧 Solução de Problemas

### Erro: "yt-dlp não encontrado"
```bash
# Instale o yt-dlp
pip install yt-dlp

# Ou via apt (Ubuntu/Debian)
sudo apt install yt-dlp
```

### Erro: "Falha na autenticação"
1. Delete a pasta `.wwebjs_auth`
2. Reinicie o bot
3. Escaneie o QR Code novamente

### Erro: "Módulo não encontrado"
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Bot não responde
1. Verifique se o WhatsApp Web está funcionando
2. Reinicie o bot
3. Verifique a conexão com a internet

## 📱 Comandos de Exemplo

### Download de Música
```
Usuário: !musica Bohemian Rhapsody Queen
Bot: 🔍 Buscando música... Aguarde um momento.
Bot: [Envia arquivo de áudio MP3]
```

### Busca de Música
```
Usuário: !buscar Imagine Dragons
Bot: 🎵 Resultados da busca para: Imagine Dragons

1. Believer - Imagine Dragons
   👤 ImagineDragonsVEVO
   ⏱️ 3:24
   🔗 https://youtube.com/watch?v=...

2. Thunder - Imagine Dragons
   👤 ImagineDragonsVEVO
   ⏱️ 3:07
   🔗 https://youtube.com/watch?v=...
```

### Criação de Sticker
```
Usuário: [Envia uma imagem]
Usuário: !sticker
Bot: 🎨 Criando sticker... Aguarde.
Bot: [Envia sticker criado]
```

## 🚨 Avisos Importantes

1. **Uso Responsável**: Use apenas para conteúdo que você tem direito de baixar
2. **Limites do WhatsApp**: O WhatsApp pode ter limites de envio de arquivos
3. **Armazenamento**: Arquivos baixados ocupam espaço em disco
4. **Conexão**: Mantenha uma conexão estável com a internet

## 🔄 Atualizações

Para atualizar o bot:
1. Baixe a versão mais recente
2. Substitua os arquivos (mantenha a pasta `.wwebjs_auth`)
3. Execute `npm install` para atualizar dependências
4. Reinicie o bot

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no terminal
2. Consulte a seção "Solução de Problemas"
3. Verifique se todas as dependências estão instaladas

## 📄 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ para facilitar o uso do WhatsApp**

