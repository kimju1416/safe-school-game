"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Phase =
  | "intro"
  | "classroom"
  | "classroom-quiz"
  | "traffic"
  | "pool"
  | "lab"
  | "final";

type Toast = {
  title: string;
  message: string;
  tone: "good" | "warn" | "info";
} | null;

type OXQuestion = {
  statement: string;
  answer: "O" | "X";
  explanation: string;
};

const classroomHazards = [
  {
    id: "outlet",
    label: "과부하 멀티탭",
    icon: "⚡",
    x: 12,
    y: 68,
    w: 19,
    h: 24,
    lesson: "한 콘센트에 전기기구를 너무 많이 연결하면 과열과 화재 위험이 커져요.",
  },
  {
    id: "bag",
    label: "통로를 막은 가방",
    icon: "🎒",
    x: 36,
    y: 49,
    w: 16,
    h: 31,
    lesson: "대피 통로와 교실 사이 길은 언제나 비워 두어야 해요.",
  },
  {
    id: "books",
    label: "떨어질 듯한 책",
    icon: "📚",
    x: 78,
    y: 4,
    w: 16,
    h: 27,
    lesson: "무거운 물건은 낮은 곳에, 높은 선반의 물건은 넘어지지 않게 정리해요.",
  },
  {
    id: "scissors",
    label: "펼쳐 둔 가위",
    icon: "✂️",
    x: 57,
    y: 62,
    w: 21,
    h: 20,
    lesson: "가위는 사용 뒤 날을 닫고 안전한 곳에 보관해요.",
  },
  {
    id: "heater",
    label: "종이 가까이 놓인 난방기",
    icon: "♨️",
    x: 80,
    y: 46,
    w: 17,
    h: 34,
    lesson: "난방기 주변에는 종이·옷 같은 불붙기 쉬운 물건을 두지 않아요.",
  },
];

const classroomQuiz: OXQuestion[] = [
  {
    statement: "통로에 놓인 가방은 평소에는 괜찮고, 대피훈련 때만 치우면 된다.",
    answer: "X",
    explanation: "넘어짐 사고와 긴급 대피 방해를 막기 위해 통로는 항상 비워 둬요.",
  },
  {
    statement: "가위를 사용한 뒤에는 날을 닫아 안전한 곳에 보관한다.",
    answer: "O",
    explanation: "날을 닫고 손잡이가 잡기 쉬운 방향으로 정리하는 것이 안전해요.",
  },
  {
    statement: "전기기구 여러 개를 한 멀티탭에 연결하면 과열될 수 있다.",
    answer: "O",
    explanation: "허용 용량을 넘기면 열이 나고 화재로 이어질 수 있어요.",
  },
];

const trafficSpots = [
  {
    id: "phone",
    label: "걸으며 스마트폰 보기",
    icon: "📱",
    x: 0,
    y: 38,
    w: 25,
    h: 48,
    lesson: "길을 걸을 때는 스마트폰을 넣고 주변 차량과 신호를 확인해요.",
  },
  {
    id: "cars",
    label: "주차 차량 사이로 횡단",
    icon: "🚗",
    x: 20,
    y: 34,
    w: 25,
    h: 32,
    lesson: "주차 차량 사이에서는 사람과 운전자가 서로를 보기 어려워요. 횡단보도를 이용해요.",
  },
  {
    id: "bike",
    label: "안전모 없이 횡단보도 주행",
    icon: "🚲",
    x: 56,
    y: 30,
    w: 24,
    h: 36,
    lesson: "자전거는 안전모를 쓰고, 횡단보도에서는 내려서 좌우를 살피며 끌고 건너요.",
  },
];

const trafficQuiz: OXQuestion[] = [
  {
    statement: "자전거를 타고 횡단보도를 건널 때는 내려서 끌고 간다.",
    answer: "O",
    explanation: "보행자와 충돌할 위험을 줄이고 좌우를 충분히 확인하려면 내려서 끌고 건너요.",
  },
  {
    statement: "집과 학교가 가까우면 자전거 안전모를 쓰지 않아도 된다.",
    answer: "X",
    explanation: "거리가 짧아도 넘어지거나 충돌할 수 있으므로 몸에 맞는 안전모를 꼭 착용해요.",
  },
  {
    statement: "주차된 차 사이에서는 천천히 건너면 안전하다.",
    answer: "X",
    explanation: "차량에 가려 서로 보이지 않으므로 횡단보도처럼 시야가 확보된 곳에서 건너요.",
  },
];

const poolSpots = [
  {
    id: "running",
    label: "젖은 바닥에서 달리기",
    icon: "🏃",
    x: 3,
    y: 24,
    w: 21,
    h: 32,
    lesson: "수영장 바닥은 매우 미끄러워요. 뛰지 말고 천천히 걸어요.",
  },
  {
    id: "pushing",
    label: "친구 밀기",
    icon: "🫷",
    x: 24,
    y: 20,
    w: 21,
    h: 30,
    lesson: "물가에서 장난으로 친구를 밀면 큰 사고가 날 수 있어요.",
  },
  {
    id: "diving",
    label: "얕은 곳으로 다이빙",
    icon: "🤿",
    x: 67,
    y: 20,
    w: 19,
    h: 34,
    lesson: "수심과 허용 여부를 확인하지 않은 다이빙은 절대 하지 않아요.",
  },
  {
    id: "alone",
    label: "혼자 멀리 수영하기",
    icon: "🏊",
    x: 64,
    y: 57,
    w: 23,
    h: 30,
    lesson: "어린이는 보호자·안전요원의 시야 안, 정해진 안전 구역에서 물놀이해요.",
  },
];

const poolSteps = [
  {
    id: "adult",
    short: "안전 확인",
    text: "보호자·안전요원과 함께 안전 구역과 몸 상태 확인",
    icon: "👩‍🏫",
  },
  {
    id: "warmup",
    short: "준비운동",
    text: "충분히 몸을 풀고 심장에서 먼 곳부터 물 적시기",
    icon: "🙆",
  },
  {
    id: "vest",
    short: "구명조끼",
    text: "몸에 맞는 구명조끼의 버클과 조임끈 확인",
    icon: "🦺",
  },
  {
    id: "enter",
    short: "천천히 입수",
    text: "계단을 잡고 뛰지 말고 천천히 물에 들어가기",
    icon: "🪜",
  },
];

