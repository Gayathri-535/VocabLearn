from flask import Blueprint, request, jsonify
from db import get_db_connection

level_bp = Blueprint("level", __name__)

# ---------------- GET AVAILABLE LEVELS ----------------
@level_bp.route("/levels", methods=["GET"])
def get_levels():
    levels = ["Beginner", "Intermediate", "Advanced"]
    return jsonify(levels)


# ---------------- SAVE USER LEVEL ----------------
@level_bp.route("/select-level", methods=["POST"])
def select_level():
    user_id = request.form.get("user_id")
    level = request.form.get("level")

    if not user_id or not level:
        return jsonify({"error": "Missing data"}), 400

    # Optional validation
    if level not in ["Beginner", "Intermediate", "Advanced"]:
        return jsonify({"error": "Invalid level"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        UPDATE users
        SET selected_level = %s
        WHERE id = %s
        """,
        (level, user_id)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Level selected successfully"})
