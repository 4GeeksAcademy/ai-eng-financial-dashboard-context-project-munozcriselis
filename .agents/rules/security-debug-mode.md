# Regla: Deshabilitar debug mode en producción

## Nombre
`security-debug-mode`

## Alcance
- `backend/Dockerfile` — comando CMD y exposición de puertos
- `docker-compose.yml` — puertos expuestos y variables de entorno

## Estado
🔴 **Prioridad alta** — Riesgo de seguridad activo

## Problema actual

### Dockerfile (línea 12)
```dockerfile
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```
El servidor siempre inicia con `debugpy` escuchando en el puerto 5678, incluso en producción. Esto permite ejecución remota de código y acceso a variables del servidor.

### docker-compose.yml (línea 26)
```yaml
backend:
  ports:
    - "8000:8000"
    - "5678:5678"  # ← Puerto de debug expuesto
```

## Regla
**El modo debug (debugpy) solo debe estar activo en desarrollo.** En producción, uvicorn debe ejecutarse directamente sin debugger.

### Implementación esperada

1. **Dockerfile multi-stage** o CMD condicional:
```dockerfile
# Producción (default)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Desactivar debug con variable de entorno
# Si DEBUG=true se usa debugpy, si no se usa uvicorn directo
```

2. **docker-compose.yml** solo expone el puerto de debug en perfil de desarrollo:
```yaml
backend:
  ports:
    - "8000:8000"
    # Puerto 5678 solo en docker-compose.override.yml o profile dev
```

## Criterios de verificación

| Criterio | Método | Automatizable |
|----------|--------|--------------|
| `docker-compose.yml` no expone puerto 5678 en perfil default | Buscar `5678:5678` | ✅ grep en CI |
| Dockerfile CMD no incluye `debugpy --listen` | Buscar `debugpy` en Dockerfile | ✅ grep en CI |
| O existe perfil `dev` separado que incluya debug | Verificar `docker-compose.override.yml` o `profiles` | ❌ Revisión manual |
| Test: puerto 5678 no responde en contenedor sin DEBUG | `nc -zv localhost 5678` falla (refused o timeout) | ✅ Script CI |

## Referencias cruzadas
- **Memory bank**: `current-status.md` brecha B-2
- **Memory bank**: `tech-stack.md` sección 2.2 (Riesgos del Dockerfile)
- **Contrastar con**: `security-cors.md` (ambas son 🔴 bloqueantes)

## Nota de gobernanza
debugpy permite `eval()` remoto en el proceso Python. En la imagen actual (`python:3.13-slim`), el puerto 5678 está abierto a cualquier contenedor en la misma red Docker o si el puerto está publicado. Esto es aceptable en codespaces/desarrollo local, pero si alguien deploya esta imagen a un cloud provider, es una puerta abierta a RCE.

## Razón
Un puerto de debug expuesto en producción permite a atacantes:
- Conectar al debugger remotamente
- Inspeccionar variables y estado del servidor
- Ejecutar código arbitrario en el contexto de la aplicación

## Cómo verificar que se cumple
- El puerto 5678 NO debe estar expuesto en docker-compose.yml de producción
- `docker ps` no debe mostrar el puerto 5678 mapeado
- El CMD del Dockerfile no debe incluir `debugpy` en modo producción
