"use client"
import AnimateOnScroll from "@/components/ui/AnimateOnScroll"

const About = () => {
   return (
      <section id="about" className="about__area-six section-py-130" style={{ backgroundColor: "#f7f8fc" }}>
         <div className="container">
            {/* Top Row: Info (left) + Origin Story (right) */}
            <div className="row align-items-stretch mb-4">
               <div className="col-lg-6 mb-4 mb-lg-0">
                  <AnimateOnScroll direction="left">
                     <div style={{ height: "100%" }}>
                        <span style={{
                           background: "var(--tg-color-gradient)",
                           WebkitBackgroundClip: "text",
                           WebkitTextFillColor: "transparent",
                           fontWeight: 700,
                           textTransform: "uppercase",
                           letterSpacing: "2px",
                           fontSize: "13px",
                           marginBottom: "12px",
                           display: "inline-block",
                        }}>About The Platform</span>
                        <h2 style={{
                           fontSize: "clamp(28px, 3.5vw, 40px)",
                           color: "var(--tg-heading-color)",
                           lineHeight: 1.15,
                           marginBottom: "24px",
                           fontWeight: 700,
                        }}>An Execution Platform. Not Just a Community.</h2>
                        <p style={{ fontSize: "16px", color: "var(--tg-body-color)", lineHeight: 1.75, margin: 0 }}>
                           Global CXO Circle is a CXO-led platform designed to bridge the gap between conversations and real enterprise outcomes. It brings together enterprise leaders, founders, investors, and ecosystem partners into a structured environment where meaningful advisory, strategic introductions, and business outcomes can happen. Unlike traditional networks, Global CXO Circle is built as an execution platform — not just a community.
                        </p>
                     </div>
                  </AnimateOnScroll>
               </div>
               
               <div className="col-lg-6">
                  <AnimateOnScroll direction="right">
                     <div style={{
                        background: "#fff",
                        boxShadow: "0 4px 16px rgba(11,26,74,0.08)",
                        borderRadius: "16px",
                        padding: "36px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center"
                     }}>
                        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "28px" }}>The Origin Story</h3>
                        
                        <div className="timeline-wrap" style={{ position: "relative", paddingLeft: "30px" }}>
                           <div style={{
                              position: "absolute",
                              top: "8px",
                              bottom: "8px",
                              left: "9px",
                              width: "2px",
                              background: "var(--tg-color-gradient)",
                              opacity: 0.3
                           }}></div>
                           
                           <div className="timeline-item mb-4" style={{ position: "relative" }}>
                              <div style={{
                                 position: "absolute",
                                 left: "-30px",
                                 top: "4px",
                                 width: "20px",
                                 height: "20px",
                                 borderRadius: "50%",
                                 background: "var(--tg-color-gradient)",
                                 border: "4px solid #fff"
                              }}></div>
                              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Global CIO Circle</h4>
                              <p style={{ fontSize: "15px", color: "var(--tg-body-color)", margin: 0 }}>
                                 Global CXO Circle evolved from the success of Global CIO Circle, where technology leaders engaged in high-value interactions.
                              </p>
                           </div>
                           
                           <div className="timeline-item" style={{ position: "relative" }}>
                              <div style={{
                                 position: "absolute",
                                 left: "-30px",
                                 top: "4px",
                                 width: "20px",
                                 height: "20px",
                                 borderRadius: "50%",
                                 background: "var(--tg-color-gradient)",
                                 border: "4px solid #fff"
                              }}></div>
                              <h4 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tg-heading-color)", marginBottom: "8px" }}>Global CXO Circle</h4>
                              <p style={{ fontSize: "15px", color: "var(--tg-body-color)", margin: 0 }}>
                                 As enterprise challenges became more cross-functional, the platform expanded into a unified CXO ecosystem — enabling alignment across leadership roles and accelerating outcomes.
                              </p>
                           </div>
                        </div>
                     </div>
                  </AnimateOnScroll>
               </div>
            </div>

            {/* Bottom Row: Mission (left) + Vision (right) — full width */}
            <div className="row">
               <div className="col-lg-6 mb-4 mb-lg-0">
                  <AnimateOnScroll delay={0.15} direction="left">
                     <div className="about-card" style={{
                        background: "#fff",
                        borderRadius: "16px",
                        padding: "32px",
                        borderImage: "var(--tg-color-gradient) 1", borderLeft: "4px solid",
                        boxShadow: "0 2px 8px rgba(11,26,74,0.06)",
                        height: "100%",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease"
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                           <div style={{
                              width: "40px",
                              height: "40px",
                              background: "var(--tg-color-gradient)",
                              color: "#fff",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              flexShrink: 0
                           }}>
                              <i className="flaticon-target"></i>
                           </div>
                           <h4 style={{ fontSize: "20px", fontWeight: 700, color: "var(--tg-heading-color)", margin: 0 }}>Mission</h4>
                        </div>
                        <p style={{ fontSize: "15px", color: "var(--tg-body-color)", margin: 0, lineHeight: 1.6 }}>To create a trusted global ecosystem where CXO leaders connect, collaborate, and drive meaningful outcomes together.</p>
                     </div>
                  </AnimateOnScroll>
               </div>
               <div className="col-lg-6">
                  <AnimateOnScroll delay={0.25} direction="right">
                     <div className="about-card" style={{
                        background: "#fff",
                        borderRadius: "16px",
                        padding: "32px",
                        borderImage: "var(--tg-color-gradient) 1", borderLeft: "4px solid",
                        boxShadow: "0 2px 8px rgba(11,26,74,0.06)",
                        height: "100%",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease"
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                           <div style={{
                              width: "40px",
                              height: "40px",
                              background: "var(--tg-color-gradient)",
                              color: "#fff",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              flexShrink: 0
                           }}>
                              <i className="flaticon-start-up"></i>
                           </div>
                           <h4 style={{ fontSize: "20px", fontWeight: 700, color: "var(--tg-heading-color)", margin: 0 }}>Vision</h4>
                        </div>
                        <p style={{ fontSize: "15px", color: "var(--tg-body-color)", margin: 0, lineHeight: 1.6 }}>To become the world's most trusted platform for cross-functional executive collaboration and enterprise innovation.</p>
                     </div>
                  </AnimateOnScroll>
               </div>
            </div>
         </div>
         <style jsx>{`
            .about-card:hover {
               transform: translateY(-3px);
               box-shadow: 0 8px 24px rgba(11,26,74,0.1) !important;
            }
         `}</style>
      </section>
   )
}

export default About