const scrambledPoolSteps = [
  poolSteps[2],
  poolSteps[0],
  poolSteps[3],
  poolSteps[1],
];

const labClues = [
  {
    id: "goggles",
    label: "보안경",
    icon: "🥽",
    digit: "6",
    x: 20,
    y: 65,
    w: 25,
    h: 24,
    lesson: "실험을 시작하기 전에 눈을 보호하는 보안경을 착용해요.",
  },
  {
    id: "gloves",
    label: "보호장갑",
    icon: "🧤",
    digit: "2",
    x: 3,
    y: 47,
    w: 20,
    h: 19,
    lesson: "실험 종류와 선생님 지시에 맞는 보호장갑을 사용해요.",
  },
  {
    id: "spill",
    label: "쏟아진 액체",
    icon: "💧",
    digit: "8",
    x: 48,
    y: 60,
    w: 18,
    h: 22,
    lesson: "정체를 모르는 물질은 만지거나 냄새 맡지 말고 즉시 선생님께 알려요.",
  },
  {
    id: "burner",
    label: "열원과 종이",
    icon: "🔥",
    digit: "4",
    x: 67,
    y: 46,
    w: 22,
    h: 22,
    lesson: "열원 주변의 종이를 치우고 사용 전후 상태를 확인해요.",
  },
];

const inventoryByPhase = [
  { label: "안전 렌즈", icon: "◉", phase: "classroom-quiz" as Phase },
  { label: "통학 나침반", icon: "✦", phase: "pool" as Phase },
  { label: "아쿠아 실드", icon: "≈", phase: "lab" as Phase },
  { label: "실험실 키", icon: "◆", phase: "final" as Phase },
];

