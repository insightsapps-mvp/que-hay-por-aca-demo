# Que hay por acá — demo navegable

MVP de previsualización (datos mock) del marketplace de entretenimiento para CABA y zona oeste. Incluye la propuesta comercial adentro de la demo.

## Correr local

```bash
npm install
npm run dev
```

Login: `usuario@quehayporaca.app`, `organizador@…`, `local@…` o `admin@…` · contraseña `demo123`.

## Deploy en Render (static)

`render.yaml` ya define un Static Site: build `npm install && npm run build`, publish `./dist` y rewrite `/* → /index.html` para las rutas profundas.

Powered by Insights.
