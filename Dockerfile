# Use Node.js 18 LTS como base
FROM node:18-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências Node.js
RUN npm ci --only=production

# Copiar código fonte
# Copiar a pasta utils explicitamente
COPY utils ./utils

# Copiar o restante do código fonte
COPY . .

# Criar diretórios necessários
RUN mkdir -p downloads temp

# Expor porta (se necessário para alguns serviços)
EXPOSE 3000

# Comando para iniciar o bot
CMD ["npm", "start"]

