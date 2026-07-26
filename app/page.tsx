"use client";

import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Phase =
  | "intro"
  | "classroom"
  | "classroom-quiz"
  | "corridor"
  | "traffic"
  | "traffic-quiz"
  | "gym"
  | "pool"
  | "pool-sequence"
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

const corridorHazards = [
  {
    id: "running-corner",
    label: "모퉁이에서 달리기",
    icon: "🏃",
    x: 0,
    y: 35,
    w: 24,
    h: 49,
    lesson: "복도 모퉁이는 앞이 보이지 않아요. 뛰지 말고 오른쪽으로 천천히 걸어요.",
  },
  {
    id: "blocked-exit",
    label: "비상구를 막은 가방",
    icon: "🎒",
    x: 27,
    y: 48,
    w: 21,
    h: 28,
    lesson: "비상구와 대피 통로 앞에는 가방이나 상자를 두지 않아요.",
  },
  {
    id: "wet-floor",
    label: "젖은 복도 바닥",
    icon: "💦",
    x: 53,
    y: 66,
    w: 23,
    h: 22,
    lesson: "물이 쏟아졌다면 뛰어넘지 말고 주변 친구에게 알린 뒤 선생님께 바로 알려요.",
  },
  {
    id: "rail-slide",
    label: "계단 난간 타기",
    icon: "🛝",
    x: 75,
    y: 12,
    w: 21,
    h: 44,
    lesson: "계단 난간은 놀이기구가 아니에요. 손잡이를 잡고 한 칸씩 이동해요.",
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
    statement: "주차된 차 사이에서는 천천히 걷더라도 운전자와 보행자의 시야가 가려질 수 있다.",
    answer: "O",
    explanation:
      "맞아요. 속도를 줄여도 차에 가려 서로 보이지 않을 수 있으므로 시야가 확보된 횡단보도로 건너요.",
  },
];

const gymHazards = [
  {
    id: "leaning-mats",
    label: "기울어진 매트",
    icon: "🧱",
    x: 0,
    y: 43,
    w: 23,
    h: 35,
    lesson: "무거운 매트와 운동기구는 쓰러지지 않게 정해진 자리에 단단히 정리해요.",
  },
  {
    id: "floor-rope",
    label: "바닥에 방치된 줄넘기",
    icon: "➰",
    x: 25,
    y: 47,
    w: 25,
    h: 35,
    lesson: "사용하지 않는 줄넘기는 바로 정리해 밟거나 걸려 넘어지는 사고를 막아요.",
  },
  {
    id: "scattered-balls",
    label: "코트에 흩어진 공",
    icon: "🏀",
    x: 51,
    y: 52,
    w: 24,
    h: 31,
    lesson: "사용하지 않는 공과 콘은 바로 정리해 넘어지거나 부딪히는 사고를 막아요.",
  },
  {
    id: "untied-shoe",
    label: "풀린 운동화 끈",
    icon: "👟",
    x: 77,
    y: 50,
    w: 20,
    h: 37,
    lesson: "운동 전 운동화 끈과 복장을 확인하고, 몸에 맞는 운동화를 신어요.",
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
  { label: "안전 렌즈", icon: "◉", phase: "corridor" as Phase },
  { label: "질서의 발걸음", icon: "↟", phase: "traffic" as Phase },
  { label: "통학 나침반", icon: "✦", phase: "gym" as Phase },
  { label: "스포츠 실드", icon: "⬡", phase: "pool" as Phase },
  { label: "아쿠아 실드", icon: "≈", phase: "lab" as Phase },
  { label: "실험실 키", icon: "◆", phase: "final" as Phase },
];

const rewardBadges = [
  { icon: "◉", title: "교실 관찰자", subject: "생활안전" },
  { icon: "↟", title: "복도 질서왕", subject: "보행안전" },
  { icon: "✦", title: "통학 지킴이", subject: "교통안전" },
  { icon: "⬡", title: "스포츠 가디언", subject: "체육안전" },
  { icon: "≈", title: "물놀이 수호자", subject: "수상안전" },
  { icon: "◆", title: "안전 실험가", subject: "실험안전" },
];

const phaseOrder: Phase[] = [
  "intro",
  "classroom",
  "classroom-quiz",
  "corridor",
  "traffic",
  "traffic-quiz",
  "gym",
  "pool",
  "pool-sequence",
  "lab",
  "final",
];

type MusicTheme = {
  notes: number[];
  interval: number;
  duration: number;
  volume: number;
  wave: OscillatorType;
};

const musicThemes: Record<Exclude<Phase, "intro">, MusicTheme> = {
  classroom: {
    notes: [261.63, 329.63, 392, 329.63, 293.66, 349.23, 392, 349.23],
    interval: 720,
    duration: 1.15,
    volume: 0.008,
    wave: "triangle",
  },
  "classroom-quiz": {
    notes: [392, 523.25, 466.16, 587.33, 523.25, 659.25],
    interval: 520,
    duration: 0.7,
    volume: 0.007,
    wave: "square",
  },
  corridor: {
    notes: [246.94, 293.66, 369.99, 293.66, 261.63, 329.63, 392, 329.63],
    interval: 560,
    duration: 0.76,
    volume: 0.007,
    wave: "triangle",
  },
  traffic: {
    notes: [293.66, 369.99, 440, 369.99, 329.63, 392, 493.88, 392],
    interval: 470,
    duration: 0.62,
    volume: 0.007,
    wave: "triangle",
  },
  "traffic-quiz": {
    notes: [392, 493.88, 587.33, 523.25, 440, 554.37],
    interval: 500,
    duration: 0.68,
    volume: 0.007,
    wave: "square",
  },
  gym: {
    notes: [329.63, 392, 493.88, 392, 369.99, 440, 523.25, 440],
    interval: 410,
    duration: 0.56,
    volume: 0.007,
    wave: "square",
  },
  pool: {
    notes: [349.23, 440, 523.25, 440, 392, 493.88, 587.33, 493.88],
    interval: 790,
    duration: 1.35,
    volume: 0.008,
    wave: "sine",
  },
  "pool-sequence": {
    notes: [440, 523.25, 659.25, 523.25, 493.88, 587.33],
    interval: 620,
    duration: 0.9,
    volume: 0.008,
    wave: "sine",
  },
  lab: {
    notes: [220, 261.63, 329.63, 246.94, 293.66, 369.99, 293.66, 246.94],
    interval: 610,
    duration: 0.95,
    volume: 0.007,
    wave: "triangle",
  },
  final: {
    notes: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25],
    interval: 450,
    duration: 0.75,
    volume: 0.009,
    wave: "sine",
  },
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

type JoystickVector = {
  x: number;
  y: number;
};

type SceneTarget = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function VirtualJoystick({
  disabled,
  onVectorChange,
}: {
  disabled: boolean;
  onVectorChange: (vector: JoystickVector) => void;
}) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!disabled) return;
    setKnob({ x: 0, y: 0 });
    onVectorChange({ x: 0, y: 0 });
  }, [disabled, onVectorChange]);

  function updateVector(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const rawX = event.clientX - (rect.left + rect.width / 2);
    const rawY = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width * 0.32;
    const distance = Math.hypot(rawX, rawY);
    const scale = distance > radius ? radius / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    setKnob({ x, y });
    onVectorChange({
      x: Math.max(-1, Math.min(1, x / radius)),
      y: Math.max(-1, Math.min(1, y / radius)),
    });
  }

  function stop() {
    setKnob({ x: 0, y: 0 });
    onVectorChange({ x: 0, y: 0 });
  }

  return (
    <div
      ref={baseRef}
      className={cx("virtual-joystick", disabled && "disabled")}
      role="application"
      aria-label={disabled ? "OX 퀴즈에서는 조이스틱을 사용하지 않습니다" : "세이프봇 이동 조이스틱"}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        updateVector(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) updateVector(event);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        stop();
      }}
      onPointerCancel={stop}
    >
      <span className="joystick-direction north" aria-hidden="true">▲</span>
      <span className="joystick-direction east" aria-hidden="true">▶</span>
      <span className="joystick-direction south" aria-hidden="true">▼</span>
      <span className="joystick-direction west" aria-hidden="true">◀</span>
      <div
        className="joystick-knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        aria-hidden="true"
      >
        {disabled ? "OX" : ""}
      </div>
    </div>
  );
}

