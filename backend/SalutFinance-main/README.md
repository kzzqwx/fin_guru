# SalutFinance - Трекер финансов с ассистентом СберСалют

## Инструкция по запуску

1. Установить необходимые библиотеки из файла `requirements.txt`
```sh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Поднять БД с помощью docker compose (Предусмотрен скрипт в Makefile)
```sh
make up_compose
```

3. Запустить приложение
```sh
uvicorn src.main:app --reload
```

Документация будет доступна по ссылке http://127.0.0.1:8000/docs