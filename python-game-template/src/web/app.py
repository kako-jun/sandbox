from flask import Flask, render_template, jsonify, request
import httpx

app = Flask(__name__)
API_URL = "http://localhost:8000"


@app.route("/")
def index():
    """Serve the main game page"""
    return render_template("index.html")


@app.route("/api/game/state")
def get_game_state():
    with httpx.Client() as client:
        response = client.get(f"{API_URL}/game/state")
        return jsonify(response.json())


@app.route("/api/game/move", methods=["POST"])
def move():
    direction = request.json.get("direction")
    with httpx.Client() as client:
        response = client.post(f"{API_URL}/game/move", json={"direction": direction})
        return jsonify(response.json())


@app.route("/api/game/reset", methods=["POST"])
def reset():
    with httpx.Client() as client:
        response = client.post(f"{API_URL}/game/reset")
        return jsonify(response.json())


@app.route("/api/game/info")
def get_game_info():
    """Get game information from API"""
    try:
        response = requests.get(f"{API_URL}/api/v1/game/info")
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API connection failed: {str(e)}"}), 500


@app.route("/api/game/create", methods=["POST"])
def create_game():
    """Create a new game session"""
    try:
        player_name = request.json.get("player_name", "Web Player")
        response = requests.post(f"{API_URL}/api/v1/game/create", params={"player_name": player_name})
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to create game: {str(e)}"}), 500


@app.route("/api/game/sessions")
def list_sessions():
    """List all active game sessions"""
    try:
        response = requests.get(f"{API_URL}/api/v1/game/sessions")
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to list sessions: {str(e)}"}), 500


@app.route("/api/game/sessions/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    """Delete a game session"""
    try:
        response = requests.delete(f"{API_URL}/api/v1/game/sessions/{session_id}")
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to delete session: {str(e)}"}), 500


@app.route("/health")
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "python-snake-game-web", "api_url": API_URL})


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500


def main():
    """Run the Flask web server"""
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    main()
