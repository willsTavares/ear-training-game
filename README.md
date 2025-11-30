# Ear Training Game - React Native

Jogo de treino de ouvido musical desenvolvido com React Native e Expo.

## 📋 Requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI
- Arquivos de áudio (.wav) para cada nota em `assets/sound/`

## 🎵 Arquivos de Áudio Necessários

Certifique-se de ter os seguintes arquivos na pasta `assets/sound/`:

- C.wav
- D.wav
- E.wav
- F.wav
- G.wav
- A.wav
- B.wav

## 🚀 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Inicie o projeto:
```bash
npm start
```

3. Escaneie o QR code com o aplicativo Expo Go (iOS/Android) ou pressione:
   - `a` para abrir no Android
   - `i` para abrir no iOS
   - `w` para abrir no navegador

## 🎮 Como Jogar

1. O app tocará uma nota musical aleatória
2. Clique no botão correspondente à nota que você ouviu
3. Acertos aumentam sua pontuação (+1)
4. Erros diminuem suas vidas (-1)
5. O jogo termina quando você perde todas as 3 vidas
6. Use o botão "Ouvir Novamente" para repetir a nota atual

## 🛠️ Tecnologias

- React Native
- Expo
- expo-av (para reprodução de áudio)

## 📱 Funcionalidades

- ✅ Reprodução de notas musicais aleatórias
- ✅ Sistema de pontuação
- ✅ Sistema de vidas (3 vidas)
- ✅ Feedback visual de acertos e erros
- ✅ Botão para ouvir a nota novamente
- ✅ Tela de Game Over
- ✅ Botão de reiniciar jogo
- ✅ Interface responsiva e intuitiva
