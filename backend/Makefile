.PHONY: dev migrate venv install lint typecheck check

VENV = .venv
PYTHON = $(VENV)/bin/python
ACTIVATE = source $(VENV)/bin/activate

dev:
	$(ACTIVATE) && $(PYTHON) -m uvicorn app.main:app --reload

migrate:
	$(ACTIVATE) && alembic upgrade head

venv:
	python3.12 -m venv $(VENV)

install:
	$(ACTIVATE) && pip install -r requirements.txt

lint:
	$(ACTIVATE) && ruff check .

typecheck:
	$(ACTIVATE) && mypy .

check: lint typecheck
