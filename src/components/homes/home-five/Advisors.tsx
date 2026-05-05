"use client"
import Link from "next/link"
import Arrow from "@/components/common/Arrow"

const Advisors = () => {
  return (
    <section
      id="advisors"
      style={{
        backgroundColor: "#F4F6F8",
        padding: "100px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background accent */}
      <div style={{
        position: "absolute", bottom: "-15%", left: "-8%",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(0,71,255,0.04) 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="row align-items-center">
          <div className="col-lg-7 mb-40 mb-lg-0">
            <span style={{
              color: "var(--tg-theme-primary)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "2px",
              fontSize: "13px", display: "inline-block", marginBottom: "12px",
            }}>
              Advisory Board
            </span>
            <h2 style={{
              fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 800,
              color: "#1A1A1A", marginBottom: "20px", letterSpacing: "-0.5px",
            }}>
              Shape the Future You See Coming
            </h2>
            <p style={{ fontSize: "17px", color: "#555", lineHeight: 1.7, marginBottom: "20px", maxWidth: "560px" }}>
              The best advisors don&apos;t just counsel from the sidelines — they leave a fingerprint on history. At 100exNextGen, we invite seasoned leaders, domain experts, and industry pioneers to co-create the playbook for the next generation of exponential ventures.
            </p>
            <p style={{ fontSize: "17px", color: "#555", lineHeight: 1.7, marginBottom: "32px", maxWidth: "560px" }}>
              If you&apos;ve built, scaled, or transformed — and you&apos;re ready to pass the torch while holding the flame — we&apos;d be honoured to build the future alongside you.
            </p>
            <Link href="/advisors" className="tg-btn tg-btn-seven">
              Learn More <Arrow />
            </Link>
          </div>

          <div className="col-lg-5">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: "flaticon-growth", title: "Force Multiplier", desc: "Your experience compresses years of learning into months for founders.", color: "#0A3CC2" },
                { icon: "flaticon-partner", title: "Network as Launchpad", desc: "Every door you open becomes a launchpad for breakthrough companies.", color: "#1565C0" },
                { icon: "flaticon-startup", title: "Conviction as Wind", desc: "Your belief fuels confidence, credibility, and momentum.", color: "#2E7D32" },
              ].map((item, i) => (
                <div key={i} className="advisor-teaser-card" style={{
                  background: "#fff", padding: "24px 28px", borderRadius: "16px",
                  border: "1px solid #eee", display: "flex", alignItems: "flex-start",
                  gap: "18px", transition: "all 0.3s ease",
                  borderLeft: `4px solid ${item.color}`,
                }}>
                  <div style={{
                    width: "48px", height: "48px", background: `${item.color}10`,
                    borderRadius: "12px", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "22px", color: item.color, flexShrink: 0,
                  }}>
                    <i className={item.icon}></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: "17px", fontWeight: 700, color: "#1A1A1A", marginBottom: "4px" }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .advisor-teaser-card:hover {
          transform: translateX(5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.06) !important;
          border-color: transparent !important;
        }
      `}</style>
    </section>
  );
};

export default Advisors;
