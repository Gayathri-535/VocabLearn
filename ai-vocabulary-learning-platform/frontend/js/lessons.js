const backendURL = "http://localhost:5001";
const token = localStorage.getItem("access_token");
if (!token) {
    window.location.href = "signin.html";
}
const params = new URLSearchParams(window.location.search);
const lessonName = params.get("lesson");
if (!lessonName) {
    showLessonCategories();
} else {
    loadLesson(lessonName);
}
// ===============================
// QUIZ VARIABLES
// ===============================
let lessonItems = [];
let currentQuestionIndex = 0;
let score = 0;
let currentLesson = "";
let questionOptions = [];



// Progress tracking using localStorage
function getLessonProgress(lesson) {

    const email = localStorage.getItem("email");

    if (!email) {
        return { completed: false, score: 0, total: 0 };
    }

    const progressKey = `vocablearn_progress_${email}`;

    const progress = JSON.parse(localStorage.getItem(progressKey) || "{}");

    return progress[lesson] || { completed: false, score: 0, total: 0 };
}

function setLessonProgress(lesson, completed, score, total) {

    const email = localStorage.getItem("email");

    if (!email) return;

    const progressKey = `vocablearn_progress_${email}`;

    const progress = JSON.parse(localStorage.getItem(progressKey) || "{}");

    progress[lesson] = {
        completed: completed,
        score: score,
        total: total
    };

    localStorage.setItem(progressKey, JSON.stringify(progress));
}
// ===============================
// TRUE RANDOM SHUFFLE (Fisher-Yates)
// ===============================
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
// ===============================
// SHOW LESSON CATEGORIES
// ===============================
async function showLessonCategories() {

    const content = document.getElementById("content");
    content.innerHTML = `<p class="message">Loading lessons...</p>`;

    try {

        const response = await fetch(`${backendURL}/vocabulary`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Failed to load lessons");

        const data = await response.json();

        const lessonsFromBackend = Object.keys(data.lessons);

        if (!lessonsFromBackend || lessonsFromBackend.length === 0) {
            content.innerHTML = `<p class="message">No lessons available for this level.</p>`;
            return;
        }

        // FRONTEND ICON MAP
        const lessonIcons = {
            colours: { icon: "🎨", title: "COLOURS", desc: "Practice colours vocabulary" },
            animals: { icon: "🦒", title: "ANIMALS", desc: "Learn animal names" },
            actions: { icon: "🏃", title: "ACTIONS", desc: "Practice action words" },
            adjectives: { icon: "⭐", title: "ADJECTIVES", desc: "Learn describing words" }
        };

        let html = `
    <button class="back-btn" onclick="goToDashboard()">← Back</button>
    <h2>Select a Lesson</h2>
    <div class="grid">
`;

        lessonsFromBackend.forEach(lesson => {

            const meta = lessonIcons[lesson] || {
                icon: "📚",
                title: lesson.toUpperCase(),
                desc: "Practice vocabulary"
            };

            const prog = getLessonProgress(lesson);

            let statusBadge = "";

            if (prog.completed) {
                statusBadge = `
                    <div class="lesson-status completed">
                        <span>✓ Completed</span>
                    </div>
                `;
            }
            else if (prog.total > 0) {
                statusBadge = `
                    <div class="lesson-status incomplete">
                        <span>Restart to complete (${prog.score}/${prog.total})</span>
                    </div>
                `;
            }

            html += `
                <div class="card lesson-card" onclick="openLesson('${lesson}')">
                    <div class="icon-circle">${meta.icon}</div>
                    <div class="lesson-title">${meta.title}</div>
                    <div class="lesson-desc">${meta.desc}</div>
                    ${statusBadge}
                </div>
            `;
        });

        html += `</div>`;
        content.innerHTML = html;

    } catch (error) {

        console.error(error);

        content.innerHTML = `
            <p class="message">
                Error loading lessons. Please try again.
            </p>
        `;
    }
}
function openLesson(name) {
    window.location.href = `lessons.html?lesson=${name}`;
}
// ===============================
// LOAD LESSON DATA (MULTI LANGUAGE)
// ===============================
async function loadLesson(name) {
    const content = document.getElementById("content");
    content.innerHTML = `<p class="message">Loading lesson...</p>`;

    try {
        // Fetch selected language vocabulary
        const response = await fetch(`${backendURL}/vocabulary`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Failed vocabulary");

        const data = await response.json();
        const lessonData = data.lessons[name];

        if (!lessonData || lessonData.length === 0) {
            content.innerHTML = `<p class="message">No words found for this lesson.</p>`;
            return;
        }

        // Fetch English image data
        const imageResponse = await fetch(`${backendURL}/lessons/${name}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!imageResponse.ok) throw new Error("Failed images");

        const imageData = await imageResponse.json();

        //  IMPORTANT FIX — Match by index
        const mergedItems = lessonData.map((wordItem, index) => {

            const englishItem = imageData.items[index];

            return {
                word: wordItem.word,                         // Telugu / German / English
                english: englishItem ? englishItem.word : null,  // English meaning
                type: wordItem.type,
                image: englishItem ? englishItem.image : null
            };
        });

        startQuiz(name, mergedItems);

    } catch (error) {
        console.error(error);
        content.innerHTML = `<p class="message">Error loading lesson.</p>`;
    }
}
let userAnswers = {};
// ===============================
// START QUIZ
// ===============================
function startQuiz(name, items) {
    if (!items || items.length < 4) {
        document.getElementById("content").innerHTML =
            "<p class='message'>Need at least 4 words to start quiz.</p>";
        return;
    }
    lessonItems = shuffleArray(items); // Shuffle question order
    currentQuestionIndex = 0;
    score = 0;
    currentLesson = name;
    userAnswers = {};
    questionOptions = [];
    // Generate locked options for every question
    lessonItems.forEach((item) => {

        let options = shuffleArray(lessonItems).slice(0, 4);

        if (!options.find(i => i.word === item.word)) {
            const randomIndex = Math.floor(Math.random() * 4);
            options[randomIndex] = item;
        }

        options = shuffleArray(options);

        questionOptions.push(options);
    });
    showQuestion();
}
// ===============================
// COMPLETE WORD-SPECIFIC HINTS
// ===============================
const wordHints = {
    // ================= COLOURS =================
    red: [
        "🍎 The color of an apple.",
        "❤️ The color of love.",
        "🚦 The traffic light says STOP with this color."
    ],
    yellow: [
        "🍌 Bananas are this color.",
        "🌞 The bright sun shines in this color.",
        "🌻 Sunflowers love this color."
    ],
    green: [
        "🌿 Grass is this color.",
        "🐸 Frogs are this color.",
        "🍏 A raw apple can be this color."
    ],
    blue: [
        "🌊 The ocean is this color.",
        "☁️ The sky can be this color.",
        "🫐 Blueberries look like this."
    ],
    black: [
        "🐈 A black cat can be this color.",
        "🌑 The night can look this color.",
        "🖤 The opposite of white."
    ],
    white: [
        "🥚 An egg can be this color.",
        "☁️ Clouds are often this color.",
        "❄️ Snow looks like this."
    ],
    brown: [
        "🐻 A bear can be this color.",
        "🌳 Tree trunks are this color.",
        "🍫 Chocolate looks like this."
    ],
    orange: [
        "🍊 This fruit shares its name with this color.",
        "🦊 A fox can be this color.",
        "🌅 Sunset sometimes looks like this."
    ],
    pink: [
        "🌸 Flowers can be this color.",
        "🐷 A pig is often this color.",
        "💗 A soft and sweet color."
    ],
    purple: [
        "🍆 Brinjal (eggplant) is this color.",
        "👑 Royal clothes are often this color.",
        "🍇 Grapes can be this color."
    ],
    // ================= ANIMALS =================
    elephant: [
        "🐘 Has a long trunk.",
        "👂 Has very big ears.",
        "🌍 One of the biggest land animals."
    ],
    giraffe: [
        "🦒 Has a very long neck.",
        "🌳 Eats leaves from tall trees.",
        "🟡 Has brown spots."
    ],
    lion: [
        "🦁 Known as king of the jungle.",
        "👑 Has a big mane.",
        "🌍 A wild animal that roars."
    ],
    tiger: [
        "🐅 Has black stripes.",
        "🌲 Lives in forests.",
        "🔥 A strong wild cat."
    ],
    // ================= ACTIONS =================
    running: [
        "🏃 Moving very fast.",
        "🏁 Happens in a race.",
        "💨 Faster than walking."
    ],
    jumping: [
        "🦘 Going up into the air.",
        "⚽ Happens when you kick a ball high.",
        "⬆️ Feet leave the ground."
    ],
    eating: [
        "🍕 Putting food in the mouth.",
        "😋 Happens during lunch.",
        "🍽️ Using hands or spoon."
    ],
    sleeping: [
        "😴 Eyes are closed.",
        "🌙 Happens at night.",
        "🛏️ Resting in bed."
    ],
    // ================= ADJECTIVES =================
    happy: [
        "😊 Big smile on the face.",
        "🎉 Feeling joyful.",
        "🌞 Looks cheerful."
    ],
    sad: [
        "😢 Tears on the face.",
        "💔 Feeling unhappy.",
        "😞 Looks upset."
    ],
    giant: [
        "🐘 Very very big!",
        "🏢 Bigger than normal size.",
        "📏 Extremely large."
    ],
    small: [
        "🐜 Very tiny.",
        "🔍 Hard to see.",
        "📏 Not big."
    ],
    bright: [
        "🌞 Full of light.",
        "💡 Shining strongly.",
        "✨ Easy to see because of light."
    ],
    dark: [
        "🌑 No light.",
        "🌌 Like the night sky.",
        "🔦 You need a flashlight here."
    ]
};


// ===============================
// TELUGU PRONUNCIATION MAP
// ===============================
const teluguPronunciation = {
    "ఎరుపు": "Erupu",
    "పసుపు": "Pasupu",
    "ఆకుపచ్చ": "Aakupacha",
    "నీలం": "Neelam",
    "నలుపు": "Nalupu",
    "తెలుపు": "Telupu",
    "గోధుమరంగు": "Godhumarangu",
    "నారింజ": "Narinja",
    "గులాబీ": "Gulabi",
    "ఊదా": "Ooda",

    "ఏనుగు": "Enugu",
    "జిరాఫీ": "Jirafi",
    "సింహం": "Simham",
    "పులి": "Puli",

    "పరుగెత్తడం": "Parugettadam",
    "దూకడం": "Dookadam",
    "తినడం": "Tinadam",
    "నిద్రపోవడం": "Nidrapovadam",

    "సంతోషంగా": "Santhoshanga",
    "విషాదంగా": "Vishadanga",
    "భారీగా": "Bhaariga",
    "చిన్న": "Chinna",
    "ప్రకాశవంతమైన": "Prakashavanthamainaa",
    "చీకటి": "Cheekati"
};
function generateFunnyQuestion(item) {

    const word = item.word;                 // Selected language word
    const englishWord = item.english;       // English meaning (from backend merge)

    const lowerWord = word.toLowerCase();
    const upperWord = word.toUpperCase();

    // Check if word is pure English letters
    const isEnglishWord = /^[a-zA-Z]+$/.test(word);

    // Detect Telugu Unicode range
    const isTelugu = /[\u0C00-\u0C7F]/.test(word);

    // ===============================
    // ENGLISH MODE (WITH HINTS)
    // ===============================
    if (isEnglishWord && wordHints[lowerWord]) {

        const hints = wordHints[lowerWord];
        const randomHint = hints[Math.floor(Math.random() * hints.length)];

        const emojiMatch = randomHint.match(/^([^\s]+)\s+(.*)$/);
        const emoji = emojiMatch ? emojiMatch[1] : "💡";
        const text = emojiMatch ? emojiMatch[2] : randomHint;

        return `
            <div class="question-container">
                <div style="font-size:1.4rem; color:var(--text-muted); margin-bottom:0.8rem;">
                    The word is:
                </div>

                <div class="word-hero">${upperWord}</div>

                <div class="hint-line">
                    <span class="hint-emoji">${emoji}</span>
                    ${text}
                </div>
            </div>
        `;
    }

    // ===============================
    // TELUGU MODE (Pronunciation + Meaning)
    // ===============================
    if (isTelugu) {

        return `
            <div class="question-container">
                <div style="font-size:1.4rem; color:var(--text-muted); margin-bottom:0.8rem;">
                    The word is:
                </div>

                <div class="word-hero">${word}</div>

                <div class="instruction">
                    👉 Choose the correct image!
                </div>
            </div>
        `;
    }

    // ===============================
    // GERMAN (OR OTHER LANGUAGES)
    // ===============================
    return `
        <div class="question-container">
            <div style="font-size:1.4rem; color:var(--text-muted); margin-bottom:0.8rem;">
                The word is:
            </div>

            <div class="word-hero">${upperWord}</div>

            <div class="instruction">
                👉 Choose the correct image!
            </div>
        </div>
    `;
}
// ===============================
// SHOW QUESTION
// ===============================
function showQuestion() {
    const content = document.getElementById("content");

    if (currentQuestionIndex >= lessonItems.length) {
        showResult();
        return;
    }

    const currentItem = lessonItems[currentQuestionIndex];

    let options = questionOptions[currentQuestionIndex];

    content.innerHTML = `
    <button class="back-btn" onclick="goBack()">← Exit</button>
    <h2>Question ${currentQuestionIndex + 1} of ${lessonItems.length}</h2>
    <h3>${generateFunnyQuestion(currentItem)}</h3>
    <div class="grid" id="options-container"></div>
    <div id="feedback" class="feedback"></div>
    <div class="button-container">
        ${currentQuestionIndex > 0
            ? `<button class="btn" onclick="previousQuestion()">Previous</button>`
            : ""}
        <button class="btn" id="nextBtn" onclick="nextQuestion()" disabled>
            ${currentQuestionIndex === lessonItems.length - 1 ? "Finish" : "Next"}
        </button>
    </div>
`;
    const optionsContainer = document.getElementById("options-container");

    options.forEach(item => {
        const card = document.createElement("div");
        card.className = "card vocab-card";
        card.dataset.word = item.word;
        card.onclick = () => checkAnswer(card, item.word);

        const img = document.createElement("img");

        if (item.image && item.image.startsWith("http")) {
            img.src = item.image;
        } else if (item.image) {
            img.src = backendURL + item.image;
        } else {
            img.src = "images/placeholder.png";
        }

        img.alt = item.word;

        card.appendChild(img);
        optionsContainer.appendChild(card);
    });

    // Restore previous selection if exists

    if (userAnswers[currentQuestionIndex]) {

        const selectedWord = userAnswers[currentQuestionIndex];
        const correctWord = lessonItems[currentQuestionIndex].word;

        const allOptions = document.querySelectorAll(".vocab-card");
        const feedback = document.getElementById("feedback");
        const nextBtn = document.getElementById("nextBtn");

        allOptions.forEach(opt => {
            opt.onclick = null;

            // User selected option
            if (opt.dataset.word === selectedWord) {

                if (selectedWord === correctWord) {
                    opt.classList.add("selected-correct");

                    feedback.innerHTML = "🎉 Great Job! Correct Answer!";
                    feedback.className = "feedback correct";

                } else {
                    opt.classList.add("selected-wrong");

                    feedback.innerHTML = "❌ Oops! That’s incorrect.";
                    feedback.className = "feedback wrong";
                }
            }

            // Highlight correct answer ONLY if user chose wrong
            if (selectedWord !== correctWord && opt.dataset.word === correctWord) {
                opt.classList.add("selected-correct");
            }

        });

        nextBtn.disabled = false;
    }
}
// ===============================
// CHECK ANSWER
// ===============================
function checkAnswer(element, selectedWord) {

    const correctWord = lessonItems[currentQuestionIndex].word;
    const allOptions = document.querySelectorAll(".vocab-card");
    const feedback = document.getElementById("feedback");
    const nextBtn = document.getElementById("nextBtn");

    // Prevent multiple clicks
    allOptions.forEach(opt => opt.onclick = null);

    userAnswers[currentQuestionIndex] = selectedWord; // STORE ANSWER

    if (selectedWord === correctWord) {
        element.classList.add("selected-correct");
        feedback.innerHTML = "🎉 Great Job! Correct Answer!";
        feedback.className = "feedback correct";
    } else {
        element.classList.add("selected-wrong");

        allOptions.forEach(opt => {
            if (opt.dataset.word === correctWord) {
                opt.classList.add("selected-correct");
            }
        });

        feedback.innerHTML = "❌ Oops! That’s incorrect.";
        feedback.className = "feedback wrong";
    }

    nextBtn.disabled = false;
}
function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}
// ===============================
// SHOW RESULT
// ===============================
function showResult() {
    const content = document.getElementById("content");
    let finalScore = 0;
    for (let i = 0; i < lessonItems.length; i++) {
        if (userAnswers[i] === lessonItems[i].word) {
            finalScore++;
        }
    }

    // Save progress
    const isCompleted = finalScore === lessonItems.length;
    setLessonProgress(currentLesson, isCompleted, finalScore, lessonItems.length);

    if (isCompleted) {
        content.innerHTML = `
            <div class="completion-container">
                <h2 class="success-title">🎉 Congratulations! 🎉</h2>
                <p class="success-message big">
                    You nailed it!<br>
                    All ${lessonItems.length} questions correct!
                </p>
                <div class="confetti-placeholder" id="confetti"></div> <!-- optional fun -->
                <button class="btn success-btn" onclick="goBack()">
                    Back to Lessons →
                </button>
            </div>
        `;
        //  Optional: simple confetti 
        //  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
        content.innerHTML = `
            <div class="completion-container">
                <h2 class="error-title">Almost there! ✗</h2>
                <p class="error-message">
                    You scored <strong>${finalScore}/${lessonItems.length}</strong><br>
                    Answer all correctly to complete the lesson.
                </p>
                <button class="btn restart-btn" onclick="startQuiz('${currentLesson}', lessonItems)">
                    Restart Lesson
                </button>
                <button class="btn secondary-btn" onclick="goBack()" style="margin-top:1rem;">
                    Back to Lessons
                </button>
            </div>
        `;
    }
}
// ===============================
// SILENT IMAGE REGENERATION
// ===============================
async function regenerateImageSilently(word, lesson) {
    try {
        await fetch(`${backendURL}/lessons/${lesson}/regenerate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ word: word })
        });
    } catch (err) {
        console.log("Silent regenerate failed");
    }
}
// ===============================
// GO BACK
// ===============================
function goBack() {
    window.location.href = "lessons.html";
}


function goToDashboard() {
    window.location.href = "dashboard.html";
}