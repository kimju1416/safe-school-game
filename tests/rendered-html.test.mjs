import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function arrayBlock(source, name) {
  const match = source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  assert.ok(match, `${name} configuration should exist`);
  return match[1];
}

function idCount(block) {
  return [...block.matchAll(/\bid:\s*"/g)].length;
}

test("server-renders the finished Safe School game", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /<title>세이프스쿨: 잠긴 안전코어<\/title>/i);
  assert.match(html, /잠긴/);
  assert.match(html, /안전코어/);
  assert.match(html, /미션 시작/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|SkeletonPreview/i);
});

test("contains four complete safety missions and no corridor mission", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.equal(idCount(arrayBlock(page, "classroomHazards")), 5);
  assert.equal(idCount(arrayBlock(page, "trafficSpots")), 3);
  assert.equal(idCount(arrayBlock(page, "poolSpots")), 4);
  assert.equal(idCount(arrayBlock(page, "poolSteps")), 4);
  assert.equal(idCount(arrayBlock(page, "labClues")), 4);

  assert.match(page, /phase === "classroom"/);
  assert.match(page, /phase === "traffic"/);
  assert.match(page, /phase === "pool"/);
  assert.match(page, /phase === "lab"/);
  assert.doesNotMatch(page, /phase === "corridor"|corridor\.png|지진 대피/);
  assert.match(page, /trafficQuiz/);
  assert.match(page, /answerTrafficQuiz\("O"\)/);
  assert.match(page, /answerTrafficQuiz\("X"\)/);
  assert.match(page, /6284/);
});

test("ships all generated game artwork and removes the old corridor asset", async () => {
  const assets = [
    "school-entrance.png",
    "safebot-character.png",
    "classroom.png",
    "traffic-school-zone.png",
    "school-pool.png",
    "science-lab.png",
    "schoolyard-final.png",
  ];

  for (const filename of assets) {
    const info = await stat(new URL(`../public/assets/${filename}`, import.meta.url));
    assert.ok(info.size > 500_000, `${filename} should be a full generated artwork`);
  }

  await assert.rejects(access(new URL("../public/assets/corridor.png", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});

test("includes official reference links and accessibility essentials", async () => {
  const [page, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(page, /koroad\.or\.kr/);
  assert.match(page, /mois\.go\.kr/);
  assert.match(page, /schoolsafe24\.or\.kr/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /requestFullscreen/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /button:focus-visible/);
  assert.match(layout, /<html lang="ko">/);

  await access(root);
});

test("includes mobile game controls for exploration and OX play", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /function VirtualJoystick/);
  assert.match(page, /setPointerCapture/);
  assert.match(page, /mobile-gamepad/);
  assert.match(page, /mobilePrimaryAction/);
  assert.match(page, /mobileSecondaryAction/);
  assert.match(page, /O 또는 X를 선택하세요/);
  assert.match(css, /touch-action:\s*none/);
  assert.match(css, /@media \(max-width: 820px\)/);
  assert.match(css, /\.explorer-cursor\.target-locked/);
});

test("has a repository-safe GitHub Pages build", async () => {
  const [page, entry, config, workflow] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../pages-entry.tsx", import.meta.url), "utf8"),
    readFile(new URL("../vite.pages.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(page, /src="\/assets\//);
  assert.match(entry, /createRoot\(root\)/);
  assert.match(config, /VITE_BASE_PATH/);
  assert.match(config, /outDir:\s*"pages-dist"/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /VITE_BASE_PATH: \/safe-school-game\//);
});
