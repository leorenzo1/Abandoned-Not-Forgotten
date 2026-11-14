import os
from flask import Flask, send_from_directory

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "..", "frontend", "dist")

app = Flask(__name__, static_folder=DIST_DIR, static_url_path="")


@app.route("/")
def index():
    if not os.path.exists(os.path.join(DIST_DIR, "index.html")):
        return "Frontend not built yet. Run 'npm run build' inside the frontend folder.", 503
    return send_from_directory(DIST_DIR, "index.html")


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True)
