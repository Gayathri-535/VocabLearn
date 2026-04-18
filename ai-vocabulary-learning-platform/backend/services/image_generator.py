from together import Together
import os


TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

if not TOGETHER_API_KEY:
    raise RuntimeError("TOGETHER_API_KEY is not set in environment variables")

client = Together(api_key=TOGETHER_API_KEY)


# --- IMAGE GENERATION ---
def generate_vocabulary_image(word, word_type, related_word=None, background_type="light"):

    if background_type == "dark":
        lighting = "moody lighting with strong contrast"
    else:
        lighting = "bright natural daylight"

    # --- NOUN ---
    if word_type == "noun":
        prompt = (
            f"A realistic high-quality photograph of a {word}. "
            f"The background should naturally interact with the {word}. "
            f"{lighting}, cinematic perspective, DSLR photography, "
            f"sharp focus, detailed textures, depth of field. "
            f"No text, no watermark."
        )

    # --- ADJECTIVE ---
    elif word_type == "adjective":
        prompt = (
            f"A realistic photograph of a {related_word} clearly showing the concept of '{word}'. "
            f"The visual scene should strongly represent the adjective. "
            f"Context-aware environment, {lighting}, cinematic composition, "
            f"natural shadows, detailed textures. "
            f"No text, no watermark."
        )

    # --- VERB ---
    elif word_type == "verb":
        prompt = (
            f"A dynamic realistic photograph clearly showing someone {word}. "
            f"The action should be natural and expressive. "
            f"The environment should interact with the action. "
            f"{lighting}, cinematic framing, motion detail, sharp focus. "
            f"No text, no watermark."
        )

    # --- QUESTION ---
    elif word_type == "question":
        if word == "what":
            prompt = "A person looking confused and pointing at an object, asking what it is, expressive face, realistic scene, no text."
            
        elif word == "where":
            prompt = "A person asking for directions in a street, looking around confused, interacting with another person, no text."

        elif word == "why":
            prompt = "A person showing confusion or questioning something unusual, expressive face, storytelling moment, no text."

        elif word == "how":
            prompt = "A person trying to understand how something works, interacting with an object, focused expression, no text."

        elif word == "when":
            prompt = "A person checking time or asking about timing, looking at a watch or phone, curious expression, no text."

        else:
            prompt = (
            f"A realistic scene of a person asking a question, showing curiosity or confusion, "
            f"natural interaction, {lighting}, cinematic photography, no text."
        )

    # --- EXPRESSION ---
    elif word_type == "expression":
        if word == "thank you":
            prompt = (
                "A person expressing gratitude with a warm smile, "
                "slightly bowing or placing a hand on their chest, "
                "natural interaction with another person, "
                f"{lighting}, cinematic photography, no text, no words."
            )

        elif word == "sorry":
            prompt = (
                "A person apologizing sincerely with a slightly sad expression, "
                "head lowered, gentle body language, interacting with another person, "
                f"{lighting}, cinematic photography, no text, no words."
            )

        elif word == "hello":
            prompt = (
                "Two people greeting each other warmly with a smile or wave, "
                "friendly body language, natural social setting, "
                f"{lighting}, cinematic photography, no text, no words."
            )

        elif word == "please":
            prompt = (
                "A person politely requesting something with respectful body language, "
                "gentle expression, slightly leaning forward, "
                f"{lighting}, realistic scene, no text, no words."
            )

        elif word == "yes":
            prompt = (
                "A person clearly agreeing by nodding their head with a confident smile, "
                "positive body language, open posture, natural interaction, "
                f"{lighting}, cinematic photography, no text, no words."
            )

        elif word == "no":
            prompt = (
                "A person clearly refusing by shaking their head, "
                "serious or firm expression, slightly raised hand gesture to stop, "
                f"{lighting}, cinematic photography, no text, no words."
            )

        else:
            prompt = (
                f"A realistic social interaction expressing '{word}' through facial expressions and body language. "
                f"{lighting}, natural environment, no text, no captions, no words."
            )

    # --- FALLBACK ---
    else:
        prompt = (
            f"A realistic photograph representing the word '{word}', "
            f"contextually accurate environment, {lighting}, "
            f"sharp focus, natural shadows. No text, no watermark."
        )

    response = client.images.generate(
        prompt=prompt,
        model="black-forest-labs/FLUX.1-schnell"
    )

    return response.data[0].url