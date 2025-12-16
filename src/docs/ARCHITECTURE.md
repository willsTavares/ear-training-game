# Ear Training Game - Arquitetura

## 📁 Estrutura do Projeto

```
src/
├── screens/
│   └── GameScreen.js          # Tela principal (orquestração)
│
├── components/
│   ├── GameHeader.js          # Barra com score, level e vidas
│   ├── PlayControls.js        # Botões Play e Replay
│   ├── AnswerButtons.js       # Grid de botões de notas
│   ├── LevelTransition.js     # Overlay de transição de nível
│   ├── ShakeContainer.js      # Container com animação de shake
│   └── index.js               # Exports
│
├── hooks/
│   ├── useGameState.js        # Estado do jogo (score, vidas, level)
│   ├── useAudioPlayer.js      # Reprodução de áudio
│   ├── useLevelProgress.js    # Progressão de níveis
│   ├── useHaptics.js          # Feedback tátil
│   ├── useAnimations.js       # Todas as animações
│   └── index.js               # Exports
│
├── services/
│   └── noteService.js         # Lógica de notas (sorteio, validação)
│
├── theme/
│   ├── colors.js              # Paleta de cores e cores por nível
│   ├── spacing.js             # Espaçamentos e border radius
│   ├── typography.js          # Fontes e tamanhos
│   └── index.js               # Exports
│
└── constants/
    ├── notes.js               # Constantes de notas e áudio
    └── levels.js              # Configuração de níveis
```

## 🎯 Responsabilidades

### Screens
- **GameScreen.js**: Orquestra hooks e renderiza componentes. Não contém lógica complexa.

### Components
Todos são **stateless** e controlados por props:
- **GameHeader**: Exibe pontuação, nível e vidas
- **PlayControls**: Botões de play e restart com animação de progresso
- **AnswerButtons**: Grid responsivo de botões de notas
- **LevelTransition**: Overlay animado de transição entre níveis
- **ShakeContainer**: Wrapper para animação de shake em erros

### Hooks
Cada hook tem **uma responsabilidade**:
- **useGameState**: Gerencia estado do jogo (score, vidas, level, gameOver)
- **useAudioPlayer**: Load, play, unload de sons
- **useLevelProgress**: Detecta e dispara progressão de nível
- **useHaptics**: Feedback tátil (vibração)
- **useAnimations**: Centraliza todas as Animated.Values e animações

### Services
Lógica pura sem dependências do React:
- **noteService**: Sorteia notas e valida respostas

### Theme
Constantes visuais reutilizáveis:
- **colors.js**: Cores base + cores por nível
- **spacing.js**: Espaçamentos e border radius
- **typography.js**: Fontes e tamanhos de texto

### Constants
- **notes.js**: Lista de notas e mapeamento de arquivos de áudio
- **levels.js**: Configuração de notas por nível e progressão

## 📝 Exemplo de Uso

### Adicionando um novo hook:
```javascript
// src/hooks/useNewFeature.js
export const useNewFeature = () => {
  // lógica aqui
  return { ... };
};

// src/hooks/index.js
export { useNewFeature } from './useNewFeature';

// src/screens/GameScreen.js
import { useNewFeature } from '../hooks';
```

### Adicionando um novo componente:
```javascript
// src/components/NewComponent.js
export const NewComponent = ({ prop1, prop2 }) => {
  return <View>...</View>;
};

// src/components/index.js
export { NewComponent } from './NewComponent';
```

## ✅ Benefícios

1. **Manutenibilidade**: Código organizado e fácil de encontrar
2. **Testabilidade**: Hooks e services podem ser testados isoladamente
3. **Reusabilidade**: Componentes e hooks são reutilizáveis
4. **Escalabilidade**: Fácil adicionar novos modos, animações ou features
5. **Legibilidade**: GameScreen com ~280 linhas vs 1000+ antes

## 🚀 Próximos Passos

- Adicionar testes unitários para hooks e services
- Criar storybook para componentes
- Adicionar TypeScript para type safety
- Implementar novos modos de jogo (ex: modo rítmico, modo melódico)
