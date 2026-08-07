import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

const banner = readFileSync(
  new URL("../src/components/home/Banner.tsx", import.meta.url),
  "utf8",
)

test("homepage hero keeps Himanshu's single-card full-height layout", () => {
  assert.equal((banner.match(/hero-event-card--desktop/g) ?? []).length, 0)
  assert.equal((banner.match(/className="hero-event-card(?: |")/g) ?? []).length, 2)
  assert.match(banner, /minHeight: "clamp\(760px, 100vh, 1040px\)"/)
  assert.match(banner, /min-height: 100vh;/)
  assert.match(banner, /date: "17-19 August, 2026"/)
})
