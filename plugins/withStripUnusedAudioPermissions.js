const { withAndroidManifest } = require('expo/config-plugins');

// O módulo nativo do expo-audio declara, no seu próprio AndroidManifest.xml,
// permissões e serviços para recursos opcionais que este jogo não usa:
// gravação de áudio (RECORD_AUDIO) e sessão de mídia em segundo plano com
// controles de notificação/lock screen (FOREGROUND_SERVICE_MEDIA_PLAYBACK).
// O Ear Training Game só toca efeitos sonoros curtos em primeiro plano via
// createAudioPlayer().play() e nunca chama setAudioModeAsync com
// shouldPlayInBackground, então esse serviço nunca é iniciado.
//
// Declarar essas permissões sem usá-las gera reprovação/flag no formulário
// de "Declaração de permissões" do Google Play Console. Removemos aqui via
// tools:node="remove" para que o manifest final reflita o comportamento
// real do app.
const PERMISSIONS_TO_REMOVE = [
  'android.permission.RECORD_AUDIO',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
];

const SERVICES_TO_REMOVE = [
  'expo.modules.audio.service.AudioControlsService',
  'expo.modules.audio.service.AudioRecordingService',
];

const withStripUnusedAudioPermissions = (config) => {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    manifest['uses-permission'] = manifest['uses-permission'] || [];
    for (const name of PERMISSIONS_TO_REMOVE) {
      manifest['uses-permission'].push({
        $: { 'android:name': name, 'tools:node': 'remove' },
      });
    }

    const application = manifest.application?.[0];
    if (application) {
      application.service = application.service || [];
      for (const name of SERVICES_TO_REMOVE) {
        application.service.push({
          $: { 'android:name': name, 'tools:node': 'remove' },
        });
      }
    }

    return config;
  });
};

module.exports = withStripUnusedAudioPermissions;
