from flask import Flask, render_template, jsonify, request
import requests
import logging
from datetime import datetime

# ロガーの設定
logger = logging.getLogger(__name__)

app = Flask(__name__)

# APIのベースURL
API_BASE_URL = "http://api:8000"

@app.route('/')
def index():
    """
    メインページを表示するルートハンドラー
    
    Returns:
        str: レンダリングされたHTMLテンプレート
    """
    logger.info("Index page accessed")
    return render_template('index.html')

@app.route('/api/health')
def health_check():
    """
    APIのヘルスチェックを行うエンドポイント
    
    Returns:
        tuple: (JSONレスポンス, ステータスコード)
    """
    logger.info("Health check endpoint accessed")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({"error": "API service unavailable"}), 503

@app.route('/api/game/<player_id>', methods=['GET'])
def get_game_state(player_id):
    """
    プレイヤーのゲーム状態を取得するエンドポイント
    
    Args:
        player_id (str): プレイヤーのID
        
    Returns:
        tuple: (JSONレスポンス, ステータスコード)
    """
    logger.info(f"Getting game state for player: {player_id}")
    try:
        response = requests.get(f"{API_BASE_URL}/game/{player_id}")
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logger.error(f"Failed to get game state: {str(e)}")
        return jsonify({"error": "Failed to get game state"}), 500

@app.route('/api/game/<player_id>', methods=['POST'])
def create_game_state(player_id):
    """
    新しいプレイヤーのゲーム状態を作成するエンドポイント
    
    Args:
        player_id (str): プレイヤーのID
        
    Returns:
        tuple: (JSONレスポンス, ステータスコード)
    """
    logger.info(f"Creating game state for player: {player_id}")
    try:
        response = requests.post(f"{API_BASE_URL}/game/{player_id}", json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logger.error(f"Failed to create game state: {str(e)}")
        return jsonify({"error": "Failed to create game state"}), 500

@app.route('/api/game/<player_id>', methods=['PUT'])
def update_game_state(player_id):
    """
    プレイヤーのゲーム状態を更新するエンドポイント
    
    Args:
        player_id (str): プレイヤーのID
        
    Returns:
        tuple: (JSONレスポンス, ステータスコード)
    """
    logger.info(f"Updating game state for player: {player_id}")
    try:
        response = requests.put(f"{API_BASE_URL}/game/{player_id}", json=request.json)
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logger.error(f"Failed to update game state: {str(e)}")
        return jsonify({"error": "Failed to update game state"}), 500

@app.route('/api/game/<player_id>', methods=['DELETE'])
def delete_game_state(player_id):
    """
    プレイヤーのゲーム状態を削除するエンドポイント
    
    Args:
        player_id (str): プレイヤーのID
        
    Returns:
        tuple: (JSONレスポンス, ステータスコード)
    """
    logger.info(f"Deleting game state for player: {player_id}")
    try:
        response = requests.delete(f"{API_BASE_URL}/game/{player_id}")
        return jsonify(response.json()), response.status_code
    except requests.RequestException as e:
        logger.error(f"Failed to delete game state: {str(e)}")
        return jsonify({"error": "Failed to delete game state"}), 500
