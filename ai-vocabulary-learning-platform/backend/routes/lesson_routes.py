from flask import Blueprint, jsonify, request
from jwt_utils import jwt_required
from db import get_db_connection
from services.lesson_generator import generate_lesson_images
from services.image_generator import generate_vocabulary_image

lesson_bp = Blueprint("lessons", __name__)


def get_lesson_id(cur, lesson_name):
    cur.execute("SELECT id FROM lessons WHERE name = %s", (lesson_name,))
    row = cur.fetchone()
    return row[0] if row else None



# GENERATE IMAGES FOR ANY LESSON

@lesson_bp.route("/lessons/<lesson_name>/generate", methods=["POST"])
@jwt_required
def generate_lesson_route(lesson_name):

    # Just call the service layer
    generated = generate_lesson_images(lesson_name)

    return jsonify({
        "success": True,
        "lesson": lesson_name,
        "generated": generated
    }), 200



# FETCH LESSON IMAGES

@lesson_bp.route("/lessons/<lesson_name>", methods=["GET"])
@jwt_required
def get_lesson_images(lesson_name):

    conn = get_db_connection()
    cur = conn.cursor()

    lesson_id = get_lesson_id(cur, lesson_name)
    if not lesson_id:
        cur.close()
        conn.close()
        return jsonify({"error": "Lesson not found"}), 404

    cur.execute(
        """
        SELECT v.word, v.word_type, w.image_url
        FROM vocabulary v
        JOIN word_images w ON v.id = w.vocabulary_id
        WHERE v.lesson_id = %s
        ORDER BY v.word
        """,
        (lesson_id,)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify({
        "lesson": lesson_name,
        "items": [
            {
                "word": r[0],
                "type": r[1],
                "image": r[2]
            }
            for r in rows
        ]
    }), 200



# REGENERATE SINGLE WORD IMAGE

@lesson_bp.route("/lessons/<lesson_name>/regenerate", methods=["POST"])
@jwt_required
def regenerate_word(lesson_name):

    data = request.get_json()
    word = data.get("word")

    if not word:
        return jsonify({"error": "Word is required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    lesson_id = get_lesson_id(cur, lesson_name)
    if not lesson_id:
        cur.close()
        conn.close()
        return jsonify({"error": "Lesson not found"}), 404

    cur.execute(
        """
        SELECT id, word_type, related_word, background
        FROM vocabulary
        WHERE lesson_id = %s AND word = %s
        """,
        (lesson_id, word)
    )

    vocab = cur.fetchone()

    if not vocab:
        cur.close()
        conn.close()
        return jsonify({"error": "Word not found in this lesson"}), 404

    vocab_id, word_type, related_word, background = vocab

    image_url = generate_vocabulary_image(
        word=word,
        word_type=word_type,
        related_word=related_word,
        background_type=background
    )

    # Update existing image OR insert if missing
    cur.execute(
        "SELECT 1 FROM word_images WHERE vocabulary_id = %s",
        (vocab_id,)
    )

    if cur.fetchone():
        cur.execute(
            """
            UPDATE word_images
            SET image_url = %s
            WHERE vocabulary_id = %s
            """,
            (image_url, vocab_id)
        )
    else:
        cur.execute(
            """
            INSERT INTO word_images (vocabulary_id, image_url)
            VALUES (%s, %s)
            """,
            (vocab_id, image_url)
        )

    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "success": True,
        "lesson": lesson_name,
        "word": word,
        "image": image_url
    }), 200



@lesson_bp.route("/vocabulary", methods=["GET"])
@jwt_required
def get_vocabulary_by_user():

    user_id = request.user_id   

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            lang.name AS language,
            l.name AS lesson,
            CASE 
                WHEN u.selected_language_id = 1 THEN v.word
                WHEN u.selected_language_id = 2 THEN v.telugu
                WHEN u.selected_language_id = 3 THEN v.german
            END AS word,
            v.word_type,
            v.related_word,
            v.background
        FROM vocabulary v
        JOIN lessons l ON v.lesson_id = l.id
        JOIN users u ON u.id = %s
        JOIN languages lang ON u.selected_language_id = lang.id
        WHERE l.level = u.selected_level
        ORDER BY l.name, v.word
    """, (user_id,))

    rows = cur.fetchall()

    response = {
        "language": None,
        "lessons": {}
    }

    for row in rows:
        language, lesson, word, word_type, related_word, background = row

        response["language"] = language

        if lesson not in response["lessons"]:
            response["lessons"][lesson] = []

        response["lessons"][lesson].append({
            "word": word,
            "type": word_type,
            "related_word": related_word,
            "background": background
        })

    cur.close()
    conn.close()

    return jsonify(response), 200