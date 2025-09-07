#!/bin/bash
# Simple startup script for deployment
export PORT=${PORT:-10000}
gunicorn --bind 0.0.0.0:$PORT --workers 2 app:app
