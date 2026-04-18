-- Languages table
CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed languages
INSERT INTO languages (name)
VALUES
  ('English'),
  ('Telugu'),
  ('German'),
  ('French'),
  ('Spanish')
ON CONFLICT (name) DO NOTHING;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  selected_language_id INTEGER REFERENCES languages(id) ON DELETE SET NULL,
  selected_level VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  level VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lessons (name)
VALUES 
('colours'),
('animals'),
('flowers'),
('actions'),
('adjectives'),
('family'),
('countries'),
('daily_conversation'),
('food'),
('travel'),
('home'),
('work'),
('health'),
('questions'),
('daily_objects')
ON CONFLICT (name) DO NOTHING;

UPDATE lessons
SET level = 'Beginner'
WHERE name IN ('colours', 'animals','flowers');

UPDATE lessons
SET level = 'Intermediate'
WHERE name IN ('actions', 'adjectives','family','countries');

UPDATE lessons
SET level = 'Advanced'
WHERE name IN ('daily_conversation','food','travel','home','work','health','questions','daily_objects');


-- Vocabulary table (NEW 🔥)
CREATE TABLE IF NOT EXISTS vocabulary (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  word_type VARCHAR(50) NOT NULL,  -- noun | adjective | verb
  related_word VARCHAR(100),       -- used for adjectives (green car)
  background VARCHAR(30) DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (lesson_id, word)
);


-- Word Images table (UNIVERSAL 🔥)
CREATE TABLE IF NOT EXISTS word_images (
  id SERIAL PRIMARY KEY,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (vocabulary_id)
);

ALTER TABLE vocabulary
ADD COLUMN IF NOT EXISTS german VARCHAR(100);

ALTER TABLE vocabulary
ADD COLUMN IF NOT EXISTS telugu VARCHAR(100);


