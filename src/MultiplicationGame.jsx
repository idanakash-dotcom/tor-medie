import { useState, useEffect, useRef } from "react";

const NUMBER_COLORS = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#22c55e",
  5: "#06b6d4",
  6: "#3b82f6",
  7: "#8b5cf6",
  8: "#ec4899",
  9: "#14b8a6",
};

const TOTAL_TIME = 60;

function generateQuestion(num) {
  const b = Math.floor(Math.random() * 9) + 1;
  return { a: num, b, answer: num * b };
}

// ── Numeric Keypad ─────────────────────────────────────────────────────────────
function NumPad({ value, onChange, onSubmit, disabled, color }) {
  function press(d) {
    if (disabled) return;
    if (d === "⌫") {
      onChange(value.slice(0, -1));
    } else {
      const next = value + d;
      if (next.length <= 3) onChange(next);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {["1","2","3","4","5","6","7","8","9"].map(d => (
        <button
          key={d}
          onClick={() => press(d)}
          disabled={disabled}
          style={{
            height: 64,
            fontSize: 26,
            fontWeight: 800,
            borderRadius: 16,
            border: `2.5px solid ${disabled ? "#e2e8f0" : color + "40"}`,
            background: disabled ? "#f8fafc" : "#fff",
            cursor: disabled ? "default" : "pointer",
            fontFamily: "'Heebo', sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            WebkitTapHighlightColor: "transparent",
            color: disabled ? "#cbd5e1" : "#1e293b",
          }}>
          {d}
        </button>
      ))}
      <button
        onClick={() => press("⌫")}
        disabled={disabled}
        style={{
          height: 64,
          fontSize: 22,
          borderRadius: 16,
          border: `2.5px solid ${disabled ? "#e2e8f0" : "#e2e8f0"}`,
          background: disabled ? "#f8fafc" : "#fff",
          cursor: disabled ? "default" : "pointer",
          WebkitTapHighlightColor: "transparent",
          color: disabled ? "#cbd5e1" : "#64748b",
        }}>
        ⌫
      </button>
      <button
        onClick={() => press("0")}
        disabled={disabled}
        style={{
          height: 64,
          fontSize: 26,
          fontWeight: 800,
          borderRadius: 16,
          border: `2.5px solid ${disabled ? "#e2e8f0" : color + "40"}`,
          background: disabled ? "#f8fafc" : "#fff",
          cursor: disabled ? "default" : "pointer",
          fontFamily: "'Heebo', sans-serif",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          WebkitTapHighlightColor: "transparent",
          color: disabled ? "#cbd5e1" : "#1e293b",
        }}>
        0
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled || !value}
        style={{
          height: 64,
          fontSize: 26,
          borderRadius: 16,
          border: "none",
          background: !disabled && value ? color : "#e2e8f0",
          color: !disabled && value ? "#fff" : "#94a3b8",
          cursor: !disabled && value ? "pointer" : "default",
          fontWeight: 900,
          boxShadow: !disabled && value ? `0 4px 16px ${color}50` : "none",
          transition: "all 0.2s",
          WebkitTapHighlightColor: "transparent",
        }}>
        ✓
      </button>
    </div>
  );
}

