from flask import request, jsonify, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db_connection
from jwt_utils import generate_token

auth_bp = Blueprint("auth", __name__)

# ---------------- SIGN UP ----------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    username = request.form.get("username")
    email = request.form.get("email")
    password = request.form.get("password")

    # Basic validation
    if not username or not email or not password:
        return jsonify({
            "success": False,
            "error": "All fields are required"
        }), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if email already exists
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({
            "success": False,
            "error": "User already exists"
        }), 409

    password_hash = generate_password_hash(password)

    cur.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
        (username, email, password_hash)
    )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully"
    }), 201


# ---------------- SIGN IN ----------------
@auth_bp.route("/signin", methods=["POST"])
def signin():
    email = request.form.get("email")
    password = request.form.get("password")

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Email and password are required"
        }), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, password_hash FROM users WHERE email = %s",
        (email,)
    )
    user = cur.fetchone()

    cur.close()
    conn.close()

    if not user or not check_password_hash(user[1], password):
        return jsonify({
            "success": False,
            "error": "Invalid email or password"
        }), 401

    # Issue JWT
    token = generate_token(user[0])

    return jsonify({
        "success": True,
        "token": token
    }), 200