-- =========================
-- COLOURS
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='colours'), 'red', 'rot', 'ఎరుపు (erupu)', 'adjective', 'apple', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'yellow', 'gelb', 'పసుపు (pasupu)', 'adjective', 'banana', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'green', 'grün', 'ఆకుపచ్చ (aakupaccha)', 'adjective', 'leaf', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'blue', 'blau', 'నీలం (neelam)', 'adjective', 'whale', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'black', 'schwarz', 'నలుపు (nalupu)', 'adjective', 'cat', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'white', 'weiß', 'తెలుపు (telupu)', 'adjective', 'egg', 'dark'),
((SELECT id FROM lessons WHERE name='colours'), 'brown', 'braun', 'గోధుమరంగు (godhumarangu)', 'adjective', 'bear', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'orange', 'orange', 'నారింజ (narinja)', 'adjective', 'orange', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'pink', 'rosa', 'గులాబీ (gulaabi)', 'adjective', 'flower', 'light'),
((SELECT id FROM lessons WHERE name='colours'), 'purple', 'lila', 'ఊదా (oodaa)', 'adjective', 'brinjal', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- ANIMALS
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='animals'), 'elephant', 'Elefant', 'ఏనుగు (enugu)', 'noun', 'jungle', 'light'),
((SELECT id FROM lessons WHERE name='animals'), 'giraffe', 'Giraffe', 'జిరాఫీ (jiraafee)', 'noun', 'long neck', 'light'),
((SELECT id FROM lessons WHERE name='animals'), 'lion', 'Löwe', 'సింహం (simham)', 'noun', 'king', 'light'),
((SELECT id FROM lessons WHERE name='animals'), 'tiger', 'Tiger', 'పులి (puli)', 'noun', 'forest', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- FLOWERS
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='flowers'), 'rose', 'Rose', 'గులాబీ పువ్వు (gulaabi puvvu)', 'noun', 'flower', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'lotus', 'Lotus', 'కమలం (kamalam)', 'noun', 'flower', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'sunflower', 'Sonnenblume', 'సూర్యకాంతి పువ్వు (sooryakaanti puvvu)', 'noun', 'sun', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'jasmine', 'Jasmin', 'మల్లెపువ్వు (malle puvvu)', 'noun', 'fragrance', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'lily', 'Lilie', 'లిల్లీ పువ్వు (lilli puvvu)', 'noun', 'flower', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'tulip', 'Tulpe', 'ట్యులిప్ పువ్వు (tyulip puvvu)', 'noun', 'garden', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'hibiscus', 'Hibiskus', 'మందారం (mandaaram)', 'noun', 'flower', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'marigold', 'Ringelblume', 'బంతిపువ్వు (banti puvvu)', 'noun', 'festival', 'light'),
((SELECT id FROM lessons WHERE name='flowers'), 'orchid', 'Orchidee', 'ఆర్కిడ్ పువ్వు (aarkid puvvu)', 'noun', 'flower', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- ACTIONS
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='actions'), 'running', 'rennen', 'పరుగెత్తడం (parugedatam)', 'verb', 'exercise', 'light'),
((SELECT id FROM lessons WHERE name='actions'), 'jumping', 'springen', 'దూకడం (dookadam)', 'verb', 'play', 'light'),
((SELECT id FROM lessons WHERE name='actions'), 'eating', 'essen', 'తినడం (tinadam)', 'verb', 'food', 'light'),
((SELECT id FROM lessons WHERE name='actions'), 'sleeping', 'schlafen', 'నిద్రపోవడం (nidrapovadam)', 'verb', 'bed', 'dark')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- ADJECTIVES
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='adjectives'), 'happy', 'glücklich', 'సంతోషంగా (santhoshanga)', 'adjective', 'child smiling', 'light'),
((SELECT id FROM lessons WHERE name='adjectives'), 'sad', 'traurig', 'విషాదంగా (vishaadanga)', 'adjective', 'child crying', 'dark'),
((SELECT id FROM lessons WHERE name='adjectives'), 'giant', 'riesig', 'భారీగా (bhaareega)', 'adjective', 'elephant', 'light'),
((SELECT id FROM lessons WHERE name='adjectives'), 'small', 'klein', 'చిన్న (chinna)', 'adjective', 'ant', 'light'),
((SELECT id FROM lessons WHERE name='adjectives'), 'bright', 'hell', 'ప్రకాశవంతమైన (prakaashavanthamainaa)', 'adjective', 'sun', 'light'),
((SELECT id FROM lessons WHERE name='adjectives'), 'dark', 'dunkel', 'చీకటి (cheekati)', 'adjective', 'night sky', 'dark')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- FAMILY
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='family'), 'family', 'Familie', 'కుటుంబం (kutumbam)', 'noun', 'home', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'father', 'Vater', 'నాన్న (naanna)', 'noun', 'father parent', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'mother', 'Mutter', 'అమ్మ (amma)', 'noun', 'mother parent', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'brother', 'Bruder', 'అన్న / తమ్ముడు (anna / tammudu)', 'noun', 'sibling', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'sister', 'Schwester', 'అక్క / చెల్లి (akka / chelli)', 'noun', 'sibling', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'grandfather', 'Großvater', 'తాత (thaatha)', 'noun', 'elder', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'grandmother', 'Großmutter', 'అమ్మమ్మ / నానమ్మ (ammamma / naanamma)', 'noun', 'elder', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'son', 'Sohn', 'కొడుకు (koduku)', 'noun', 'child', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'daughter', 'Tochter', 'కూతురు (koothuru)', 'noun', 'child', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'husband', 'Ehemann', 'భర్త (bhartha)', 'noun', 'marriage', 'light'),
((SELECT id FROM lessons WHERE name='family'), 'wife', 'Ehefrau', 'భార్య (bhaarya)', 'noun', 'marriage', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- COUNTRIES
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='countries'), 'India', 'Indien', 'భారతదేశం (bhaaratadesam)', 'noun', 'india', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'Germany', 'Deutschland', 'జర్మనీ (jarmani)', 'noun', 'germany', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'Austria', 'Österreich', 'ఆస్ట్రియా (aastriya)', 'noun', 'Austria', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'United States', 'USA', 'అమెరికా (amerika)', 'noun', 'America', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'United Kingdom', 'Großbritannien', 'బ్రిటన్ (britan)', 'noun', 'United kingdom', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'France', 'Frankreich', 'ఫ్రాన్స్ (fraans)', 'noun', 'France', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'Italy', 'Italien', 'ఇటలీ (itali)', 'noun', 'Italy', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'Spain', 'Spanien', 'స్పెయిన్ (spain)', 'noun', 'spain', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'China', 'China', 'చైనా (china)', 'noun', 'china', 'light'),
((SELECT id FROM lessons WHERE name='countries'), 'Japan', 'Japan', 'జపాన్ (japan)', 'noun', 'japan', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- DAILY CONVERSATION
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='daily_conversation'), 'hello', 'hallo', 'నమస్తే (namaste)', 'expression', 'greeting', 'light'),
((SELECT id FROM lessons WHERE name='daily_conversation'), 'thank you', 'danke', 'ధన్యవాదాలు (dhanyavaadaalu)', 'expression', 'gratitude', 'light'),
((SELECT id FROM lessons WHERE name='daily_conversation'), 'please', 'bitte', 'దయచేసి (dayachesi)', 'expression', 'request', 'light'),
((SELECT id FROM lessons WHERE name='daily_conversation'), 'sorry', 'entschuldigung', 'క్షమించండి (kshaminchandi)', 'expression', 'apology', 'light'),
((SELECT id FROM lessons WHERE name='daily_conversation'), 'yes', 'ja', 'అవును (avunu)', 'expression', 'agreement', 'light'),
((SELECT id FROM lessons WHERE name='daily_conversation'), 'no', 'nein', 'కాదు (kaadu)', 'expression', 'refusal', 'dark')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- FOOD
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='food'), 'water', 'Wasser', 'నీరు (neeru)', 'noun', 'drink', 'light'),
((SELECT id FROM lessons WHERE name='food'), 'bread', 'Brot', 'రొట్టి (rotti)', 'noun', 'breakfast', 'light'),
((SELECT id FROM lessons WHERE name='food'), 'rice', 'Reis', 'బియ్యం (biyyam)', 'noun', 'boiled rice', 'light'),
((SELECT id FROM lessons WHERE name='food'), 'menu', 'Speisekarte', 'మెను (menu)', 'noun', 'restaurant', 'light'),
((SELECT id FROM lessons WHERE name='food'), 'bill', 'Rechnung', 'బిల్ (bill)', 'noun', 'food bill', 'light'),
((SELECT id FROM lessons WHERE name='food'), 'vegetarian', 'vegetarisch', 'శాకాహారం (shaakaahaaram)', 'adjective', 'food type', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- TRAVEL
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='travel'), 'passport', 'Reisepass', 'పాస్‌పోర్ట్ (passport)', 'noun', 'identity', 'light'),
((SELECT id FROM lessons WHERE name='travel'), 'ticket', 'Ticket', 'టికెట్ (ticket)', 'noun', 'journey', 'light'),
((SELECT id FROM lessons WHERE name='travel'), 'boarding', 'Boarding', 'బోర్డింగ్ (boarding)', 'noun', 'flight', 'light'),
((SELECT id FROM lessons WHERE name='travel'), 'airport', 'Flughafen', 'విమానాశ్రయం (vimaanashrayam)', 'noun', 'travel', 'light'),
((SELECT id FROM lessons WHERE name='travel'), 'flight', 'Flug', 'విమాన ప్రయాణం (vimana prayanam)', 'noun', 'airplane', 'light'),
((SELECT id FROM lessons WHERE name='travel'), 'luggage', 'Gepäck', 'సామాను (saamaanu)', 'noun', 'bags', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- HOME
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='home'), 'house', 'Haus', 'ఇల్లు (illu)', 'noun', 'family', 'light'),
((SELECT id FROM lessons WHERE name='home'), 'room', 'Zimmer', 'గది (gadi)', 'noun', 'home', 'light'),
((SELECT id FROM lessons WHERE name='home'), 'bed', 'Bett', 'మంచం (mancham)', 'noun', 'sleep', 'light'),
((SELECT id FROM lessons WHERE name='home'), 'door', 'Tür', 'తలుపు (talupu)', 'noun', 'entry', 'light'),
((SELECT id FROM lessons WHERE name='home'), 'window', 'Fenster', 'కిటికీ (kitiki)', 'noun', 'view', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- WORK
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='work'), 'office', 'Büro', 'ఆఫీస్ (office)', 'noun', 'job', 'light'),
((SELECT id FROM lessons WHERE name='work'), 'meeting', 'Meeting', 'సమావేశం (samaavesham)', 'noun', 'discussion', 'light'),
((SELECT id FROM lessons WHERE name='work'), 'email', 'E-Mail', 'ఇమెయిల్ (email)', 'noun', 'communication', 'light'),
((SELECT id FROM lessons WHERE name='work'), 'deadline', 'Frist', 'గడువు (gaduvu)', 'noun', 'time', 'dark'),
((SELECT id FROM lessons WHERE name='work'), 'project', 'Projekt', 'ప్రాజెక్ట్ (project)', 'noun', 'task', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- HEALTH
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='health'), 'doctor', 'Arzt', 'డాక్టర్ (doctor)', 'noun', 'hospital', 'light'),
((SELECT id FROM lessons WHERE name='health'), 'hospital', 'Krankenhaus', 'ఆసుపత్రి (aasupatri)', 'noun', 'treatment', 'light'),
((SELECT id FROM lessons WHERE name='health'), 'help', 'Hilfe', 'సహాయం (sahaayam)', 'noun', 'emergency', 'light'),
((SELECT id FROM lessons WHERE name='health'), 'pain', 'Schmerz', 'నొప్పి (noppi)', 'noun', 'injury', 'dark'),
((SELECT id FROM lessons WHERE name='health'), 'medicine', 'Medizin', 'ఔషధం (aushadham)', 'noun', 'treatment', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;

-- =========================
-- QUESTIONS
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='questions'), 'what', 'was', 'ఏమి (emi)', 'question', 'information', 'light'),
((SELECT id FROM lessons WHERE name='questions'), 'where', 'wo', 'ఎక్కడ (ekkada)', 'question', 'location', 'light'),
((SELECT id FROM lessons WHERE name='questions'), 'when', 'wann', 'ఎప్పుడు (eppudu)', 'question', 'time', 'light'),
((SELECT id FROM lessons WHERE name='questions'), 'why', 'warum', 'ఎందుకు (enduku)', 'question', 'reason', 'light'),
((SELECT id FROM lessons WHERE name='questions'), 'how', 'wie', 'ఎలా (ela)', 'question', 'method', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;



-- =========================
-- DAILY OBJECTS
-- =========================
INSERT INTO vocabulary (lesson_id, word, german, telugu, word_type, related_word, background)
VALUES
((SELECT id FROM lessons WHERE name='daily_objects'), 'phone', 'Telefon', 'ఫోన్ (phone)', 'noun', 'communication', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'laptop', 'Laptop', 'ల్యాప్‌టాప్ (laptop)', 'noun', 'work', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'book', 'Buch', 'పుస్తకం (pustakam)', 'noun', 'study', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'pen', 'Stift', 'పెన్ (pen)', 'noun', 'writing', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'bag', 'Tasche', 'బ్యాగ్ (bag)', 'noun', 'carry', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'table', 'Tisch', 'మెజ్ (mej)', 'noun', 'furniture', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'chair', 'Stuhl', 'కుర్చీ (kurchi)', 'noun', 'sit', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'bottle', 'Flasche', 'సీసా (seesa)', 'noun', 'drink', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'keys', 'Schlüssel', 'తాళాలు (taalaalu)', 'noun', 'lock', 'light'),
((SELECT id FROM lessons WHERE name='daily_objects'), 'watch', 'Uhr', 'గడియారం (gadiyaaram)', 'noun', 'time', 'light')
ON CONFLICT (lesson_id, word) DO NOTHING;