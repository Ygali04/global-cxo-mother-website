import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

test("CIO100 uses the supplied local hero and flyer assets everywhere", () => {
  assert.ok(existsSync(new URL("../public/events/cio100-hero.png", import.meta.url)))
  assert.ok(existsSync(new URL("../public/events/cio100-flyer.png", import.meta.url)))

  for (const path of ["src/data/EventsData.ts", "src/portal/data/EventsData.ts"]) {
    const source = read(path)
    assert.match(source, /heroImage: '\/events\/cio100-hero\.png'/)
    assert.match(source, /bannerImage: '\/events\/cio100-flyer\.png'/)
    assert.match(source, /date: '8\/17\/2026 – 8\/19\/2026'/)
  }
})

test("CIO100 gets compact event and homepage treatments", () => {
  const eventDetail = read("src/components/events/EventDetail.tsx")
  const banner = read("src/components/home/Banner.tsx")

  assert.match(eventDetail, /event-hero--cio/)
  assert.match(eventDetail, /cio-event-meta/)
  assert.match(banner, /hero-event-card--desktop/)
  assert.match(banner, /hero-event-mobile-bar/)
  assert.match(banner, /clamp\(560px, 65vh, 680px\)/)
})

test("CIO100 fallback, cards, and metadata use the final event details", () => {
  const upcoming = read("src/components/home/UpcomingEvent.tsx")
  const eventsPage = read("src/app/events/page.tsx")
  const eventPage = read("src/app/events/[slug]/page.tsx")
  const eventDetail = read("src/components/events/EventDetail.tsx")

  assert.match(upcoming, /slug: "cio-100-awards-conference"/)
  assert.match(upcoming, /bannerImage: "\/events\/cio100-flyer\.png"/)
  assert.match(eventsPage, /isCio100 \? "contain" : "cover"/)
  assert.match(eventPage, /ev\.slug === "cio-100-awards-conference" && image/)
  assert.match(eventPage, /metadata\.openGraph/)
  assert.match(eventPage, /metadata\.twitter/)
  assert.match(eventDetail, /Proud sponsor flyer for CIO 100/)
})
