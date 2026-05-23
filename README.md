# GMGN

## Push (всегда одна команда)

**Один раз** — сохрани токен:
```bash
cp .env.github.example .env.github
# открой .env.github и вставь GITHUB_TOKEN=ghp_...
```

**Каждый раз** после коммита:
```bash
./push.sh
```

Короткий вариант: `./push`

Разово с токеном в команде (без файла):
```bash
GITHUB_TOKEN='ghp_токен' ./push.sh
```
