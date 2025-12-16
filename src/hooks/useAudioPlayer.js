import { useState, useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { AUDIO_FILES } from '../constants/notes';
import { getRandomNote } from '../services/noteService';

export const useAudioPlayer = (level) => {
  const [correctNote, setCorrectNote] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [buttonWidth, setButtonWidth] = useState(0);
  
  const playerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  const onButtonLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    setButtonWidth(width);
  }, []);

  const playRandomNote = useCallback(async () => {
    try {
      console.log('playRandomNote iniciado');

      // Liberar player anterior se existir
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch (e) {
          console.warn('Erro ao liberar player anterior:', e);
        }
        playerRef.current = null;
      }

      // Escolher nota aleatória baseada no nível
      const selectedNote = getRandomNote(level);
      console.log('Nota selecionada:', selectedNote);
      
      setCorrectNote(selectedNote);

      // Verificar se o arquivo de áudio existe
      const audioFile = AUDIO_FILES[selectedNote];
      if (!audioFile) {
        throw new Error(`Arquivo de áudio não encontrado para nota: ${selectedNote}`);
      }

      // Criar novo player
      const player = createAudioPlayer(audioFile);
      
      if (!player) {
        throw new Error('Falha ao criar player de áudio');
      }

      playerRef.current = player;
      
      // Listener para quando terminar de tocar
      player.addListener('playbackStatusUpdate', (status) => {
        try {
          if (status.didJustFinish) {
            console.log('Áudio terminou de tocar');
            setIsPlaying(false);
            
            if (animationRef.current) {
              animationRef.current.stop();
            }
            
            progressAnim.setValue(1);
            setTimeout(() => {
              progressAnim.setValue(0);
            }, 150);
          }
        } catch (e) {
          console.error('Erro no listener de status:', e);
        }
      });

      setIsPlaying(true);
      
      // Iniciar animação de progresso
      progressAnim.setValue(0);
      
      if (animationRef.current) {
        animationRef.current.stop();
      }

      animationRef.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      });
      
      animationRef.current.start();
      
      console.log('Tocando áudio:', selectedNote);
      await player.play();
      console.log('Áudio iniciou com sucesso');
    } catch (error) {
      console.error('Erro ao tocar nota:', error);
      setLoadError(error.message);
    }
  }, [level, progressAnim]);

  const playAgain = useCallback(async () => {
    if (!correctNote || isPlaying) return;

    try {
      if (playerRef.current) {
        console.log('Tocando novamente');
        await playerRef.current.seekTo(0);
        await playerRef.current.play();
        setIsPlaying(true);
        
        progressAnim.setValue(0);
        
        if (animationRef.current) {
          animationRef.current.stop();
        }

        animationRef.current = Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        });
        animationRef.current.start();
      }
    } catch (error) {
      console.error('Erro ao tocar novamente:', error);
    }
  }, [correctNote, isPlaying, progressAnim]);

  useEffect(() => {
    // Cleanup do player
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch (e) {
          console.error('Erro ao liberar player:', e);
        }
      }
    };
  }, []);

  return {
    correctNote,
    isPlaying,
    loadError,
    buttonWidth,
    progressAnim,
    playRandomNote,
    playAgain,
    onButtonLayout,
  };
};
