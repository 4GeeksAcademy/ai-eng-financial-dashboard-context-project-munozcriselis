# Regla: Restringir CORS a orígenes específicos

## Nombre
`security-cors`

## Alcance
- `backend/app/main.py` — configuración del middleware CORS
- `docker-compose.yml` — variable de entorno `ALLOWED_ORIGINS`

## Estado
🔴 **Prioridad alta** — Riesgo de seguridad activo

## Problema actual
```python
# backend/app/main.py línea 8
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ← Acepta cualquier origen
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
`allow_origins=["*"]` permite que cualquier dominio haga peticiones a la API. En producción, esto expone la aplicación a ataques CSRF y acceso no autorizado desde sitios maliciosos.

## Regla
**No usar `allow_origins=["*"]` en producción.** Configurar orígenes permitidos a través de la variable de entorno `ALLOWED_ORIGINS`.

### Implementación esperada

1. En `backend/app/main.py`, leer orígenes desde variable de entorno:
```python
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

2. En `docker-compose.yml`, definir la variable:
```yaml
backend:
  environment:
    - ALLOWED_ORIGINS=http://localhost:5173
```

## Razón
La política CORS por defecto debe ser restrictiva (`deny all`) y solo abrir explícitamente los orígenes necesarios. Esto es especialmente importante cuando `allow_credentials=True` está habilitado, ya que permite cookies y headers de autenticación.

## Cómo verificar que se cumple
- `allow_origins` NO debe contener `"*"` en producción
- La variable `ALLOWED_ORIGINS` debe estar definida en el entorno
- Solo los orígenes legítimos deben aparecer en la lista
