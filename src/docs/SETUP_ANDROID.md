# Configuração do Android SDK

## Problema
O erro `SDK location not found` ocorre quando a variável de ambiente `ANDROID_HOME` não está configurada.

## Solução Temporária (Apenas para a sessão atual do PowerShell)
```powershell
$env:ANDROID_HOME = "C:\Users\Koniano\AppData\Local\Android\Sdk"
```

## Solução Permanente

### Opção 1: Variável de Ambiente do Sistema (Recomendado)

1. Abra as Configurações do Sistema:
   - Pressione `Win + X` e selecione "Sistema"
   - Ou pesquise por "Variáveis de ambiente" no menu Iniciar

2. Clique em "Configurações avançadas do sistema"

3. Clique em "Variáveis de Ambiente"

4. Em "Variáveis do sistema", clique em "Novo"

5. Adicione:
   - **Nome da variável:** `ANDROID_HOME`
   - **Valor da variável:** `C:\Users\User\AppData\Local\Android\Sdk`

6. Clique em "OK" em todas as janelas

7. **IMPORTANTE:** Reinicie o VS Code e o terminal para que as alterações tenham efeito

### Opção 2: Perfil do PowerShell

1. Abra o perfil do PowerShell:
   ```powershell
   notepad $PROFILE
   ```
   Se o arquivo não existir, crie-o:
   ```powershell
   New-Item -Path $PROFILE -Type File -Force
   notepad $PROFILE
   ```

2. Adicione esta linha ao arquivo:
   ```powershell
   $env:ANDROID_HOME = "C:\Users\User\AppData\Local\Android\Sdk"
   ```

3. Salve e feche o Notepad

4. Recarregue o perfil:
   ```powershell
   . $PROFILE
   ```

## Verificar Configuração

Após configurar, verifique se está funcionando:
```powershell
$env:ANDROID_HOME
```

Deve retornar: `C:\Users\User\AppData\Local\Android\Sdk`

## Executar o Build

Depois de configurar o `ANDROID_HOME`:
```powershell
npx expo prebuild --clean
npx expo run:android
```
