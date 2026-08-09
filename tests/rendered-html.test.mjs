import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);
const previewRoot = new URL("../app/_sites-preview/", import.meta.url);

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

test("server-renders the Intel Core Ultra Series 3 experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Intel Core Ultra Series 3/i);
  assert.match(html, /Silicon anatomy/i);
  assert.match(html, /Product features/i);
  assert.match(html, /Up to 50 NPU TOPS/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|SkeletonPreview/i);
});

test("replaces the disposable starter shell with product code", async () => {
  const [page, layout, packageJson, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /from "three"/);
  assert.match(page, /FEATURE_DATA/);
  assert.match(page, /Intel 18A/);
  assert.match(layout, /Interactive Processor Anatomy/);
  assert.match(css, /experience-shell/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(page + layout + css, /codex-preview|_sites-preview/);

  assert.deepEqual(await readdir(previewRoot), []);
  await assert.rejects(access(new URL("public/_sites-preview", templateRoot)));
});
