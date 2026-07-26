# Reglas de Proyecto - Antigravity IDE

## Servidor de Desarrollo de Astro
En este entorno de desarrollo (Antigravity IDE/sandbox), Astro detecta de manera automática que se está ejecutando bajo un agente de IA y arranca el servidor de desarrollo en segundo plano (daemon/background), cerrando el proceso CLI principal. Esto causa que el sandbox apague la terminal y termine el servidor dev inmediatamente.

Para solucionar esto y mantener el servidor de desarrollo de Astro activo y en primer plano:
1. **Evitar PowerShell directo:** Debido a políticas de ejecución restrictivas, no ejecutes `npm run dev` ni `npx astro dev` directamente en PowerShell, ya que fallarán por permisos de script `.ps1`.
2. **Usar CMD y variable de entorno:** Ejecuta el comando precedido por `cmd.exe /c` y define la variable de entorno `ASTRO_DEV_BACKGROUND=1`. Esto deshabilita la detección de agentes en Astro y mantiene el proceso corriendo de forma interactiva en la terminal del sandbox.

Comando correcto:
```bash
cmd.exe /c "set ASTRO_DEV_BACKGROUND=1 && npx astro dev"
```