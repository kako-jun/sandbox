from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

app = FastAPI(title="Snake Game Web")

# 静的ファイルとテンプレートの設定
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """ホームページを表示"""
    return templates.TemplateResponse("game.html", {"request": request})

@app.get("/game", response_class=HTMLResponse)
async def game(request: Request):
    """ゲームページを表示"""
    return templates.TemplateResponse("game.html", {"request": request}) 