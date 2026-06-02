# Fragile X Backend

## Quick start

1. Create a virtual environment and install dependencies:
   - `pip install -e .[dev]`
2. Copy `.env.example` to `.env` and adjust credentials.
3. Run migrations:
   - `alembic upgrade head`
4. Start API:
   - `uvicorn app.main:app --reload --port 8000`

API docs: `http://localhost:8000/docs`
