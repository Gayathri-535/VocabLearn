from db import get_db_connection
from services.image_generator import generate_vocabulary_image


def generate_lesson_images(lesson_name):

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT id FROM lessons WHERE name = %s", (lesson_name,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return []

    lesson_id = row[0]

    cur.execute(
        """
        SELECT id, word, word_type, related_word, background
        FROM vocabulary
        WHERE lesson_id = %s
        """,
        (lesson_id,)
    )

    vocab_list = cur.fetchall()

    generated = []   # ✅ create list

    for vocab_id, word, word_type, related_word, background in vocab_list:

        cur.execute(
            "SELECT 1 FROM word_images WHERE vocabulary_id = %s",
            (vocab_id,)
        )

        if cur.fetchone():
            continue

        image_url = generate_vocabulary_image(
            word=word,
            word_type=word_type,
            related_word=related_word,
            background_type=background
        )

        cur.execute(
            """
            INSERT INTO word_images (vocabulary_id, image_url)
            VALUES (%s, %s)
            """,
            (vocab_id, image_url)
        )

        generated.append(word)  

    conn.commit()
    cur.close()
    conn.close()

    return generated  