// ── Select Screen ─────────────────────────────────────────────────────────────
function SelectScreen({ onStart }) {
  return (
    <div style={{ padding: 20, direction: "rtl", fontFamily: "'Heebo', sans-serif" }}>
      <div style={{ textAlign: "center", paddingBottom: 28 }}>
        <div style={{ fontSize: 56 }}>✖️</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#1e293b", margin: "10px 0 6px" }}>
          תרגול לוח כפל
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", margin: 0 }}>
          בחר את המספר שברצונך לתרגל
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
          const c = NUMBER_COLORS[n];
          return (
            <button
              key={n}
              onClick={() => onStart(n)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "22px 12px",
                borderRadius: 22,
                border: `3px solid ${c}`,
                background: c + "15",
                cursor: "pointer",
                fontFamily: "'Heebo', sans-serif",
                gap: 4,
                boxShadow: `0 4px 16px ${c}20`,
                transition: "transform 0.15s",
                WebkitTapHighlightColor: "transparent",
              }}>
              <span style={{ fontSize: 38, fontWeight: 900, color: c }}>{n}</span>
              <span style={{ fontSize: 12, color: c, opacity: 0.75, fontWeight: 700 }}>
                ×1 עד ×9
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Playing Screen ────────────────────────────────────────────────────────────
function PlayingScreen({ selectedNum, timeLeft, score, question, feedback, wrongAnswer, input, onInput, onSubmit }) {
  const color = NUMBER_COLORS[selectedNum];
  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const timerColor = timeLeft > 20 ? "#22c55e" : timeLeft > 10 ? "#f97316" : "#ef4444";

  let cardBg = "#fff";
  let cardBorder = color + "40";
  if (feedback === "correct") { cardBg = "#f0fdf4"; cardBorder = "#22c55e"; }
  if (feedback === "wrong") { cardBg = "#fef2f2"; cardBorder = "#ef4444"; }

  return (
    <div style={{ padding: "16px 20px 20px", direction: "rtl", fontFamily: "'Heebo', sans-serif" }}>
      {/* Timer bar */}
      <div style={{ height: 10, background: "#e2e8f0", borderRadius: 5, overflow: "hidden", marginBottom: 18 }}>
        <div style={{
          height: "100%",
          width: `${timerPct}%`,
          background: timerColor,
          transition: "width 1s linear, background 0.5s",
          borderRadius: 5,
        }} />
      </div>

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: timerColor, lineHeight: 1 }}>{timeLeft}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>שניות</div>
        </div>

        <div style={{
          fontSize: 16, fontWeight: 900, color,
          background: color + "15",
          padding: "8px 18px",
          borderRadius: 20,
          border: `2px solid ${color}30`,
        }}>
          לוח {selectedNum}
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>
            <span style={{ color: "#22c55e" }}>{score.correct}</span>
            <span style={{ color: "#94a3b8", fontSize: 18 }}>/{score.correct + score.wrong}</span>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>תשובות</div>
        </div>
      </div>

      {/* Question card */}
      <div style={{
        background: cardBg,
        border: `4px solid ${cardBorder}`,
        borderRadius: 28,
        padding: "28px 24px",
        textAlign: "center",
        boxShadow: `0 12px 40px ${color}18`,
        transition: "background 0.2s, border-color 0.2s",
        marginBottom: 20,
        minHeight: 130,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}>
        {question && (
          <>
            <div style={{ fontSize: 56, fontWeight: 900, color: "#1e293b", letterSpacing: -1 }}>
              {question.a} × {question.b} = ?
            </div>
            {feedback === "wrong" && wrongAnswer !== null && (
              <div style={{ fontSize: 16, color: "#ef4444", fontWeight: 700 }}>
                ❌ התשובה הנכונה היא <strong>{question.answer}</strong>
              </div>
            )}
            {feedback === "correct" && (
              <div style={{ fontSize: 22 }}>✅ כל הכבוד!</div>
            )}
          </>
        )}
      </div>

      {/* Answer display */}
      <div style={{
        background: "#f8fafc",
        border: `3px solid ${color}30`,
        borderRadius: 18,
        padding: "14px 20px",
        textAlign: "center",
        fontSize: 36,
        fontWeight: 900,
        color: input ? "#1e293b" : "#cbd5e1",
        letterSpacing: 4,
        marginBottom: 16,
        minHeight: 66,
      }}>
        {input || "..."}
      </div>

      {/* Keypad */}
      <NumPad
        value={input}
        onChange={onInput}
        onSubmit={onSubmit}
        disabled={!!feedback}
        color={color}
      />
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ selectedNum, score, onPlayAgain, onChangNumber }) {
  const color = NUMBER_COLORS[selectedNum];
  const total = score.correct + score.wrong;
  const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;

  let medal, title;
  if (pct >= 90) { medal = "🏆"; title = "מדהים! שיא אישי!"; }
  else if (pct >= 70) { medal = "🥇"; title = "כל הכבוד!"; }
  else if (pct >= 50) { medal = "🥈"; title = "יפה! עוד קצת תרגול!"; }
  else { medal = "🥉"; title = "אפשר לשפר, אל תתייאש!"; }

  return (
    <div style={{ padding: 20, direction: "rtl", fontFamily: "'Heebo', sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 80 }}>{medal}</div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#1e293b", margin: "10px 0 4px" }}>
          {title}
        </h2>
        <div style={{ fontSize: 14, color: "#94a3b8" }}>לוח {selectedNum}</div>
      </div>

      {/* Score breakdown */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <div style={{
          flex: 1, background: "#f0fdf4", border: "2px solid #bbf7d0",
          borderRadius: 20, padding: "20px 12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#16a34a" }}>{score.correct}</div>
          <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 700 }}>נכון ✅</div>
        </div>
        <div style={{
          flex: 1, background: "#fef2f2", border: "2px solid #fecaca",
          borderRadius: 20, padding: "20px 12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#dc2626" }}>{score.wrong}</div>
          <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 700 }}>טעות ❌</div>
        </div>
        <div style={{
          flex: 1, background: "#f0f9ff", border: "2px solid #bae6fd",
          borderRadius: 20, padding: "20px 12px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#0284c7" }}>{pct}%</div>
          <div style={{ fontSize: 13, color: "#0284c7", fontWeight: 700 }}>הצלחה</div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={onPlayAgain}
          style={{
            padding: "18px 0",
            borderRadius: 18,
            border: "none",
            background: color,
            color: "#fff",
            fontSize: 18,
            fontWeight: 900,
            cursor: "pointer",
            fontFamily: "'Heebo', sans-serif",
            boxShadow: `0 8px 24px ${color}40`,
          }}>
          שחק שוב (לוח {selectedNum}) 🔄
        </button>
        <button
          onClick={onChangNumber}
          style={{
            padding: "18px 0",
            borderRadius: 18,
            border: "2px solid #e2e8f0",
            background: "#fff",
            color: "#64748b",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Heebo', sans-serif",
          }}>
          בחר מספר אחר ✖️
        </button>
      </div>
    </div>
  );
}