const phaseOrder: Phase[] = [
  "intro",
  "classroom",
  "classroom-quiz",
  "traffic",
  "pool",
  "lab",
  "final",
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [hints, setHints] = useState(3);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [classFound, setClassFound] = useState<string[]>([]);
  const [classQuizIndex, setClassQuizIndex] = useState(0);
  const [classQuizLocked, setClassQuizLocked] = useState(false);
  const [classQuizFeedback, setClassQuizFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [trafficFound, setTrafficFound] = useState<string[]>([]);
  const [trafficQuizIndex, setTrafficQuizIndex] = useState(0);
  const [trafficQuizLocked, setTrafficQuizLocked] = useState(false);
  const [trafficFeedback, setTrafficFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [trafficQuizDone, setTrafficQuizDone] = useState(false);
  const [poolFound, setPoolFound] = useState<string[]>([]);
  const [pickedPoolSteps, setPickedPoolSteps] = useState<string[]>([]);
  const [poolSequenceDone, setPoolSequenceDone] = useState(false);
  const [labFound, setLabFound] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [labUnlocked, setLabUnlocked] = useState(false);
  const [hintTarget, setHintTarget] = useState<string | null>(null);
  const [best, setBest] = useState<{ score: number; time: number } | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapter =
    phase === "classroom" || phase === "classroom-quiz"
      ? 1
      : phase === "traffic"
        ? 2
        : phase === "pool"
          ? 3
          : phase === "lab"
            ? 4
            : phase === "final"
              ? 5
              : 0;

  const currentInventory = useMemo(
    () =>
      inventoryByPhase.filter(
        (item) => phaseOrder.indexOf(phase) >= phaseOrder.indexOf(item.phase),
      ),
    [phase],
  );

  useEffect(() => {
    const raw = window.localStorage.getItem("safe-school-best");
    if (raw) {
      try {
        setBest(JSON.parse(raw));
      } catch {
        window.localStorage.removeItem("safe-school-best");
      }
    }
  }, []);

  useEffect(() => {
    if (phase === "intro" || phase === "final") return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "final") return;
    setBest((previous) => {
      const next =
        !previous ||
        score > previous.score ||
        (score === previous.score && elapsed < previous.time)
          ? { score, time: elapsed }
          : previous;
      window.localStorage.setItem("safe-school-best", JSON.stringify(next));
      return next;
    });
  }, [phase, score, elapsed]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
    },
    [],
  );

  function playTone(kind: "good" | "bad" | "click" | "win") {
    if (!soundOn) return;
    const AudioCtor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioCtor) return;
    const context = audioRef.current ?? new AudioCtor();
    audioRef.current = context;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const frequencies = {
      good: [523, 659],
      bad: [210, 170],
      click: [380, 460],
      win: [523, 659, 784],
    };
    const notes = frequencies[kind];
    oscillator.type = kind === "bad" ? "sawtooth" : "sine";
    oscillator.frequency.setValueAtTime(notes[0], now);
    notes.slice(1).forEach((note, index) => {
      oscillator.frequency.setValueAtTime(note, now + (index + 1) * 0.09);
    });
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "bad" ? 0.035 : 0.07, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.36);
  }

  function announce(next: Exclude<Toast, null>, duration = 3200) {
    setToast(next);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), duration);
  }

  function addScore(points: number) {
    setScore((value) => Math.max(0, Math.min(100, value + points)));
  }

  function startGame() {
    setElapsed(0);
    setPhase("classroom");
    playTone("click");
    announce({
      title: "미션 1 · 교실",
      message: "그림 속 위험요소 5개를 모두 찾아 안전 렌즈를 복구하세요.",
      tone: "info",
    });
  }

  function resetGame() {
    setPhase("intro");
    setScore(0);
    setElapsed(0);
    setHints(3);
    setToast(null);
    setClassFound([]);
    setClassQuizIndex(0);
    setClassQuizLocked(false);
    setClassQuizFeedback(null);
    setTrafficFound([]);
    setTrafficQuizIndex(0);
    setTrafficQuizLocked(false);
    setTrafficFeedback(null);
    setTrafficQuizDone(false);
    setPoolFound([]);
    setPickedPoolSteps([]);
    setPoolSequenceDone(false);
    setLabFound([]);
    setCode("");
    setLabUnlocked(false);
    setHintTarget(null);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  }

  function findClassHazard(id: string) {
    if (classFound.includes(id)) return;
    const hazard = classroomHazards.find((item) => item.id === id);
    if (!hazard) return;
    setClassFound((items) => [...items, id]);
    addScore(3);
    playTone("good");
    announce({
      title: `${hazard.icon} ${hazard.label} 발견!`,
      message: hazard.lesson,
      tone: "good",
    });
  }

  function useHint(targets: Array<{ id: string }>, found: string[]) {
    if (hints <= 0) {
      announce({
        title: "힌트를 모두 사용했어요",
        message: "화면의 물건을 천천히 살펴보면 반짝이는 단서가 보여요.",
        tone: "warn",
      });
      playTone("bad");
      return;
    }
    const target = targets.find((item) => !found.includes(item.id));
    if (!target) {
      announce({
        title: "이 구역은 해결 완료",
        message: "모든 단서를 이미 찾았어요!",
        tone: "good",
      });
      return;
    }
    setHints((value) => value - 1);
    setHintTarget(target.id);
    addScore(-2);
    playTone("click");
    announce({
      title: "스캔 힌트 사용",
      message: "단서 하나가 잠시 밝게 표시됩니다. 힌트 사용으로 2점이 차감됐어요.",
      tone: "info",
    });
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHintTarget(null), 4200);
  }

  function answerClassQuiz(answer: "O" | "X") {
    if (classQuizLocked) return;
    const question = classroomQuiz[classQuizIndex];
    const correct = answer === question.answer;
    setClassQuizLocked(true);
    setClassQuizFeedback({ correct, text: question.explanation });
    playTone(correct ? "good" : "bad");
    if (correct) {
      addScore(5);
      setTimeout(() => {
        if (classQuizIndex === classroomQuiz.length - 1) {
          setClassQuizFeedback(null);
          setClassQuizLocked(false);
          setPhase("traffic");
          announce({
            title: "안전 렌즈 복구 완료",
            message: "학교 밖 통학로가 열렸어요. 등하교·자전거 위험요소를 찾아주세요.",
            tone: "good",
          });
        } else {
          setClassQuizIndex((index) => index + 1);
          setClassQuizFeedback(null);
          setClassQuizLocked(false);
        }
      }, 1450);
    } else {
      addScore(-2);
      setTimeout(() => {
        setClassQuizFeedback(null);
        setClassQuizLocked(false);
      }, 1700);
    }
  }

  function findTrafficSpot(id: string) {
    if (trafficFound.includes(id)) return;
    const spot = trafficSpots.find((item) => item.id === id);
    if (!spot) return;
    setTrafficFound((items) => [...items, id]);
    addScore(4);
    playTone("good");
    announce({
      title: `${spot.icon} ${spot.label} 발견!`,
      message: spot.lesson,
      tone: "good",
    });
  }

  function answerTrafficQuiz(answer: "O" | "X") {
    if (trafficQuizLocked) return;
    const question = trafficQuiz[trafficQuizIndex];
    const correct = answer === question.answer;
    setTrafficQuizLocked(true);
    setTrafficFeedback({ correct, text: question.explanation });
    playTone(correct ? "good" : "bad");
    if (correct) {
      addScore(4);
      setTimeout(() => {
        if (trafficQuizIndex === trafficQuiz.length - 1) {
          setTrafficQuizDone(true);
          setTrafficFeedback(null);
          setTrafficQuizLocked(false);
          announce({
            title: "통학 나침반 획득!",
            message: "걷기와 자전거 이용 중 위험을 구별하는 힘을 얻었어요.",
            tone: "good",
          });
        } else {
          setTrafficQuizIndex((index) => index + 1);
          setTrafficFeedback(null);
          setTrafficQuizLocked(false);
        }
      }, 1350);
    } else {
      addScore(-2);
      setTimeout(() => {
        setTrafficFeedback(null);
        setTrafficQuizLocked(false);
      }, 1650);
    }
  }

  function enterPool() {
    setPhase("pool");
    playTone("click");
    announce({
      title: "미션 3 · 학교 수영장",
      message: "물가의 위험행동 4개를 찾고 안전한 입수 순서를 완성하세요.",
      tone: "info",
    });
  }

  function findPoolSpot(id: string) {
    if (poolFound.includes(id)) return;
    const spot = poolSpots.find((item) => item.id === id);
    if (!spot) return;
    setPoolFound((items) => [...items, id]);
    addScore(3);
    playTone("good");
    announce({
      title: `${spot.icon} ${spot.label} 발견!`,
      message: spot.lesson,
      tone: "good",
    });
  }

  function pickPoolStep(id: string) {
    if (poolSequenceDone || pickedPoolSteps.includes(id)) return;
    const expected = poolSteps[pickedPoolSteps.length].id;
    if (id !== expected) {
      addScore(-2);
      playTone("bad");
      setPickedPoolSteps([]);
      announce({
        title: "순서를 다시 생각해요",
        message: "물에 들어가기 전 가장 먼저 확인할 것부터 차례대로 선택해 보세요.",
        tone: "warn",
      });
      return;
    }
    const next = [...pickedPoolSteps, id];
    setPickedPoolSteps(next);
    playTone("click");
    if (next.length === poolSteps.length) {
      addScore(10);
      setPoolSequenceDone(true);
      playTone("win");
      announce({
        title: "아쿠아 실드 획득!",
        message: "안전요원 확인부터 천천히 입수하기까지 완벽하게 해냈어요.",
        tone: "good",
      });
    }
  }

  function enterLab() {
    setPhase("lab");
    playTone("click");
    announce({
      title: "미션 4 · 과학실",
      message: "네 개의 안전 단서를 찾아 잠긴 캐비닛의 암호를 해제하세요.",
      tone: "info",
    });
  }

  function findLabClue(id: string) {
    if (labFound.includes(id)) return;
    const clue = labClues.find((item) => item.id === id);
    if (!clue) return;
    setLabFound((items) => [...items, id]);
    addScore(3);
    playTone("good");
    announce({
      title: `${clue.icon} ${clue.label} · 숫자 ${clue.digit}`,
      message: clue.lesson,
      tone: "good",
    });
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (labFound.length < labClues.length) {
      playTone("bad");
      announce({
        title: "단서가 부족해요",
        message: "과학실 그림에서 안전 단서 4개를 먼저 모두 찾아주세요.",
        tone: "warn",
      });
      return;
    }
    if (code === "6284") {
      setLabUnlocked(true);
      addScore(12);
      playTone("win");
      announce({
        title: "안전코어 잠금 해제!",
        message: "보호구와 위험요소를 올바른 순서로 확인했어요.",
        tone: "good",
      });
    } else {
      addScore(-2);
      playTone("bad");
      setCode("");
      announce({
        title: "암호가 맞지 않아요",
        message: "메모의 순서 ‘눈 → 손 → 액체 → 열’을 다시 확인해 보세요.",
        tone: "warn",
      });
    }
  }

  function finishGame() {
    setPhase("final");
    playTone("win");
  }

  return (
    <main className="game-shell">
      {phase !== "intro" && phase !== "final" && (
        <header className="hud" aria-label="게임 상태">
          <div className="hud-brand">
            <img className="hud-avatar" src="/assets/safebot-character.png" alt="" />
            <div>
              <span className="eyebrow">SAFE SCHOOL</span>
              <strong>잠긴 안전코어</strong>
            </div>
          </div>

          <div className="mission-progress" aria-label={`전체 4개 미션 중 ${chapter}번째`}>
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={cx(
                  "progress-node",
                  chapter === step && "active",
                  chapter > step && "done",
                )}
              >
                <i>{chapter > step ? "✓" : step}</i>
                <b>{["교실", "통학로", "수영장", "과학실"][step - 1]}</b>
              </span>
            ))}
          </div>

          <div className="hud-stats">
            <span className="stat-chip score-chip" aria-label={`점수 ${score}점`}>
              <i aria-hidden="true">✦</i>
              <b>{score}</b>
            </span>
            <span className="stat-chip" aria-label={`진행 시간 ${formatTime(elapsed)}`}>
              <i aria-hidden="true">◷</i>
              <b>{formatTime(elapsed)}</b>
            </span>
            <button
              className="icon-button"
              type="button"
              onClick={() => setSoundOn((value) => !value)}
              aria-label={soundOn ? "효과음 끄기" : "효과음 켜기"}
            >
              {soundOn ? "♪" : "×"}
            </button>
            <button
              className="icon-button desktop-only"
              type="button"
              onClick={toggleFullscreen}
              aria-label="전체화면 전환"
            >
              ⛶
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={() => setTeacherOpen(true)}
              aria-label="교사용 해설 열기"
            >
              ?
            </button>
          </div>
        </header>
      )}

      {phase === "intro" && (
        <section className="intro-screen">
          <img
            className="full-bleed-image"
            src="/assets/school-entrance.png"
            alt="석양의 학교 입구에서 안전 로봇이 모험을 안내하는 모습"
          />
          <div className="intro-vignette" />
          <div className="intro-topbar">
            <div className="intro-logo">
              <span className="brand-mark large" aria-hidden="true">
                S
              </span>
              <span>SAFE SCHOOL PROJECT</span>
            </div>
            <button className="glass-button" type="button" onClick={() => setTeacherOpen(true)}>
              교사용 해설
            </button>
          </div>
          <div className="intro-copy">
            <span className="mission-kicker">
              <i aria-hidden="true">●</i> SCHOOL SAFETY ESCAPE
            </span>
            <h1>
              잠긴
              <br />
              <em>안전코어</em>
            </h1>
            <p>
              방과 후, 학교의 안전 시스템이 멈췄다.
              <br />
              네 개의 구역을 탐색하고 올바른 판단으로 학교를 깨워라.
            </p>
            <div className="intro-actions">
              <button className="primary-button hero-button" type="button" onClick={startGame}>
                <span>미션 시작</span>
                <i aria-hidden="true">→</i>
              </button>
              <div className="game-facts" aria-label="게임 정보">
                <span>
                  <b>4</b>개 구역
                </span>
                <span>
                  <b>15</b>분 예상
                </span>
                <span>
                  <b>1</b>인 플레이
                </span>
              </div>
            </div>
            {best && (
              <div className="best-record">
                <span aria-hidden="true">◆</span>
                최고 기록 <b>{best.score}점</b> · {formatTime(best.time)}
              </div>
            )}
          </div>
          <div className="intro-side-card">
            <img
              className="safebot-avatar"
              src="/assets/safebot-character.png"
              alt="안전 안내 로봇 세이프봇"
            />
            <div>
              <span>세이프봇의 메시지</span>
              <p>“정답을 외우는 것보다 위험을 먼저 발견하는 눈이 중요해!”</p>
            </div>
          </div>
          <div className="intro-footer">
            <span>대상 · 초등 4–6학년</span>
            <span>생활안전 · 교통안전 · 물놀이안전 · 실험안전</span>
          </div>
        </section>
      )}

      {phase === "classroom" && (
        <section className="mission-screen">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label">MISSION 01</span>
                <h2>교실의 위험 신호를 찾아라</h2>
              </div>
              <p>
                화면 속 물건을 눌러 위험요소 <b>5개</b>를 모두 찾으세요.
              </p>
            </div>
            <div className="scene-frame">
              <img
                src="/assets/classroom.png"
                alt="방과 후 교실. 멀티탭, 가방, 책, 가위, 난방기 주변을 살펴볼 수 있다."
              />
              <div className="scan-line" aria-hidden="true" />
              {classroomHazards.map((hazard) => {
                const found = classFound.includes(hazard.id);
                return (
                  <button
                    type="button"
                    key={hazard.id}
                    className={cx(
                      "hotspot",
                      found && "found",
                      hintTarget === hazard.id && "hinted",
                    )}
                    style={{
                      left: `${hazard.x}%`,
                      top: `${hazard.y}%`,
                      width: `${hazard.w}%`,
                      height: `${hazard.h}%`,
                    }}
                    onClick={() => findClassHazard(hazard.id)}
                    aria-label={found ? `${hazard.label} 발견 완료` : "위험요소 확인하기"}
                  >
                    <span aria-hidden="true">{found ? "✓" : "⌕"}</span>
                    {found && <b>{hazard.label}</b>}
                  </button>
                );
              })}
              <span className="scene-caption">천천히 관찰하고 의심되는 물건을 클릭하세요</span>
            </div>
          </div>

          <aside className="mission-panel">
            <div className="panel-top">
              <div>
                <span className="panel-label">위험 탐지</span>
                <strong>
                  {classFound.length}
                  <small>/ 5</small>
                </strong>
              </div>
              <div
                className="radial-progress"
                style={{
                  background: `conic-gradient(var(--mint) ${classFound.length * 20}%, rgba(255,255,255,.08) 0)`,
                }}
                aria-hidden="true"
              >
                <span>{classFound.length * 20}%</span>
              </div>
            </div>

            <div className="found-list" aria-live="polite">
              {classroomHazards.map((hazard) => {
                const found = classFound.includes(hazard.id);
                return (
                  <div className={cx("found-item", found && "revealed")} key={hazard.id}>
                    <span aria-hidden="true">{found ? hazard.icon : "?"}</span>
                    <div>
                      <b>{found ? hazard.label : "아직 찾지 못한 위험"}</b>
                      <small>{found ? hazard.lesson : "교실을 더 자세히 살펴보세요."}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {classFound.length === classroomHazards.length ? (
              <button
                className="primary-button panel-action"
                type="button"
                onClick={() => {
                  setPhase("classroom-quiz");
                  playTone("click");
                }}
              >
                OX 관문 열기 <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                className="hint-button"
                type="button"
                onClick={() => useHint(classroomHazards, classFound)}
              >
                <span aria-hidden="true">◎</span>
                스캔 힌트
                <b>{hints}개 남음</b>
              </button>
            )}
          </aside>
        </section>
      )}

      {phase === "classroom-quiz" && (
        <section className="quiz-screen">
          <img
            className="full-bleed-image blurred"
            src="/assets/classroom.png"
            alt=""
            aria-hidden="true"
          />
          <div className="quiz-backdrop" />
          <div className="quiz-card">
            <div className="quiz-card-top">
              <span className="chapter-label">SAFETY GATE · OX</span>
              <span>
                {classQuizIndex + 1} / {classroomQuiz.length}
              </span>
            </div>
            <div className="quiz-progress">
              <i
                style={{
                  width: `${((classQuizIndex + 1) / classroomQuiz.length) * 100}%`,
                }}
              />
            </div>
            <div className="quiz-symbol" aria-hidden="true">
              ?
            </div>
            <h2>{classroomQuiz[classQuizIndex].statement}</h2>
            <p>맞다고 생각하면 O, 틀리다고 생각하면 X를 선택하세요.</p>
            <div className="ox-buttons">
              <button
                type="button"
                className="ox-button o"
                onClick={() => answerClassQuiz("O")}
                disabled={classQuizLocked}
              >
                <b>O</b>
                <span>맞아요</span>
              </button>
              <button
                type="button"
                className="ox-button x"
                onClick={() => answerClassQuiz("X")}
                disabled={classQuizLocked}
              >
                <b>X</b>
                <span>아니에요</span>
              </button>
            </div>
            {classQuizFeedback && (
              <div
                className={cx(
                  "inline-feedback",
                  classQuizFeedback.correct ? "correct" : "incorrect",
                )}
                role="status"
              >
                <span aria-hidden="true">{classQuizFeedback.correct ? "✓" : "!"}</span>
                <div>
                  <b>{classQuizFeedback.correct ? "정확해요!" : "한 번 더 생각해요"}</b>
                  <p>{classQuizFeedback.text}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "traffic" && (
        <section className="mission-screen traffic-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label coral">MISSION 02</span>
                <h2>안전한 통학로를 복구하라</h2>
              </div>
              <p>
                등하교 길과 자전거 이용 중 <b>위험행동 3개</b>를 찾으세요.
              </p>
            </div>
            <div className="scene-frame">
              <img
                src="/assets/traffic-school-zone.png"
                alt="학교 앞 횡단보도에서 스마트폰 보행, 주차 차량 사이 횡단, 안전모 없는 자전거 주행을 살펴볼 수 있는 장면"
              />
              {trafficSpots.map((spot) => {
                const found = trafficFound.includes(spot.id);
                return (
                  <button
                    type="button"
                    key={spot.id}
                    className={cx(
                      "hotspot",
                      found && "found",
                      hintTarget === spot.id && "hinted",
                    )}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.w}%`,
                      height: `${spot.h}%`,
                    }}
                    onClick={() => findTrafficSpot(spot.id)}
                    aria-label={found ? `${spot.label} 발견 완료` : "교통 위험행동 확인"}
                  >
                    <span aria-hidden="true">{found ? "✓" : "⌕"}</span>
                    {found && <b>{spot.label}</b>}
                  </button>
                );
              })}
              <div className="safe-role-callout traffic-safe">
                <span aria-hidden="true">✓</span>
                <b>안전모 · 멈춤 · 좌우 확인</b>
              </div>
              <span className="scene-caption">
                길을 건널 때는 멈추고, 좌우를 살핀 뒤, 횡단보도로 이동해요
              </span>
            </div>
          </div>

          <aside className="mission-panel traffic-panel">
            <div className="guide-tip">
              <img src="/assets/safebot-character.png" alt="" />
              <p>
                <b>세이프봇</b>
                “안전한 친구와 위험한 친구의 차이를 그림에서 찾아봐!”
              </p>
            </div>

            {trafficFound.length < trafficSpots.length ? (
              <>
                <div className="panel-top compact-panel-top">
                  <div>
                    <span className="panel-label">교통 위험 탐지</span>
                    <strong>
                      {trafficFound.length}
                      <small> / {trafficSpots.length}</small>
                    </strong>
                  </div>
                </div>
                <div className="found-list">
                  {trafficSpots.map((spot) => {
                    const found = trafficFound.includes(spot.id);
                    return (
                      <div className={cx("found-item", found && "revealed")} key={spot.id}>
                        <span aria-hidden="true">{found ? spot.icon : "?"}</span>
                        <div>
                          <b>{found ? spot.label : "숨은 교통 위험"}</b>
                          <small>{found ? spot.lesson : "통학로 장면을 자세히 살펴보세요."}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="hint-button"
                  type="button"
                  onClick={() => useHint(trafficSpots, trafficFound)}
                >
                  <span aria-hidden="true">◎</span>
                  스캔 힌트
                  <b>{hints}개 남음</b>
                </button>
              </>
            ) : !trafficQuizDone ? (
              <>
                <div className="decision-header">
                  <div className="traffic-light-dot" aria-hidden="true" />
                  <div>
                    <span className="panel-label">교통안전 OX</span>
                    <strong>
                      질문 {trafficQuizIndex + 1}
                      <small> / {trafficQuiz.length}</small>
                    </strong>
                  </div>
                </div>
                <div className="decision-card traffic-card">
                  <span aria-hidden="true">판단</span>
                  <h3>{trafficQuiz[trafficQuizIndex].statement}</h3>
                </div>
                <div className="compact-ox">
                  <button
                    type="button"
                    onClick={() => answerTrafficQuiz("O")}
                    disabled={trafficQuizLocked}
                  >
                    <b>O</b>
                    맞다
                  </button>
                  <button
                    type="button"
                    onClick={() => answerTrafficQuiz("X")}
                    disabled={trafficQuizLocked}
                  >
                    <b>X</b>
                    아니다
                  </button>
                </div>
                {trafficFeedback && (
                  <div
                    className={cx(
                      "inline-feedback compact",
                      trafficFeedback.correct ? "correct" : "incorrect",
                    )}
                    role="status"
                  >
                    <span aria-hidden="true">{trafficFeedback.correct ? "✓" : "!"}</span>
                    <p>{trafficFeedback.text}</p>
                  </div>
                )}
                <div className="question-dots" aria-hidden="true">
                  {trafficQuiz.map((_, index) => (
                    <i
                      key={index}
                      className={cx(
                        index === trafficQuizIndex && "active",
                        index < trafficQuizIndex && "done",
                      )}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mission-cleared-card">
                <span aria-hidden="true">✦</span>
                <small>MISSION 02 CLEAR</small>
                <h3>통학 나침반을 획득했어요</h3>
                <p>스마트폰은 넣고, 안전모를 쓰고, 횡단보도에서는 자전거를 끌고 건너요.</p>
                <button className="primary-button panel-action" type="button" onClick={enterPool}>
                  학교 수영장으로 <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </aside>
        </section>
      )}

      {phase === "pool" && (
        <section className="mission-screen pool-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label aqua">MISSION 03</span>
                <h2>수영장의 위험 파동을 멈춰라</h2>
              </div>
              <p>
                물가의 <b>위험행동 4개</b>를 찾고 안전한 입수 순서를 완성하세요.
              </p>
            </div>
            <div className="scene-frame pool-frame">
              <img
                src="/assets/school-pool.png"
                alt="학교 수영장에서 달리기, 밀기, 얕은 곳 다이빙, 혼자 수영하는 행동과 안전한 구명조끼 착용을 살펴볼 수 있는 장면"
              />
              {poolSpots.map((spot) => {
                const found = poolFound.includes(spot.id);
                return (
                  <button
                    type="button"
                    key={spot.id}
                    className={cx(
                      "hotspot pool-hotspot",
                      found && "found",
                      hintTarget === spot.id && "hinted",
                    )}
                    style={{
                      left: `${spot.x}%`,
                      top: `${spot.y}%`,
                      width: `${spot.w}%`,
                      height: `${spot.h}%`,
                    }}
                    onClick={() => findPoolSpot(spot.id)}
                    aria-label={found ? `${spot.label} 발견 완료` : "물놀이 위험행동 확인"}
                  >
                    <span aria-hidden="true">{found ? "✓" : "⌕"}</span>
                    {found && <b>{spot.label}</b>}
                  </button>
                );
              })}
              <div className="safe-role-callout pool-safe">
                <span aria-hidden="true">✓</span>
                <b>보호자 · 준비운동 · 구명조끼</b>
              </div>
              <span className="scene-caption">
                어린이는 보호자·안전요원과 함께 정해진 구역에서 물놀이해요
              </span>
            </div>
          </div>

          <aside className="mission-panel pool-panel">
            <div className="guide-tip aqua-tip">
              <img src="/assets/safebot-character.png" alt="" />
              <p>
                <b>세이프봇</b>
                “물은 즐겁지만 작은 장난도 큰 위험이 될 수 있어!”
              </p>
            </div>

            {poolFound.length < poolSpots.length ? (
              <>
                <div className="panel-top compact-panel-top">
                  <div>
                    <span className="panel-label">물놀이 위험 탐지</span>
                    <strong>
                      {poolFound.length}
                      <small> / {poolSpots.length}</small>
                    </strong>
                  </div>
                </div>
                <div className="found-list">
                  {poolSpots.map((spot) => {
                    const found = poolFound.includes(spot.id);
                    return (
                      <div className={cx("found-item pool-found", found && "revealed")} key={spot.id}>
                        <span aria-hidden="true">{found ? spot.icon : "?"}</span>
                        <div>
                          <b>{found ? spot.label : "숨은 물놀이 위험"}</b>
                          <small>{found ? spot.lesson : "수영장 안팎을 천천히 살펴보세요."}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="hint-button"
                  type="button"
                  onClick={() => useHint(poolSpots, poolFound)}
                >
                  <span aria-hidden="true">◎</span>
                  아쿠아 스캔
                  <b>{hints}개 남음</b>
                </button>
              </>
            ) : (
              <>
                <div className="sequence-header">
                  <span className="panel-label">안전 입수 순서</span>
                  <strong>물에 들어가기 전부터 시작해요</strong>
                  <p>가장 먼저 해야 할 확인부터 차례대로 선택하세요.</p>
                </div>
                <div className="sequence-slots" aria-label="선택한 물놀이 안전 순서">
                  {poolSteps.map((step, index) => {
                    const selected = pickedPoolSteps[index] === step.id;
                    return (
                      <div className={cx("sequence-slot", selected && "filled")} key={step.id}>
                        <span>{index + 1}</span>
                        <b>{selected ? step.short : "선택 대기"}</b>
                      </div>
                    );
                  })}
                </div>
                <div className="sequence-options">
                  {scrambledPoolSteps.map((step) => (
                    <button
                      type="button"
                      key={step.id}
                      className={cx(pickedPoolSteps.includes(step.id) && "picked")}
                      onClick={() => pickPoolStep(step.id)}
                      disabled={pickedPoolSteps.includes(step.id) || poolSequenceDone}
                    >
                      <span aria-hidden="true">{step.icon}</span>
                      <div>
                        <b>{step.short}</b>
                        <small>{step.text}</small>
                      </div>
                    </button>
                  ))}
                </div>
                {poolSequenceDone && (
                  <button className="primary-button panel-action aqua-action" type="button" onClick={enterLab}>
                    과학실로 이동 <span aria-hidden="true">→</span>
                  </button>
                )}
              </>
            )}
          </aside>
        </section>
      )}

      {phase === "lab" && (
        <section className="mission-screen lab-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label amber">MISSION 04</span>
                <h2>과학실의 암호를 해제하라</h2>
              </div>
              <p>
                보호구와 위험 신호 <b>4개</b>를 찾아 숫자를 모으세요.
              </p>
            </div>
            <div className="scene-frame">
              <img
                src="/assets/science-lab.png"
                alt="보안경, 보호장갑, 쏟아진 액체, 열원, 잠긴 캐비닛이 있는 과학실"
              />
              {labClues.map((clue) => {
                const found = labFound.includes(clue.id);
                return (
                  <button
                    type="button"
                    key={clue.id}
                    className={cx(
                      "hotspot lab-hotspot",
                      found && "found",
                      hintTarget === clue.id && "hinted",
                    )}
                    style={{
                      left: `${clue.x}%`,
                      top: `${clue.y}%`,
                      width: `${clue.w}%`,
                      height: `${clue.h}%`,
                    }}
                    onClick={() => findLabClue(clue.id)}
                    aria-label={found ? `${clue.label}, 숫자 ${clue.digit} 발견` : "실험실 단서 확인"}
                  >
                    <span aria-hidden="true">{found ? clue.digit : "⌕"}</span>
                    {found && <b>{clue.label}</b>}
                  </button>
                );
              })}
              <button
                type="button"
                className={cx("cabinet-lock", labUnlocked && "unlocked")}
                onClick={() =>
                  announce({
                    title: labUnlocked ? "캐비닛이 열렸어요" : "네 자리 암호가 필요해요",
                    message: labUnlocked
                      ? "마지막 안전코어가 빛나고 있습니다."
                      : "단서 순서: 눈 → 손 → 액체 → 열",
                    tone: labUnlocked ? "good" : "info",
                  })
                }
                aria-label={labUnlocked ? "열린 캐비닛" : "잠긴 캐비닛 확인"}
              >
                <span aria-hidden="true">{labUnlocked ? "✓" : "⌑"}</span>
                {labUnlocked ? "해제 완료" : "LOCKED"}
              </button>
              <span className="scene-caption">물건을 클릭하면 안전수칙과 숫자 단서가 나타납니다</span>
            </div>
          </div>

          <aside className="mission-panel lab-panel">
            <div className="code-header">
              <span className="panel-label">안전코어 잠금장치</span>
              <strong>네 자리 암호</strong>
              <p>메모에 적힌 순서대로 발견한 숫자를 입력하세요.</p>
            </div>

            <div className="lab-note">
              <span>LAB NOTE</span>
              <div>
                <b>눈</b>
                <i>→</i>
                <b>손</b>
                <i>→</i>
                <b>액체</b>
                <i>→</i>
                <b>열</b>
              </div>
            </div>

            <div className="clue-grid" aria-label="발견한 암호 단서">
              {labClues.map((clue) => {
                const found = labFound.includes(clue.id);
                return (
                  <div className={cx("clue-tile", found && "revealed")} key={clue.id}>
                    <span aria-hidden="true">{found ? clue.icon : "?"}</span>
                    <b>{found ? clue.digit : "·"}</b>
                    <small>{found ? clue.label : "미발견"}</small>
                  </div>
                );
              })}
            </div>

            <form className="code-form" onSubmit={submitCode}>
              <label htmlFor="safe-code">암호 입력</label>
              <input
                id="safe-code"
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
                }
                inputMode="numeric"
                autoComplete="off"
                placeholder="••••"
                aria-describedby="code-help"
                disabled={labUnlocked}
              />
              <small id="code-help">단서 4개를 찾은 뒤 입력하세요.</small>
              {!labUnlocked ? (
                <button className="primary-button panel-action" type="submit">
                  잠금 해제 <span aria-hidden="true">⌁</span>
                </button>
              ) : (
                <button className="primary-button panel-action success" type="button" onClick={finishGame}>
                  운동장으로 탈출 <span aria-hidden="true">→</span>
                </button>
              )}
            </form>
            {!labUnlocked && labFound.length < labClues.length && (
              <button
                className="hint-button"
                type="button"
                onClick={() => useHint(labClues, labFound)}
              >
                <span aria-hidden="true">◎</span>
                스캔 힌트
                <b>{hints}개 남음</b>
              </button>
            )}
          </aside>
        </section>
      )}

      {phase === "final" && (
        <section className="final-screen">
          <img
            className="full-bleed-image"
            src="/assets/schoolyard-final.png"
            alt="학교 운동장에서 학생들과 선생님이 안전코어 복구를 축하하는 모습"
          />
          <div className="final-vignette" />
          <div className="confetti" aria-hidden="true">
            {Array.from({ length: 34 }, (_, index) => (
              <i
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  animationDelay: `${(index % 9) * 0.13}s`,
                  animationDuration: `${2.8 + (index % 5) * 0.25}s`,
                  background: ["#6ce2c6", "#ffb35c", "#ff6d68", "#8ca9ff"][
                    index % 4
                  ],
                }}
              />
            ))}
          </div>
          <div className="final-card">
            <span className="mission-complete">MISSION COMPLETE</span>
            <div className="final-badge" aria-hidden="true">
              <span>★</span>
            </div>
            <h1>학교의 안전코어가<br />다시 깨어났어요!</h1>
            <p>
              위험을 발견하고, 침착하게 판단하고, 올바른 순서를 선택했습니다.
              <br />
              이제 당신은 우리 학교의 <b>안전 수호대</b>입니다.
            </p>
            <div className="result-board">
              <div>
                <span>최종 점수</span>
                <strong>{score}<small>/100</small></strong>
              </div>
              <div>
                <span>탈출 시간</span>
                <strong>{formatTime(elapsed)}</strong>
              </div>
              <div>
                <span>획득 배지</span>
                <strong>4<small>/4</small></strong>
              </div>
            </div>
            <div className="earned-badges">
              <span><i>◉</i> 교실 관찰자</span>
              <span><i>✦</i> 통학 지킴이</span>
              <span><i>≈</i> 물놀이 수호자</span>
              <span><i>◆</i> 안전 실험가</span>
            </div>
            <div className="final-actions">
              <button className="primary-button" type="button" onClick={resetGame}>
                다시 도전하기 <span aria-hidden="true">↻</span>
              </button>
              <button className="secondary-button" type="button" onClick={() => setTeacherOpen(true)}>
                배운 내용 정리
              </button>
            </div>
          </div>
        </section>
      )}

      {phase !== "intro" && phase !== "final" && (
        <div className="inventory-bar" aria-label="획득한 미션 아이템">
          <span>MISSION KIT</span>
          {inventoryByPhase.map((item) => {
            const obtained = currentInventory.some((current) => current.label === item.label);
            return (
              <div className={cx("inventory-item", obtained && "obtained")} key={item.label}>
                <i aria-hidden="true">{obtained ? item.icon : "·"}</i>
                <b>{obtained ? item.label : "잠김"}</b>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("현재 미션을 끝내고 처음 화면으로 돌아갈까요?")) resetGame();
            }}
          >
            처음으로
          </button>
        </div>
      )}

      {toast && (
        <div className={cx("toast", toast.tone)} role="status" aria-live="polite">
          <span aria-hidden="true">
            {toast.tone === "good" ? "✓" : toast.tone === "warn" ? "!" : "i"}
          </span>
          <div>
            <b>{toast.title}</b>
            <p>{toast.message}</p>
          </div>
          <button type="button" onClick={() => setToast(null)} aria-label="알림 닫기">
            ×
          </button>
        </div>
      )}

      {teacherOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={() => setTeacherOpen(false)}>
          <section
            className="teacher-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <span className="chapter-label">TEACHER GUIDE</span>
                <h2 id="teacher-title">교사용 진행·해설</h2>
              </div>
              <button type="button" onClick={() => setTeacherOpen(false)} aria-label="해설 닫기">
                ×
              </button>
            </div>
            <p className="modal-lead">
              초등 4–6학년이 약 12–18분 동안 교실 생활안전, 등하교·자전거
              교통안전, 물놀이 안전, 실험안전을 스스로 판단하도록 설계했습니다.
            </p>
            <div className="guide-grid">
              <article>
                <span>01</span>
                <h3>교실 위험 찾기</h3>
                <p>멀티탭 과부하, 통로 방해, 낙하물, 가위, 난방기 주변 가연물을 찾습니다.</p>
                <b>정답 위치</b>
                <small>왼쪽 아래 · 중앙 가방 · 오른쪽 위 책 · 앞 책상 · 오른쪽 난방기</small>
              </article>
              <article>
                <span>02</span>
                <h3>등하교·자전거</h3>
                <p>스마트폰 보행, 주차 차량 사이 횡단, 안전모 없는 횡단보도 주행을 찾습니다.</p>
                <b>핵심 질문</b>
                <small>왜 횡단보도에서는 자전거에서 내려 끌고 건너야 할까?</small>
              </article>
              <article>
                <span>03</span>
                <h3>수영장 안전</h3>
                <p>달리기, 밀기, 얕은 곳 다이빙, 혼자 멀리 수영하기의 위험을 찾습니다.</p>
                <b>안전 입수 순서</b>
                <small>보호자·안전구역 확인 → 준비운동 → 구명조끼 → 천천히 입수</small>
              </article>
              <article>
                <span>04</span>
                <h3>과학실 암호</h3>
                <p>보안경 6 → 장갑 2 → 액체 8 → 열원 4, 최종 암호는 6284입니다.</p>
                <b>핵심 질문</b>
                <small>모르는 물질이 쏟아졌을 때 직접 만지지 않고 누구에게 알려야 할까?</small>
              </article>
            </div>
            <div className="guide-note">
              <span aria-hidden="true">!</span>
              <p>
                실제 활동에서는 학교·수영장·도로의 현장 규칙과 교직원·안전요원
                안내를 우선합니다. 게임은 안전 판단을 연습하는 교육용 시뮬레이션입니다.
              </p>
            </div>
            <div className="source-links">
              <span>안전 기준 참고</span>
              <a
                href="https://www.koroad.or.kr/main/board/6/302732/board_view.do?bdNoticeYn=N&bdOpenYn=Y&cp=1&listType=list"
                target="_blank"
                rel="noreferrer"
              >
                한국도로교통공단 · 어린이보호구역 ↗
              </a>
              <a
                href="https://www.mois.go.kr/frt/bbs/type002/commonSelectBoardArticle.do?bbsId=BBSMSTR_000000000216&nttId=118738"
                target="_blank"
                rel="noreferrer"
              >
                행정안전부 · 물놀이 안전수칙 ↗
              </a>
              <a href="https://www.schoolsafe24.or.kr/" target="_blank" rel="noreferrer">
                학교안전지원시스템 ↗
              </a>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
