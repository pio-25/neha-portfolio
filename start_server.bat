@echo off
start python -m http.server 5500
ngrok http 5500