function ExplorerCursor({
  locked,
  position,
}: {
  locked: boolean;
  position: { x: number; y: number };
}) {
  return (
    <div
      className={cx("explorer-cursor", locked && "target-locked")}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      aria-hidden="true"
    >
      <img src="assets/safebot-character.png" alt="" />
      <span>{locked ? "조사 가능" : "이동 중"}</span>
    </div>
  );
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [hints, setHints] = useState(5);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [classFound, setClassFound] = useState<string[]>([]);
  const [classQuizIndex, setClassQuizIndex] = useState(0);
  const [classQuizLocked, setClassQuizLocked] = useState(false);
  const [classQuizFeedback, setClassQuizFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [corridorFound, setCorridorFound] = useState<string[]>([]);
  const [trafficFound, setTrafficFound] = useState<string[]>([]);
  const [trafficQuizIndex, setTrafficQuizIndex] = useState(0);
  const [trafficQuizLocked, setTrafficQuizLocked] = useState(false);
  const [trafficFeedback, setTrafficFeedback] = useState<{
    correct: boolean;
    text: string;
  } | null>(null);
  const [trafficQuizDone, setTrafficQuizDone] = useState(false);
  const [gymFound, setGymFound] = useState<string[]>([]);
  const [poolFound, setPoolFound] = useState<string[]>([]);
  const [pickedPoolSteps, setPickedPoolSteps] = useState<string[]>([]);
  const [poolSequenceDone, setPoolSequenceDone] = useState(false);
  const [labFound, setLabFound] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [labUnlocked, setLabUnlocked] = useState(false);
  const [hintTarget, setHintTarget] = useState<string | null>(null);
  const [best, setBest] = useState<{ score: number; time: number } | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [certificateSaveState, setCertificateSaveState] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [playerPosition, setPlayerPosition] = useState({ x: 50, y: 70 });
  const [joystickVector, setJoystickVector] = useState<JoystickVector>({ x: 0, y: 0 });
  const [controlsMinimized, setControlsMinimized] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const musicStepRef = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const chapter =
    phase === "classroom" || phase === "classroom-quiz"
      ? 1
      : phase === "corridor"
        ? 2
        : phase === "traffic" || phase === "traffic-quiz"
          ? 3
          : phase === "gym"
            ? 4
            : phase === "pool" || phase === "pool-sequence"
              ? 5
              : phase === "lab"
                ? 6
                : phase === "final"
                  ? 7
                  : 0;

  const currentInventory = useMemo(
    () =>
      inventoryByPhase.filter(
        (item) => phaseOrder.indexOf(phase) >= phaseOrder.indexOf(item.phase),
      ),
    [phase],
  );

  const mobileControlMode: "explore" | "ox" | null =
    phase === "classroom"
      ? "explore"
      : phase === "classroom-quiz"
        ? "ox"
        : phase === "corridor"
          ? "explore"
          : phase === "traffic"
            ? "explore"
            : phase === "traffic-quiz"
              ? "ox"
              : phase === "gym" && gymFound.length < gymHazards.length
                ? "explore"
                : phase === "pool" && poolFound.length < poolSpots.length
                  ? "explore"
                  : phase === "lab" && labFound.length < labClues.length
                    ? "explore"
                    : null;

  let controllerTargets: SceneTarget[] = [];
  if (phase === "classroom") {
    controllerTargets = classroomHazards.filter((item) => !classFound.includes(item.id));
  } else if (phase === "corridor") {
    controllerTargets = corridorHazards.filter((item) => !corridorFound.includes(item.id));
  } else if (phase === "traffic" && trafficFound.length < trafficSpots.length) {
    controllerTargets = trafficSpots.filter((item) => !trafficFound.includes(item.id));
  } else if (phase === "gym") {
    controllerTargets = gymHazards.filter((item) => !gymFound.includes(item.id));
  } else if (phase === "pool" && poolFound.length < poolSpots.length) {
    controllerTargets = poolSpots.filter((item) => !poolFound.includes(item.id));
  } else if (phase === "lab" && labFound.length < labClues.length) {
    controllerTargets = labClues.filter((item) => !labFound.includes(item.id));
  }

  const nearestTarget = controllerTargets
    .map((target) => {
      const centerX = target.x + target.w / 2;
      const centerY = target.y + target.h / 2;
      return {
        ...target,
        distance: Math.hypot((centerX - playerPosition.x) * 1.2, centerY - playerPosition.y),
      };
    })
    .sort((a, b) => a.distance - b.distance)[0];
  const targetLocked = Boolean(nearestTarget && nearestTarget.distance <= 14);

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

  useEffect(() => {
    setPlayerPosition({ x: 50, y: 70 });
    setJoystickVector({ x: 0, y: 0 });
    setControlsMinimized(false);
  }, [phase]);

  useEffect(() => {
    if (
      mobileControlMode !== "explore" ||
      controlsMinimized ||
      (joystickVector.x === 0 && joystickVector.y === 0)
    ) {
      return;
    }

    let frame = 0;
    let previous = performance.now();
    const move = (now: number) => {
      const delta = Math.min(32, now - previous);
      previous = now;
      setPlayerPosition((position) => ({
        x: Math.max(4, Math.min(96, position.x + joystickVector.x * delta * 0.052)),
        y: Math.max(6, Math.min(92, position.y + joystickVector.y * delta * 0.052)),
      }));
      frame = requestAnimationFrame(move);
    };
    frame = requestAnimationFrame(move);
    return () => cancelAnimationFrame(frame);
  }, [controlsMinimized, joystickVector, mobileControlMode]);

  useEffect(() => {
    stopBackgroundMusic();
    if (!soundOn || phase === "intro") return;
    startBackgroundMusic(phase);
    return stopBackgroundMusic;
  }, [phase, soundOn]);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      stopBackgroundMusic();
    },
    [],
  );

  function getAudioContext() {
    const AudioCtor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioCtor) return null;
    const context = audioRef.current ?? new AudioCtor();
    audioRef.current = context;
    if (context.state === "suspended") void context.resume();
    return context;
  }

  function stopBackgroundMusic() {
    if (!musicTimerRef.current) return;
    clearInterval(musicTimerRef.current);
    musicTimerRef.current = null;
  }

  function playAmbientNote(context: AudioContext, frequency: number, theme: MusicTheme) {
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = theme.wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(theme.volume, now + 0.045);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + theme.duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + theme.duration + 0.06);
  }

  function startBackgroundMusic(targetPhase: Exclude<Phase, "intro">) {
    const context = getAudioContext();
    if (!context) return;
    const theme = musicThemes[targetPhase];
    musicStepRef.current = 0;

    const playNext = () => {
      const step = musicStepRef.current;
      const frequency = theme.notes[step % theme.notes.length];
      playAmbientNote(context, frequency, theme);
      if (step % 4 === 0) {
        playAmbientNote(context, frequency / 2, {
          ...theme,
          duration: theme.duration * 1.55,
          volume: theme.volume * 0.36,
          wave: "sine",
        });
      }
      musicStepRef.current = step + 1;
    };

    playNext();
    musicTimerRef.current = setInterval(playNext, theme.interval);
  }

  function toggleAudio() {
    if (soundOn) {
      setSoundOn(false);
      return;
    }
    getAudioContext();
    setSoundOn(true);
  }

  function playTone(kind: "good" | "bad" | "click" | "win") {
    if (!soundOn) return;
    const context = getAudioContext();
    if (!context) return;
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
    setScore((value) => Math.max(0, Math.min(120, value + points)));
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
    setHints(5);
    setToast(null);
    setClassFound([]);
    setClassQuizIndex(0);
    setClassQuizLocked(false);
    setClassQuizFeedback(null);
    setCorridorFound([]);
    setTrafficFound([]);
    setTrafficQuizIndex(0);
    setTrafficQuizLocked(false);
    setTrafficFeedback(null);
    setTrafficQuizDone(false);
    setGymFound([]);
    setPoolFound([]);
    setPickedPoolSteps([]);
    setPoolSequenceDone(false);
    setLabFound([]);
    setCode("");
    setLabUnlocked(false);
    setHintTarget(null);
    setCertificateOpen(false);
    setStudentName("");
    setCompletionDate("");
    setCertificateSaveState("idle");
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

  function requestHint(targets: Array<{ id: string }>, found: string[]) {
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
          setPhase("corridor");
          announce({
            title: "안전 렌즈 복구 완료",
            message: "교실 문이 열렸어요. 복도와 계단의 위험요소를 찾아주세요.",
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

  function findCorridorHazard(id: string) {
    if (corridorFound.includes(id)) return;
    const hazard = corridorHazards.find((item) => item.id === id);
    if (!hazard) return;
    setCorridorFound((items) => [...items, id]);
    addScore(3);
    playTone("good");
    announce({
      title: `${hazard.icon} ${hazard.label} 발견!`,
      message: hazard.lesson,
      tone: "good",
    });
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

  function findGymHazard(id: string) {
    if (gymFound.includes(id)) return;
    const hazard = gymHazards.find((item) => item.id === id);
    if (!hazard) return;
    setGymFound((items) => [...items, id]);
    addScore(3);
    playTone("good");
    announce({
      title: `${hazard.icon} ${hazard.label} 발견!`,
      message: hazard.lesson,
      tone: "good",
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
        title: "안전 보관함 잠금 해제!",
        message: "보호구와 위험요소를 올바른 순서로 확인했어요. 곧 운동장으로 이동합니다.",
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

  function downloadCertificateImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1131;
    const context = canvas.getContext("2d");
    if (!context) return;

    setCertificateSaveState("saving");
    const name = studentName.trim() || "안전 수호대";
    const date = completionDate || "미션 완료일";
    const certificateId = `SS-${String(score).padStart(3, "0")}-${String(elapsed).padStart(4, "0")}`;

    const paper = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    paper.addColorStop(0, "#fffef8");
    paper.addColorStop(1, "#f3ead2");
    context.fillStyle = paper;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "#bd9140";
    context.lineWidth = 6;
    context.strokeRect(34, 34, 1532, 1063);
    context.strokeStyle = "#5f8f88";
    context.lineWidth = 2;
    context.strokeRect(52, 52, 1496, 1027);

    context.fillStyle = "#54707c";
    context.font = '800 22px "Malgun Gothic", sans-serif';
    context.textAlign = "left";
    context.fillText("SAFE SCHOOL CERTIFICATE", 104, 116);
    context.fillStyle = "#1c5d5b";
    context.textAlign = "right";
    context.fillText(certificateId, 1496, 116);

    context.save();
    context.translate(800, 205);
    context.beginPath();
    context.moveTo(0, -72);
    context.lineTo(70, -43);
    context.lineTo(60, 45);
    context.lineTo(0, 88);
    context.lineTo(-60, 45);
    context.lineTo(-70, -43);
    context.closePath();
    const sealGradient = context.createLinearGradient(-60, -60, 65, 80);
    sealGradient.addColorStop(0, "#ffe9ad");
    sealGradient.addColorStop(1, "#d1a044");
    context.fillStyle = sealGradient;
    context.fill();
    context.fillStyle = "#553b10";
    context.textAlign = "center";
    context.font = '900 46px "Malgun Gothic", sans-serif';
    context.fillText("★", 0, 5);
    context.font = '900 15px "Malgun Gothic", sans-serif';
    context.fillText("6 ZONES", 0, 38);
    context.restore();

    context.textAlign = "center";
    context.fillStyle = "#29716c";
    context.font = '900 24px "Malgun Gothic", sans-serif';
    context.fillText("학 교  안 전 교 육  이 수 증", 800, 338);
    context.fillStyle = "#142f44";
    context.font = '700 68px "Malgun Gothic", sans-serif';
    context.fillText(name, 800, 430);
    const nameWidth = context.measureText(name).width;
    context.font = '500 26px "Malgun Gothic", sans-serif';
    context.fillText("학생", 800 + nameWidth / 2 + 45, 430);

    context.fillStyle = "#526977";
    context.font = '400 24px "Malgun Gothic", sans-serif';
    context.fillText(
      "위 학생은 교실·복도·통학로·체육관·수영장·과학실의 여섯 가지 안전 미션을",
      800,
      495,
    );
    context.fillText("성실히 해결하였기에 이 증서를 수여합니다.", 800, 535);

    const badgeWidth = 210;
    const badgeGap = 20;
    const badgeStart = (1600 - (badgeWidth * 6 + badgeGap * 5)) / 2;
    rewardBadges.forEach((badge, index) => {
      const x = badgeStart + index * (badgeWidth + badgeGap);
      const y = 605;
      context.beginPath();
      context.roundRect(x, y, badgeWidth, 142, 20);
      context.fillStyle = "rgba(255,255,255,.72)";
      context.fill();
      context.strokeStyle = "rgba(41,113,108,.28)";
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = ["#c99538", "#7664cb", "#2b9d84", "#76a839", "#4389c6", "#d85e58"][
        index
      ];
      context.font = '900 34px "Malgun Gothic", sans-serif';
      context.fillText(badge.icon, x + badgeWidth / 2, y + 54);
      context.fillStyle = "#284c57";
      context.font = '800 19px "Malgun Gothic", sans-serif';
      context.fillText(badge.subject, x + badgeWidth / 2, y + 91);
      context.fillStyle = "#6b7f87";
      context.font = '600 15px "Malgun Gothic", sans-serif';
      context.fillText(badge.title, x + badgeWidth / 2, y + 119);
    });

    context.strokeStyle = "rgba(23,75,76,.22)";
    context.beginPath();
    context.moveTo(130, 830);
    context.lineTo(1470, 830);
    context.stroke();

    context.textAlign = "left";
    context.fillStyle = "#78909a";
    context.font = '600 18px "Malgun Gothic", sans-serif';
    context.fillText("이수일", 135, 890);
    context.fillStyle = "#233f50";
    context.font = '800 25px "Malgun Gothic", sans-serif';
    context.fillText(date, 135, 930);

    context.textAlign = "center";
    context.fillStyle = "#78909a";
    context.font = '600 18px "Malgun Gothic", sans-serif';
    context.fillText("최종 기록", 800, 890);
    context.fillStyle = "#233f50";
    context.font = '800 25px "Malgun Gothic", sans-serif';
    context.fillText(`${score}/120점 · ${formatTime(elapsed)}`, 800, 930);

    context.textAlign = "right";
    context.fillStyle = "#78909a";
    context.font = '600 18px "Malgun Gothic", sans-serif';
    context.fillText("학교 안전교육", 1460, 890);
    context.fillStyle = "#233f50";
    context.font = '800 25px "Malgun Gothic", sans-serif';
    context.fillText("세이프스쿨 안전 수호대", 1460, 930);

    context.beginPath();
    context.arc(1395, 926, 55, 0, Math.PI * 2);
    context.strokeStyle = "rgba(181,64,51,.65)";
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = "rgba(181,64,51,.72)";
    context.textAlign = "center";
    context.font = '800 22px Georgia, serif';
    context.fillText("安全", 1395, 934);

    context.fillStyle = "#81919a";
    context.font = '500 16px "Malgun Gothic", sans-serif';
    context.fillText("학교 안전 탈출작전 · 안전교육 이수 확인", 800, 1035);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCertificateSaveState("idle");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = name.replace(/[\\/:*?"<>|]/g, "-");
      link.href = url;
      link.download = `학교-안전교육-이수증-${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setCertificateSaveState("saved");
      window.setTimeout(() => setCertificateSaveState("idle"), 2400);
    }, "image/png");
  }

  function vibrate(pattern: number | number[]) {
    if ("vibrate" in navigator) navigator.vibrate(pattern);
  }

  function mobilePrimaryAction() {
    if (mobileControlMode === "ox") {
      if (phase === "classroom-quiz") answerClassQuiz("O");
      if (phase === "traffic-quiz") answerTrafficQuiz("O");
      vibrate(20);
      return;
    }

    if (!nearestTarget || !targetLocked) {
      playTone("bad");
      vibrate([20, 35, 20]);
      announce(
        {
          title: "조금 더 가까이 가세요",
          message: "왼쪽 조이스틱으로 세이프봇을 단서 가까이 이동한 뒤 A 버튼을 누르세요.",
          tone: "warn",
        },
        2200,
      );
      return;
    }

    if (phase === "classroom") findClassHazard(nearestTarget.id);
    if (phase === "corridor") findCorridorHazard(nearestTarget.id);
    if (phase === "traffic") findTrafficSpot(nearestTarget.id);
    if (phase === "gym") findGymHazard(nearestTarget.id);
    if (phase === "pool") findPoolSpot(nearestTarget.id);
    if (phase === "lab") findLabClue(nearestTarget.id);
    vibrate(28);
  }

  function mobileSecondaryAction() {
    if (mobileControlMode === "ox") {
      if (phase === "classroom-quiz") answerClassQuiz("X");
      if (phase === "traffic-quiz") answerTrafficQuiz("X");
      vibrate(20);
      return;
    }

    if (phase === "classroom") requestHint(classroomHazards, classFound);
    if (phase === "corridor") requestHint(corridorHazards, corridorFound);
    if (phase === "traffic") requestHint(trafficSpots, trafficFound);
    if (phase === "gym") requestHint(gymHazards, gymFound);
    if (phase === "pool") requestHint(poolSpots, poolFound);
    if (phase === "lab") requestHint(labClues, labFound);
    vibrate(16);
  }

  function finishGame() {
    addScore(8);
    setCompletionDate(
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date()),
    );
    setPhase("final");
    playTone("win");
  }

  useEffect(() => {
    let nextPhase: Phase | null = null;
    let nextNotice: { title: string; message: string } | null = null;

    if (phase === "classroom" && classFound.length === classroomHazards.length) {
      nextPhase = "classroom-quiz";
    } else if (phase === "corridor" && corridorFound.length === corridorHazards.length) {
      nextPhase = "traffic";
      nextNotice = {
        title: "미션 3 · 통학로",
        message: "등하교 길과 자전거 이용 중 위험행동 3개를 찾아주세요.",
      };
    } else if (phase === "traffic" && trafficFound.length === trafficSpots.length) {
      nextPhase = "traffic-quiz";
    } else if (phase === "traffic-quiz" && trafficQuizDone) {
      nextPhase = "gym";
      nextNotice = {
        title: "미션 4 · 체육관",
        message: "체육관 바닥과 운동기구에 숨은 위험요소 4개를 찾아주세요.",
      };
    } else if (phase === "gym" && gymFound.length === gymHazards.length) {
      nextPhase = "pool";
      nextNotice = {
        title: "미션 5 · 학교 수영장",
        message: "물가의 위험행동 4개를 찾고 안전한 입수 순서를 완성하세요.",
      };
    } else if (phase === "pool" && poolFound.length === poolSpots.length) {
      nextPhase = "pool-sequence";
    } else if (phase === "pool-sequence" && poolSequenceDone) {
      nextPhase = "lab";
      nextNotice = {
        title: "미션 6 · 과학실",
        message: "네 개의 안전 단서를 찾아 잠긴 캐비닛의 암호를 해제하세요.",
      };
    } else if (phase === "lab" && labUnlocked) {
      nextPhase = "final";
    }

    if (!nextPhase) return;
    const delay = nextPhase === "classroom-quiz" || nextPhase === "traffic-quiz" ? 1350 : 1650;
    const timer = window.setTimeout(() => {
      setToast(null);
      if (nextPhase === "final") {
        finishGame();
        return;
      }
      setPhase(nextPhase);
      playTone("click");
      if (nextNotice) {
        announce({ ...nextNotice, tone: "info" }, 2600);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [
    phase,
    classFound.length,
    corridorFound.length,
    trafficFound.length,
    trafficQuizDone,
    gymFound.length,
    poolFound.length,
    poolSequenceDone,
    labUnlocked,
  ]);

  return (
    <main
      className={cx(
        "game-shell",
        mobileControlMode && !controlsMinimized && "mobile-controller-active",
      )}
    >
      {phase !== "intro" && phase !== "final" && (
        <header className="hud" aria-label="게임 상태">
          <div className="hud-brand">
            <img className="hud-avatar" src="assets/safebot-character.png" alt="" />
            <div>
              <span className="eyebrow">SAFE SCHOOL</span>
              <strong>학교 안전 탈출작전</strong>
            </div>
          </div>

          <div className="mission-progress" aria-label={`전체 6개 미션 중 ${Math.min(chapter, 6)}번째`}>
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <span
                key={step}
                className={cx(
                  "progress-node",
                  chapter === step && "active",
                  chapter > step && "done",
                )}
              >
                <i>{chapter > step ? "✓" : step}</i>
                <b>{["교실", "복도", "통학로", "체육관", "수영장", "과학실"][step - 1]}</b>
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
              onClick={toggleAudio}
              aria-label={soundOn ? "배경음과 효과음 끄기" : "배경음과 효과음 켜기"}
            >
              {soundOn ? "♫" : "×"}
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
            src="assets/school-entrance.png"
            alt="석양의 학교 입구에서 안전 로봇이 모험을 안내하는 모습"
          />
          <div className="intro-vignette" />
          <div className="intro-topbar">
            <button className="glass-button" type="button" onClick={() => setTeacherOpen(true)}>
              교사용 해설
            </button>
          </div>
          <div className="intro-copy">
            <span className="mission-kicker">
              <i aria-hidden="true">●</i> SCHOOL SAFETY ESCAPE
            </span>
            <h1>
              학교 안전
              <br />
              <em>탈출작전</em>
            </h1>
            <p>
              방과 후, 학교에 위험 경보가 울렸다.
              <br />
              여섯 개의 구역에서 안전 미션을 해결하고 모두의 안전한 하교를 도와라.
            </p>
            <div className="intro-actions">
              <button className="primary-button hero-button" type="button" onClick={startGame}>
                <span>미션 시작</span>
                <i aria-hidden="true">→</i>
              </button>
              <div className="game-facts" aria-label="게임 정보">
                <span>
                  <b>6</b>개 구역
                </span>
                <span>
                  <b>20</b>분 예상
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
              src="assets/safebot-character.png"
              alt="안전 안내 로봇 세이프봇"
            />
            <div>
              <span>세이프봇의 메시지</span>
              <p>“정답을 외우는 것보다 위험을 먼저 발견하는 눈이 중요해!”</p>
            </div>
          </div>
          <div className="intro-footer">
            <span>대상 · 초등 4–6학년</span>
            <span>생활안전 · 복도안전 · 교통안전 · 체육안전 · 물놀이안전 · 실험안전</span>
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
                src="assets/classroom.png"
                alt="방과 후 교실. 멀티탭, 가방, 책, 가위, 난방기 주변을 살펴볼 수 있다."
              />
              {mobileControlMode === "explore" && (
                <ExplorerCursor locked={targetLocked} position={playerPosition} />
              )}
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
              <div className="auto-next-card" role="status">
                <span aria-hidden="true">✓</span>
                <div>
                  <b>위험요소 5개 발견 완료</b>
                  <small>OX 퀴즈가 자동으로 열립니다.</small>
                </div>
                <i aria-hidden="true" />
              </div>
            ) : (
              <button
                className="hint-button"
                type="button"
                onClick={() => requestHint(classroomHazards, classFound)}
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
            src="assets/classroom.png"
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

      {phase === "corridor" && (
        <section className="mission-screen corridor-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label violet">MISSION 02</span>
                <h2>복도의 위험 신호를 멈춰라</h2>
              </div>
              <p>
                복도와 계단에 숨은 <b>위험행동 4개</b>를 찾으세요.
              </p>
            </div>
            <div className="scene-frame corridor-frame">
              <img
                src="assets/school-corridor.png"
                alt="학교 복도에서 달리기, 비상구 앞 적치물, 젖은 바닥, 계단 난간 타기 행동을 살펴볼 수 있는 장면"
              />
              {mobileControlMode === "explore" && (
                <ExplorerCursor locked={targetLocked} position={playerPosition} />
              )}
              {corridorHazards.map((hazard) => {
                const found = corridorFound.includes(hazard.id);
                return (
                  <button
                    type="button"
                    key={hazard.id}
                    className={cx(
                      "hotspot corridor-hotspot",
                      found && "found",
                      hintTarget === hazard.id && "hinted",
                    )}
                    style={{
                      left: `${hazard.x}%`,
                      top: `${hazard.y}%`,
                      width: `${hazard.w}%`,
                      height: `${hazard.h}%`,
                    }}
                    onClick={() => findCorridorHazard(hazard.id)}
                    aria-label={found ? `${hazard.label} 발견 완료` : "복도 위험행동 확인"}
                  >
                    <span aria-hidden="true">{found ? "✓" : "⌕"}</span>
                    {found && <b>{hazard.label}</b>}
                  </button>
                );
              })}
              <span className="scene-caption">
                복도에서는 오른쪽으로 천천히 걷고, 계단 손잡이를 잡아요
              </span>
            </div>
          </div>

          <aside className="mission-panel corridor-panel">
            <div className="guide-tip violet-tip">
              <img src="assets/safebot-character.png" alt="" />
              <p>
                <b>세이프봇</b>
                “모퉁이와 계단에서는 한 걸음 천천히! 대피 통로는 항상 비워 둬.”
              </p>
            </div>
            {corridorFound.length < corridorHazards.length ? (
              <>
                <div className="panel-top compact-panel-top">
                  <div>
                    <span className="panel-label">복도 위험 탐지</span>
                    <strong>
                      {corridorFound.length}
                      <small> / {corridorHazards.length}</small>
                    </strong>
                  </div>
                </div>
                <div className="found-list">
                  {corridorHazards.map((hazard) => {
                    const found = corridorFound.includes(hazard.id);
                    return (
                      <div className={cx("found-item", found && "revealed")} key={hazard.id}>
                        <span aria-hidden="true">{found ? hazard.icon : "?"}</span>
                        <div>
                          <b>{found ? hazard.label : "숨은 복도 위험"}</b>
                          <small>{found ? hazard.lesson : "복도와 계단을 자세히 살펴보세요."}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="hint-button"
                  type="button"
                onClick={() => requestHint(corridorHazards, corridorFound)}
                >
                  <span aria-hidden="true">◎</span>
                  질서 스캔
                  <b>{hints}개 남음</b>
                </button>
              </>
            ) : (
              <div className="mission-cleared-card">
                <span aria-hidden="true">↟</span>
                <small>MISSION 02 CLEAR</small>
                <h3>질서의 발걸음을 획득했어요</h3>
                <p>복도에서는 천천히, 오른쪽으로 걷고 대피 통로는 항상 비워 둬요.</p>
                <div className="auto-moving">
                  통학로로 자동 이동 중 <i aria-hidden="true" />
                </div>
              </div>
            )}
          </aside>
        </section>
      )}

      {phase === "traffic" && (
        <section className="mission-screen traffic-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label coral">MISSION 03</span>
                <h2>안전한 통학로를 복구하라</h2>
              </div>
              <p>
                등하교 길과 자전거 이용 중 <b>위험행동 3개</b>를 찾으세요.
              </p>
            </div>
            <div className="scene-frame">
              <img
                src="assets/traffic-school-zone.png"
                alt="학교 앞 횡단보도에서 스마트폰 보행, 주차 차량 사이 횡단, 안전모 없는 자전거 주행을 살펴볼 수 있는 장면"
              />
              {mobileControlMode === "explore" && (
                <ExplorerCursor locked={targetLocked} position={playerPosition} />
              )}
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
              <img src="assets/safebot-character.png" alt="" />
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
                  onClick={() => requestHint(trafficSpots, trafficFound)}
                >
                  <span aria-hidden="true">◎</span>
                  스캔 힌트
                  <b>{hints}개 남음</b>
                </button>
              </>
            ) : (
              <div className="mission-cleared-card">
                <span aria-hidden="true">✦</span>
                <small>SAFETY CHECK</small>
                <h3>교통안전 OX를 준비해요</h3>
                <p>통학로 위험요소를 모두 찾았습니다.</p>
                <div className="auto-moving">
                  OX 퀴즈 자동 실행 중 <i aria-hidden="true" />
                </div>
              </div>
            )}
          </aside>
        </section>
      )}

      {phase === "traffic-quiz" && (
        <section className="quiz-screen traffic-quiz-screen">
          <img
            className="full-bleed-image blurred"
            src="assets/traffic-school-zone.png"
            alt=""
            aria-hidden="true"
          />
          <div className="quiz-backdrop traffic-quiz-backdrop" />
          {!trafficQuizDone ? (
            <div className="quiz-card">
              <div className="quiz-card-top">
                <span className="chapter-label coral">TRAFFIC SAFETY · OX</span>
                <span>
                  {trafficQuizIndex + 1} / {trafficQuiz.length}
                </span>
              </div>
              <div className="quiz-progress">
                <i
                  style={{
                    width: `${((trafficQuizIndex + 1) / trafficQuiz.length) * 100}%`,
                  }}
                />
              </div>
              <div className="quiz-symbol traffic-symbol" aria-hidden="true">
                신호
              </div>
              <h2>{trafficQuiz[trafficQuizIndex].statement}</h2>
              <p>맞다고 생각하면 O, 틀리다고 생각하면 X를 선택하세요.</p>
              <div className="ox-buttons">
                <button
                  type="button"
                  className="ox-button o"
                  onClick={() => answerTrafficQuiz("O")}
                  disabled={trafficQuizLocked}
                >
                  <b>O</b>
                  <span>맞아요</span>
                </button>
                <button
                  type="button"
                  className="ox-button x"
                  onClick={() => answerTrafficQuiz("X")}
                  disabled={trafficQuizLocked}
                >
                  <b>X</b>
                  <span>아니에요</span>
                </button>
              </div>
              {trafficFeedback && (
                <div
                  className={cx(
                    "inline-feedback",
                    trafficFeedback.correct ? "correct" : "incorrect",
                  )}
                  role="status"
                >
                  <span aria-hidden="true">{trafficFeedback.correct ? "✓" : "!"}</span>
                  <div>
                    <b>{trafficFeedback.correct ? "정확해요!" : "다시 살펴봐요"}</b>
                    <p>{trafficFeedback.text}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="quiz-card quiz-complete-card">
              <div className="mission-cleared-card">
                <span aria-hidden="true">✦</span>
                <small>MISSION 03 CLEAR</small>
                <h3>통학 나침반을 획득했어요</h3>
                <p>스마트폰은 넣고, 안전모를 쓰고, 시야가 확보된 횡단보도를 이용해요.</p>
                <div className="auto-moving">
                  체육관으로 자동 이동 중 <i aria-hidden="true" />
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {phase === "gym" && (
        <section className="mission-screen gym-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label lime">MISSION 04</span>
                <h2>체육관의 안전 라인을 지켜라</h2>
              </div>
              <p>
                운동 전 확인해야 할 <b>위험요소 4개</b>를 찾으세요.
              </p>
            </div>
            <div className="scene-frame gym-frame">
              <img
                src="assets/school-gym.png"
                alt="학교 체육관에서 기울어진 매트, 바닥의 줄넘기, 흩어진 공, 풀린 운동화 끈을 살펴볼 수 있는 장면"
              />
              {mobileControlMode === "explore" && (
                <ExplorerCursor locked={targetLocked} position={playerPosition} />
              )}
              {gymHazards.map((hazard) => {
                const found = gymFound.includes(hazard.id);
                return (
                  <button
                    type="button"
                    key={hazard.id}
                    className={cx(
                      "hotspot gym-hotspot",
                      found && "found",
                      hintTarget === hazard.id && "hinted",
                    )}
                    style={{
                      left: `${hazard.x}%`,
                      top: `${hazard.y}%`,
                      width: `${hazard.w}%`,
                      height: `${hazard.h}%`,
                    }}
                    onClick={() => findGymHazard(hazard.id)}
                    aria-label={found ? `${hazard.label} 발견 완료` : "체육관 위험요소 확인"}
                  >
                    <span aria-hidden="true">{found ? "✓" : "⌕"}</span>
                    {found && <b>{hazard.label}</b>}
                  </button>
                );
              })}
              <div className="safe-role-callout gym-safe">
                <span aria-hidden="true">✓</span>
                <b>몸 상태 확인 · 준비운동 · 장비 정리</b>
              </div>
              <span className="scene-caption">
                운동 전에는 몸과 복장을 확인하고, 사용한 기구는 바로 정리해요
              </span>
            </div>
          </div>

          <aside className="mission-panel gym-panel">
            <div className="guide-tip lime-tip">
              <img src="assets/safebot-character.png" alt="" />
              <p>
                <b>세이프봇</b>
                “바닥의 공과 줄은 바로 정리하고, 운동화 끈도 꼭 확인해!”
              </p>
            </div>
            {gymFound.length < gymHazards.length ? (
              <>
                <div className="panel-top compact-panel-top">
                  <div>
                    <span className="panel-label">체육 위험 탐지</span>
                    <strong>
                      {gymFound.length}
                      <small> / {gymHazards.length}</small>
                    </strong>
                  </div>
                </div>
                <div className="found-list">
                  {gymHazards.map((hazard) => {
                    const found = gymFound.includes(hazard.id);
                    return (
                      <div className={cx("found-item gym-found", found && "revealed")} key={hazard.id}>
                        <span aria-hidden="true">{found ? hazard.icon : "?"}</span>
                        <div>
                          <b>{found ? hazard.label : "숨은 체육관 위험"}</b>
                          <small>{found ? hazard.lesson : "바닥과 운동기구를 자세히 살펴보세요."}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  className="hint-button"
                  type="button"
                onClick={() => requestHint(gymHazards, gymFound)}
                >
                  <span aria-hidden="true">◎</span>
                  스포츠 스캔
                  <b>{hints}개 남음</b>
                </button>
              </>
            ) : (
              <div className="mission-cleared-card">
                <span aria-hidden="true">⬡</span>
                <small>MISSION 04 CLEAR</small>
                <h3>스포츠 실드를 획득했어요</h3>
                <p>운동화 끈 확인과 기구 정리로 안전한 체육 시간을 만들었어요.</p>
                <div className="auto-moving">
                  수영장으로 자동 이동 중 <i aria-hidden="true" />
                </div>
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
                <span className="chapter-label aqua">MISSION 05</span>
                <h2>수영장의 위험 파동을 멈춰라</h2>
              </div>
              <p>
                물가의 <b>위험행동 4개</b>를 찾고 안전한 입수 순서를 완성하세요.
              </p>
            </div>
            <div className="scene-frame pool-frame">
              <img
                src="assets/school-pool.png"
                alt="학교 수영장에서 달리기, 밀기, 얕은 곳 다이빙, 혼자 수영하는 행동과 안전한 구명조끼 착용을 살펴볼 수 있는 장면"
              />
              {mobileControlMode === "explore" && (
                <ExplorerCursor locked={targetLocked} position={playerPosition} />
              )}
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
              <img src="assets/safebot-character.png" alt="" />
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
                  onClick={() => requestHint(poolSpots, poolFound)}
                >
                  <span aria-hidden="true">◎</span>
                  아쿠아 스캔
                  <b>{hints}개 남음</b>
                </button>
              </>
            ) : (
              <div className="mission-cleared-card">
                <span aria-hidden="true">≈</span>
                <small>WATER SAFETY CHECK</small>
                <h3>안전 입수 순서를 준비해요</h3>
                <p>물놀이 위험요소를 모두 찾았습니다.</p>
                <div className="auto-moving">
                  순서 퍼즐 자동 실행 중 <i aria-hidden="true" />
                </div>
              </div>
            )}
          </aside>
        </section>
      )}

      {phase === "pool-sequence" && (
        <section className="quiz-screen sequence-screen">
          <img
            className="full-bleed-image blurred"
            src="assets/school-pool.png"
            alt=""
            aria-hidden="true"
          />
          <div className="quiz-backdrop sequence-backdrop" />
          <div className="quiz-card sequence-quiz-card">
            {!poolSequenceDone ? (
              <>
                <div className="quiz-card-top">
                  <span className="chapter-label aqua">WATER SAFETY · ORDER</span>
                  <span>{pickedPoolSteps.length} / {poolSteps.length}</span>
                </div>
                <div className="sequence-header">
                  <strong>안전한 입수 순서를 완성하세요</strong>
                  <p>물에 들어가기 전에 가장 먼저 해야 할 일부터 선택해요.</p>
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
              </>
            ) : (
              <div className="mission-cleared-card">
                <span aria-hidden="true">≈</span>
                <small>MISSION 05 CLEAR</small>
                <h3>아쿠아 실드를 획득했어요</h3>
                <p>보호자 확인부터 천천히 입수하기까지 정확한 순서를 완성했어요.</p>
                <div className="auto-moving">
                  과학실로 자동 이동 중 <i aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "lab" && (
        <section className="mission-screen lab-layout">
          <div className="scene-column">
            <div className="scene-heading">
              <div>
                <span className="chapter-label amber">MISSION 06</span>
                <h2>과학실의 암호를 해제하라</h2>
              </div>
              <p>
                보호구와 위험 신호 <b>4개</b>를 찾아 숫자를 모으세요.
              </p>
            </div>
            <div className="scene-frame">
              <img
                src="assets/science-lab.png"
                alt="보안경, 보호장갑, 쏟아진 액체, 열원, 잠긴 캐비닛이 있는 과학실"
              />
              {mobileControlMode === "explore" && (
                <ExplorerCursor locked={targetLocked} position={playerPosition} />
              )}
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
                      ? "마지막 안전 배지가 들어 있습니다."
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
              <span className="panel-label">안전 수칙 보관함</span>
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
                <div className="auto-next-card lab-auto-next" role="status">
                  <span aria-hidden="true">✓</span>
                  <div>
                    <b>안전 보관함 해제 완료</b>
                    <small>운동장으로 자동 이동합니다.</small>
                  </div>
                  <i aria-hidden="true" />
                </div>
              )}
            </form>
            {!labUnlocked && labFound.length < labClues.length && (
              <button
                className="hint-button"
                type="button"
                onClick={() => requestHint(labClues, labFound)}
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
            src="assets/schoolyard-final.png"
            alt="학교 운동장에서 학생들과 선생님이 안전 미션 완료를 축하하는 모습"
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
            <h1>학교 안전 미션을<br />모두 해결했어요!</h1>
            <p>
              위험을 발견하고, 침착하게 판단하고, 올바른 순서를 선택했습니다.
              <br />
              이제 당신은 우리 학교의 <b>안전 수호대</b>입니다.
            </p>
            <div className="result-board">
              <div>
                <span>최종 점수</span>
                <strong>{score}<small>/120</small></strong>
              </div>
              <div>
                <span>탈출 시간</span>
                <strong>{formatTime(elapsed)}</strong>
              </div>
              <div>
                <span>획득 배지</span>
                <strong>6<small>/6</small></strong>
              </div>
            </div>
            <div className="reward-heading">
              <span>COLLECTION COMPLETE</span>
              <b>안전 수호대 배지 컬렉션</b>
            </div>
            <div className="reward-showcase" aria-label="획득한 안전 배지 6개">
              {rewardBadges.map((badge, index) => (
                <div className="reward-badge-card" key={badge.title}>
                  <i className={`reward-medal medal-${index + 1}`} aria-hidden="true">
                    {badge.icon}
                  </i>
                  <div>
                    <b>{badge.title}</b>
                    <small>{badge.subject}</small>
                  </div>
                </div>
              ))}
            </div>
            <div className="final-actions">
              <button
                className="primary-button certificate-button"
                type="button"
                onClick={() => setCertificateOpen(true)}
              >
                이수증 발급받기 <span aria-hidden="true">✦</span>
              </button>
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

      {certificateOpen && (
        <div
          className="certificate-layer"
          role="presentation"
          onMouseDown={() => setCertificateOpen(false)}
        >
          <section
            className="certificate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="certificate-close"
              type="button"
              onClick={() => setCertificateOpen(false)}
              aria-label="이수증 닫기"
            >
              ×
            </button>
            <div className="certificate-sheet">
              <div className="certificate-border" aria-hidden="true" />
              <header className="certificate-header">
                <span>SAFE SCHOOL CERTIFICATE</span>
                <b>SS-{String(score).padStart(3, "0")}-{String(elapsed).padStart(4, "0")}</b>
              </header>
              <div className="certificate-seal" aria-hidden="true">
                <span>★</span>
                <small>6 ZONES</small>
              </div>
              <p className="certificate-kicker">학교 안전교육 이수증</p>
              <h2 id="certificate-title">
                {studentName.trim() || "안전 수호대"} <small>학생</small>
              </h2>
              <p className="certificate-copy">
                위 학생은 교실·복도·통학로·체육관·수영장·과학실의
                <br />
                여섯 가지 안전 미션을 성실히 해결하였기에 이 증서를 수여합니다.
              </p>
              <div className="certificate-badges" aria-label="이수한 안전교육 영역">
                {rewardBadges.map((badge) => (
                  <span key={badge.title}>
                    <i aria-hidden="true">{badge.icon}</i>
                    <b>{badge.subject}</b>
                  </span>
                ))}
              </div>
              <footer className="certificate-footer">
                <div>
                  <span>이수일</span>
                  <b>{completionDate || "미션 완료일"}</b>
                </div>
                <div className="certificate-signature">
                  <span>학교 안전교육</span>
                  <b>세이프스쿨 안전 수호대</b>
                </div>
              </footer>
            </div>
            <div className="certificate-controls">
              <label htmlFor="student-name">
                이수증에 표시할 이름
                <input
                  id="student-name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value.slice(0, 12))}
                  placeholder="이름을 입력하세요"
                  autoComplete="name"
                />
              </label>
              <button
                className="primary-button"
                type="button"
                onClick={downloadCertificateImage}
                disabled={certificateSaveState === "saving"}
              >
                {certificateSaveState === "saving"
                  ? "이미지 만드는 중…"
                  : certificateSaveState === "saved"
                    ? "PNG 이미지 저장 완료 ✓"
                    : "PNG 이미지로 저장"}{" "}
                <span aria-hidden="true">⇩</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {mobileControlMode && (
        <section
          className={cx("mobile-gamepad", controlsMinimized && "minimized")}
          aria-label={mobileControlMode === "ox" ? "모바일 OX 선택 버튼" : "모바일 탐색 조작계"}
        >
          <button
            className="gamepad-toggle"
            type="button"
            onClick={() => {
              setControlsMinimized((value) => !value);
              setJoystickVector({ x: 0, y: 0 });
            }}
            aria-label={controlsMinimized ? "모바일 조작계 펼치기" : "모바일 조작계 접기"}
          >
            {controlsMinimized ? "🎮" : "⌄"}
          </button>
          {!controlsMinimized && (
            <>
              <div className="joystick-wrap">
                <VirtualJoystick
                  disabled={mobileControlMode === "ox"}
                  onVectorChange={setJoystickVector}
                />
                <span>
                  {mobileControlMode === "ox"
                    ? "O 또는 X를 선택하세요"
                    : targetLocked
                      ? "단서 근처 · A를 누르세요"
                      : "세이프봇 이동"}
                </span>
              </div>
              <div className="action-cluster">
                <button
                  className="game-button secondary-game-button"
                  type="button"
                  onClick={mobileSecondaryAction}
                  disabled={
                    (phase === "classroom-quiz" && classQuizLocked) ||
                    (phase === "traffic-quiz" && trafficQuizLocked)
                  }
                  aria-label={mobileControlMode === "ox" ? "X, 아니다" : "B, 힌트 사용"}
                >
                  <b>{mobileControlMode === "ox" ? "X" : "B"}</b>
                  <span>{mobileControlMode === "ox" ? "아니다" : "힌트"}</span>
                </button>
                <button
                  className={cx("game-button primary-game-button", targetLocked && "ready")}
                  type="button"
                  onClick={mobilePrimaryAction}
                  disabled={
                    (phase === "classroom-quiz" && classQuizLocked) ||
                    (phase === "traffic-quiz" && trafficQuizLocked)
                  }
                  aria-label={mobileControlMode === "ox" ? "O, 맞다" : "A, 주변 조사"}
                >
                  <b>{mobileControlMode === "ox" ? "O" : "A"}</b>
                  <span>{mobileControlMode === "ox" ? "맞다" : targetLocked ? "조사!" : "조사"}</span>
                </button>
              </div>
            </>
          )}
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
              초등 4–6학년이 약 18–25분 동안 교실·복도 생활안전, 등하교·자전거
              교통안전, 체육·물놀이·실험안전을 스스로 판단하도록 설계했습니다.
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
                <h3>복도·계단 안전</h3>
                <p>모퉁이 달리기, 비상구 앞 적치물, 젖은 바닥, 계단 난간 타기의 위험을 찾습니다.</p>
                <b>핵심 질문</b>
                <small>복도와 계단에서 친구와 부딪히지 않으려면 어떻게 이동해야 할까?</small>
              </article>
              <article>
                <span>03</span>
                <h3>등하교·자전거</h3>
                <p>스마트폰 보행, 주차 차량 사이 횡단, 안전모 없는 횡단보도 주행을 찾습니다.</p>
                <b>핵심 질문</b>
                <small>왜 횡단보도에서는 자전거에서 내려 끌고 건너야 할까?</small>
              </article>
              <article>
                <span>04</span>
                <h3>체육관 안전</h3>
                <p>기울어진 매트, 바닥에 방치된 줄넘기, 흩어진 공, 풀린 운동화 끈을 찾습니다.</p>
                <b>핵심 질문</b>
                <small>운동을 시작하기 전에 몸·복장·운동기구를 어떻게 확인해야 할까?</small>
              </article>
              <article>
                <span>05</span>
                <h3>수영장 안전</h3>
                <p>달리기, 밀기, 얕은 곳 다이빙, 혼자 멀리 수영하기의 위험을 찾습니다.</p>
                <b>안전 입수 순서</b>
                <small>보호자·안전구역 확인 → 준비운동 → 구명조끼 → 천천히 입수</small>
              </article>
              <article>
                <span>06</span>
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
