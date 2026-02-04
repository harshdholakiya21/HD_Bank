#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python debug_djongo.py

python manage.py collectstatic --no-input
# python manage.py migrate # Djongo doesn't support generic migrate well, verify if needed
