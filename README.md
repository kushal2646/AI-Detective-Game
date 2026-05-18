# 🔍 AI Detective Puzzle Game

A level-based detective mystery game powered by the Anthropic Claude AI API.

## Features

- **3 Unique Cases** — Museum Heist, Vanishing Scientist, Cyber Heist
- **AI-Generated Stories** — Dynamic crime scene reports on each playthrough
- **AI Suspect Dialogues** — Chat with suspects powered by Claude (guilty suspects are evasive, innocents drop hints)
- **AI Hint System** — Get a subtle nudge without spoilers (costs 100 pts)
- **Clue Collection** — Click hidden evidence cards to discover them
- **Logic Puzzles** — Solve deduction challenges to unlock critical clues
- **Accusation System** — Accuse the wrong person and fail the case
- **Score & Timer** — Race against the clock with a live score
- **Progress Save** — Unlocked levels and scores saved to localStorage
- **Dark Detective Theme** — Noir-styled UI with scanlines and atmospheric design

---

## How to Run

### Option A — Open Directly (Recommended)
Just open `index.html` in any modern browser. No server needed.

```
double-click index.html
```

### Option B — Local Server (for API calls without CORS issues)
```bash
# Python 3
python -m http.server 8080

# Then visit:
http://localhost:8080
```

---

## AI Setup (Optional but Recommended)

1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. When the game loads, enter your key in the popup
3. Your key is saved to `localStorage` (never sent anywhere except Anthropic's API)

**Without an API key:** The game runs in Demo Mode — all gameplay works, but AI-generated stories, suspect dialogues, and hints fall back to pre-written responses.

---

## Gameplay

| Step | Action |
|------|--------|
| 1 | Choose a case from the Case Files |
| 2 | Read the AI-generated crime report |
| 3 | Click **suspect cards** to open the chat interview |
| 4 | Ask the suspect questions — watch for inconsistencies |
| 5 | Click `?` clue cards to discover hidden evidence |
| 6 | Click **Solve Puzzle** for a logic challenge (+200 pts if correct) |
| 7 | Use **AI Hint** if stuck (−100 pts) |
| 8 | Click **⚖️ Accuse** when ready — choose the criminal |

### Scoring
- Base score starts at 1000 and decreases with time
- **+200** for solving the puzzle
- **+200** for questioning all suspects before accusing
- **−100** per hint used
- **−150** for a wrong puzzle answer
- **0** for a wrong accusation or time expiry

---

## Project Structure

```
ai-detective-game/
├── index.html              ← Main game (all screens)
├── static/
│   ├── css/
│   │   └── style.css       ← Full dark detective theme
│   └── js/
│       ├── levels.js       ← All level data (suspects, clues, puzzles)
│       └── game.js         ← Game logic + Claude API integration
└── README.md
```

---

## Adding More Levels

Edit `static/js/levels.js` and add a new object to the `LEVELS` array:

```javascript
{
  id: 4,
  title: "Your Case Title",
  subtitle: "Short synopsis",
  difficulty: 3,       // 1–3
  timeLimit: 420,      // seconds
  suspects: [
    { name: "Name", role: "Role", avatar: "emoji", bg: "background info" },
    ...
  ],
  clues: [
    { name: "Clue Name", icon: "emoji", desc: "Description", hidden: false },
    { name: "Hidden Clue", icon: "emoji", desc: "Description", hidden: true },
    ...
  ],
  criminal: "Name of guilty suspect",
  puzzle: {
    q: "Your logic puzzle question",
    opts: ["Option A", "Option B", "Option C", "Option D"],
    answer: 0  // index of correct option
  }
}
```

---

## Tech Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript (no frameworks)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`)
- **Storage:** localStorage for progress saving
- **Fonts:** Google Fonts (Special Elite + Courier Prime)

---

## License

Built for educational purposes. Claude API usage subject to [Anthropic's Terms of Service](https://www.anthropic.com/legal/consumer-terms).
