@echo off
rem ==========================================================================
rem PAL Lab website — local preview
rem Double-click this file to view the site locally. The pages load their
rem content from data/*.json via fetch(), which browsers block for file://
rem pages, so the site must be served over HTTP. Press Ctrl+C to stop.
rem ==========================================================================
cd /d "%~dp0"
start "" http://localhost:8000/
python -m http.server 8000
