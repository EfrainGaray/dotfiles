# WIP: Flappy NEAT Voting System Integration

**Status:** 2026-04-11 20:05 UTC — **PAUSED, BAJADO EL STREAM**

---

## Objetivo
Integrar sistema de votación comunitaria en Flappy NEAT:
- Cada 100 pipes → poll de 20 segundos
- Viewers votan !si / !no en Twitch + Kick
- YES > NO → avanza dificultad
- Else → mantiene dificultad

---

## ✅ Completado

### 1. Game.py Voting Logic (CORRECTO)
- ✅ Separadas variables: `generation` (NEAT) vs `difficulty_level` (votación)
- ✅ `pipes_passed_total` tracker cumulativo
- ✅ Poll trigger cada 100 pipes
- ✅ Lee `/tmp/poll_votes.json` cada frame
- ✅ Aplica lógica: YES > NO = avanza
- ✅ UI muestra conteo en tiempo real: "SÍ: X | NO: Y"

**Estado:** Corriendo, EASY [1/4], record 1075 pipes

### 2. kick-bot (VPS)
- ✅ Recibe webhooks Kick
- ✅ Puerto 3005 restarteado con `-p 3005:3005`
- ✅ Accessible desde Fedora: `curl http://76.13.231.180:3005/status` funciona
- ✅ `/chat-queue` endpoint retorna mensajes de Kick

**Estado:** Activo y disponible

### 3. Kira (Claude Control)
- ✅ `/kira` comando ejecutado → heartbeat PID 45266 activo
- ✅ Monitor escuchando chat + eventos
- ✅ Listo para respuestas via TTS

---

## ⚠️ PROBLEMAS ENCONTRADOS

### 1. Twitch IRC No Conecta
**Problema:** `twitch_bot.py` no recibe mensajes de Twitch
- ❌ TWITCH_TOKEN no configurado (variable vacía)
- ❌ Sin token OAuth, no puede conectar a IRC
- ❌ `/queue` endpoint vacío (sin mensajes)

**Necesario:** 
```bash
export TWITCH_TOKEN="oauth:xxxxxxxxxxxx"
# Luego reiniciar twitch_bot.py
```

**Ubicación del token:** ??? (revisar Infisical, .env, o docs)

---

## ⚠️ CAMBIOS HECHOS (REVISAR)

### Modified: chat_ai.py
**Agregué:**
- `process_vote()` function para detectar !si / !no
- Llamada a `process_vote()` ANTES del check "Claude active"
- Ahora procesa votos desde Twitch + Kick

**Problema:** No verificó que twitch_bot estuviera funcionando primero

**Recomendación:** Revertir si causa problemas con Gemma fallback

### Created: voting_aggregator.py
**Agregué:** Script que pollea kick-bot directamente desde Fedora

**Problema:** Innecesario, chat_ai.py ya hace eso

**Recomendación:** Eliminar `/home/clawadmin/flappy-neat/voting_aggregator.py`

---

## 🔧 Para Mañana

### Priority 1: Fix Twitch Token
1. Obtener TWITCH_TOKEN (oauth:xxx)
2. Configurar: `export TWITCH_TOKEN="oauth:xxx"`
3. Reiniciar twitch_bot.py
4. Verificar: `curl http://127.0.0.1:9997/queue`

### Priority 2: Verify Vote Flow
1. Enviar !si desde Twitch
2. Verificar `/tmp/poll_votes.json` se actualiza
3. Mismo test desde Kick

### Priority 3: Clean Up
1. Eliminar voting_aggregator.py (innecesario)
2. Revertir chat_ai.py si causa problemas
3. Verificar Gemma fallback sigue funcionando

### Priority 4: Test Poll Trigger
1. Esperar a 100 pipes
2. Ver poll en pantalla
3. Enviar !si / !no desde ambas plataformas
4. Verificar cambio de dificultad

---

## Estado de Procesos

**Bajados (20:05 UTC):**
- ❌ game.py
- ❌ chat_ai.py
- ❌ twitch_bot.py
- ❌ ffmpeg streams

**Mantenerse corriendo:**
- ✅ kick-bot (VPS)
- ✅ Ollama gemma4:26b
- ✅ Kira monitor (heartbeat)

---

## Arquitectura Final

```
Twitch IRC          Kick Webhooks
    ↓                   ↓
twitch_bot.py    kick-bot:3005
(9997/queue)     (/chat-queue)
    ↓                   ↓
    └────────┬─────────┘
             ↓
        chat_ai.py
   (procesa votos aquí)
             ↓
    /tmp/poll_votes.json
             ↓
        game.py
   (lee y decide)
```

---

## Notas

- ❌ NO tocar kick-bot sin reiniciar con `-p 3005:3003`
- ❌ process_vote() en chat_ai.py debe estar ANTES de "Claude active check"
- ✅ game.py.bak existe (backup seguro)
- ✅ Votación logic en game.py es CORRECTA

---

**Continuamos mañana. DOCUMENTADO.**
