// Lightweight smoke test. No browser, no heavy deps.
// Start the app (npm run build && npm run start) then: node smoke-test.mjs

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures++;
    console.log(`  FAIL ${name}: ${err.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log(`ProposalForge smoke test against ${BASE}\n`);

await check("home page returns 200", async () => {
  const res = await fetch(`${BASE}/`);
  assert(res.status === 200, `got ${res.status}`);
  const html = await res.text();
  assert(html.includes("ProposalForge"), "home does not mention ProposalForge");
});

await check("login page is public (200)", async () => {
  const res = await fetch(`${BASE}/login`, { redirect: "manual" });
  assert(res.status === 200, `got ${res.status}`);
});

await check("admin redirects unauthenticated users", async () => {
  const res = await fetch(`${BASE}/admin`, { redirect: "manual" });
  assert(res.status === 307 || res.status === 302, `expected redirect, got ${res.status}`);
});

await check("public view route is public (200 or 404, not a redirect)", async () => {
  const token = process.env.SMOKE_TOKEN ?? "doesnotexist";
  const res = await fetch(`${BASE}/view/${token}`, { redirect: "manual" });
  assert(res.status === 200 || res.status === 404, `expected 200/404, got ${res.status}`);
});

await check("AI generate validates input (400 on empty)", async () => {
  const res = await fetch(`${BASE}/api/ai/generate-proposal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
});

await check("sign route validates input (400 on empty)", async () => {
  const res = await fetch(`${BASE}/api/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
});

console.log(`\n${failures === 0 ? "PASS" : `FAIL (${failures})`}`);
process.exit(failures === 0 ? 0 : 1);
