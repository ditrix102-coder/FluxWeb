## Command Execution

- ALWAYS use `cmd.exe /c` or CMD-based execution rather than direct PowerShell commands (unless many errors occur and PowerShell troubleshooting is explicitly required), due to script execution policy restrictions in this environment.

## Exponer Servidor en Red Local (LAN)

Para permitir que otros dispositivos (o la PC usando su IP local `192.168.0.3`) accedan al servidor de desarrollo de Astro:

1. **Configurar Host en `astro.config.mjs`**:
   Asegúrate de incluir `server: { host: true }` dentro de `defineConfig`:
   ```javascript
   export default defineConfig({
     server: {
       host: true
     },
     // ...
   });
   ```

2. **Comando de Ejecución:**
   En este entorno, inicia el servidor con:
   ```bash
   cmd.exe /c "set ASTRO_DEV_BACKGROUND=1 && npx astro dev"
   ```