// ── Main MultiplicationGame ───────────────────────────────────────────────────
export default function MultiplicationGame() {
  const [phase, setPhase] = useState("select"); // "select" | "playing" | "results"
  const [selectedNum, setSelectedNum] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [question, setQuestion] = useState(null);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [wrongAnswer, setWrongAnswer] = useState(null);

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  function startGame(num) {
    clearInterval(timerRef.current);
    clearTimeout(feedbackTimeoutRef.current);
    setSelectedNum(num);
    setPhase("playing");
    setTimeLeft(TOTAL_TIME);
    setScore({ correct: 0, wrong: 0 });
    setQuestion(generateQuestion(num));
    setInput("");
    setFeedback(null);
    setWrongAnswer(null);
  }

  // Countdown timer
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  function submitAnswer() {
    if (!input || feedback || !question) return;
    const userAns = parseInt(input, 10);
    const isCorrect = userAns === question.answer;

    setFeedback(isCorrect ? "correct" : "wrong");
    setWrongAnswer(isCorrect ? null : userAns);
    setScore(s => ({
      correct: isCorrect ? s.correct + 1 : s.correct,
      wrong: isCorrect ? s.wrong : s.wrong + 1,
    }));

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      setWrongAnswer(null);
      setInput("");
      setQuestion(generateQuestion(selectedNum));
    }, isCorrect ? 500 : 900);
  }

  if (phase === "select") {
    return <SelectScreen onStart={startGame} />;
  }

  if (phase === "playing") {
    return (
      <PlayingScreen
        selectedNum={selectedNum}
        timeLeft={timeLeft}
        score={score}
        question={question}
        feedback={feedback}
        wrongAnswer={wrongAnswer}
        input={input}
        onInput={setInput}
        onSubmit={submitAnswer}
      />
    );
  }

  if (phase === "results") {
    return (
      <ResultsScreen
        selectedNum={selectedNum}
        score={score}
        onPlayAgain={() => startGame(selectedNum)}
        onChangNumber={() => setPhase("select")}
      />
    );
  }

  return null;
}
