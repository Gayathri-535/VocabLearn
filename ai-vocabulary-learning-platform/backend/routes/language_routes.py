from flask import Blueprint, request, jsonify
from db import get_db_connection

language_bp = Blueprint("language", __name__)

# ---------------- GET ALL LANGUAGES ----------------
@language_bp.route("/languages", methods=["GET"])
def get_languages():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id, name FROM languages ORDER BY name")
    languages = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify([
        {"id": l[0], "name": l[1]} for l in languages
    ])


# ---------------- SAVE USER LANGUAGE ----------------
@language_bp.route("/select-language", methods=["POST"])
def select_language():
    user_id = request.form.get("user_id")
    language_id = request.form.get("language_id")

    if not user_id or not language_id:
        return jsonify({"error": "Missing data"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        UPDATE users
        SET selected_language_id = %s
        WHERE id = %s
        """,
        (language_id, user_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Language selected successfully"})
