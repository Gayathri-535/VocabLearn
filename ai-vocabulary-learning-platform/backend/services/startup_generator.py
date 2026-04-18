from db import get_db_connection
from services.lesson_generator import generate_lesson_images


def auto_generate_images():

    print("🚀 Running startup image check...")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT name FROM lessons")
    lessons = cur.fetchall()

    cur.close()
    conn.close()

    for (lesson_name,) in lessons:
        print(f"📘 Generating lesson: {lesson_name}")
        generate_lesson_images(lesson_name)

    print(" Startup generation complete.")