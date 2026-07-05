# Ear Training Game - React Native

Jogo de treino de ouvido musical desenvolvido com React Native e Expo.

## 📋 Requisitos

- Node.js 18 ou superior
- npm
- Conta Expo (para builds com EAS)

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
5. A cada 5 acertos você sobe de nível e novas notas são adicionadas
6. O jogo termina quando você perde todas as 3 vidas
7. Use o botão de play para repetir a nota atual

## 🎵 Arquivos de Áudio

As notas ficam em `assets/sound/` no formato `.wav` (uma oitava completa com
sustenidos): `c1.wav`, `c1s.wav`, `d1.wav`, `d1s.wav`, `e1.wav`, `f1.wav`,
`f1s.wav`, `g1.wav`, `g1s.wav`, `a1.wav`, `a1s.wav`, `b1.wav`, `c2.wav`.

## 📦 Build de Produção (Google Play Store)

### Via GitHub Actions (recomendado)

O workflow [.github/workflows/build-production.yml](.github/workflows/build-production.yml)
gera um **AAB assinado** como artefato, pronto para upload no Google Play Console.

Configuração (uma única vez):

1. Crie um access token em https://expo.dev/settings/access-tokens
2. No GitHub, adicione o secret `EXPO_TOKEN` em *Settings > Secrets and variables > Actions*
3. Garanta que a keystore Android está gerenciada pelo EAS (rode `eas credentials`
   localmente uma vez, ou faça um primeiro build interativo com `eas build -p android`)

Para disparar o build:

- Crie uma tag de versão: `git tag v1.0.0 && git push origin v1.0.0`, **ou**
- Rode manualmente na aba *Actions* do GitHub (workflow_dispatch)

Ao final, baixe o artefato `ear-training-game-production-aab` na página do
workflow e faça o upload no Google Play Console.

> Antes de cada nova versão, incremente `version` e `android.versionCode`
> em [app.config.js](app.config.js) — a Play Store rejeita `versionCode` repetido.

### Via EAS Cloud (alternativa)

```bash
npx eas build --platform android --profile production
```

## 🛠️ Tecnologias

- React Native + Expo (SDK 54)
- expo-audio (reprodução das notas)
- expo-haptics (feedback tátil)
- react-native-view-shot + expo-sharing (compartilhar resultado)

## 📱 Funcionalidades

- ✅ Reprodução de notas musicais aleatórias
- ✅ 10 níveis progressivos (de 2 notas até a escala cromática completa)
- ✅ Sistema de pontuação e vidas (3 vidas)
- ✅ Feedback visual, sonoro e tátil de acertos e erros
- ✅ Tela de Game Over com compartilhamento do resultado
- ✅ Interface responsiva e intuitiva
