"use client"

import NavMenu from "./menu/NavMenu"
import Link from "next/link"
import MobileSidebar from "./menu/MobileSidebar"
import UseSticky from "@/hooks/UseSticky"
import Arrow from "@/components/common/Arrow"
import { useState, useEffect, useRef } from "react"
import { fetchCurrentUserApi, logoutApi } from "@/portal/api/auth"
import { getStoredAccessToken } from "@/portal/api/tokenStorage"
import { USE_API_AUTH } from "@/portal/api/config"
import { getMockSessionUserId, setMockSessionUserId } from "@/portal/lib/mockSession"
import { loadMockDatabaseSnapshot } from "@/portal/lib/mockDatabase"
import type { MockUser } from "@/portal/data/mock/types"

const HeaderFive = ({ hideSignIn = false }: { hideSignIn?: boolean }) => {

   const { sticky } = UseSticky();
   const [sidebar, setSidebar] = useState<boolean>(false);

   // Auth-aware header. The marketing site lives outside the portal's
   // AuthProvider, so we read the session directly the same way the portal
   // does: an access token in sessionStorage (`gcio_access_token`). If present
   // we resolve the user via /users/me. Runs client-side only (post-hydration),
   // so logged-in users briefly see "Sign in" before their name resolves.
   const [authUser, setAuthUser] = useState<MockUser | null>(null);
   const [menuOpen, setMenuOpen] = useState<boolean>(false);
   const menuRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (typeof window === "undefined") return;
      // Local/mock mode (dev): the portal keeps its session as a mock user id,
      // and the real API is CORS-blocked from localhost — resolve from the mock DB.
      if (!USE_API_AUTH) {
         const uid = getMockSessionUserId();
         if (uid) {
            const found = loadMockDatabaseSnapshot().users.find((u) => u.id === uid);
            if (found) setAuthUser(found);
         }
         return;
      }
      // Production: real session — access token in sessionStorage → /users/me.
      if (!getStoredAccessToken()) return;
      let cancelled = false;
      fetchCurrentUserApi()
         .then((u) => { if (!cancelled) setAuthUser(u); })
         .catch(() => { /* not signed in / unreachable — stay as Sign in */ });
      return () => { cancelled = true; };
   }, []);

   useEffect(() => {
      if (!menuOpen) return;
      const onPointerDown = (e: MouseEvent) => {
         if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setMenuOpen(false);
         }
      };
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
   }, [menuOpen]);

   const isElevated = authUser?.tier === "admin" || authUser?.tier === "dev";

   const handleLogout = async () => {
      setMenuOpen(false);
      try {
         if (USE_API_AUTH) { await logoutApi(); }
         else { setMockSessionUserId(null); }
      } catch { /* clear locally regardless */ }
      setAuthUser(null);
      window.location.href = "/";
   };

   const handleContactScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
         e.preventDefault();
         document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
         window.history.pushState(null, '', '/#contact');
      }
   };

   return (
      <header className="transparent-header">
         <div id="header-fixed-height" style={{ display: "none" }}></div>
         <div id="sticky-header" className={`tg-header__area tg-header__area-seven ${sticky ? "sticky-menu" : ""} ${sticky ? "" : "aurora-nav"}`}>
            <div className="container custom-container">
               <div
                  className="tgmenu__wrap"
               >
                  <nav className="tgmenu__nav">
                     <div className="logo">
                        <Link href="/">
                           <span className="brand-mark-wrap">
                              <div className="logo-icon">
                                 <img
                                    src="/cxo-circle-logo.png"
                                    alt="Logo"
                                 />
                              </div>
                              <div className="logo-text-wrap">
                                 <span className="logo-text" style={{ color: '#0B1A4A' }}>Global CXO Circle</span>
                                 <span className="logo-tagline">Leadership Ecosystem</span>
                              </div>
                           </span>
                        </Link>
                     </div>
                     <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-lg-flex">
                        <NavMenu />
                     </div>
                     <div className="tgmenu__action tgmenu__action-seven">
                        <ul className="list-wrap">
                           <li className="header-btn">
                              {hideSignIn ? (
                                 <Link href="/" className="tg-btn tg-btn-seven" style={{ border: "none", textDecoration: "none" }}>Go Home <Arrow /></Link>
                              ) : authUser ? (
                                 <div className="user-menu" ref={menuRef}>
                                    <button
                                       type="button"
                                       className="user-menu__trigger"
                                       onClick={() => setMenuOpen((o) => !o)}
                                       aria-haspopup="true"
                                       aria-expanded={menuOpen}
                                    >
                                       <span className="user-menu__avatar" aria-hidden="true">
                                          {authUser.name?.trim()?.charAt(0)?.toUpperCase() || "?"}
                                       </span>
                                       <span className="user-menu__name">{authUser.name}</span>
                                       <svg className={`user-menu__caret${menuOpen ? " is-open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
                                    </button>
                                    {menuOpen && (
                                       <div className="user-menu__dropdown" role="menu">
                                          <Link href="/dashboard" className="user-menu__item" role="menuitem" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                                          {isElevated && (
                                             <Link href="/admin" className="user-menu__item" role="menuitem" onClick={() => setMenuOpen(false)}>Admin Console</Link>
                                          )}
                                          <Link href="/settings" className="user-menu__item" role="menuitem" onClick={() => setMenuOpen(false)}>Settings</Link>
                                          <div className="user-menu__divider" />
                                          <button type="button" className="user-menu__item user-menu__item--danger" role="menuitem" onClick={() => void handleLogout()}>Log out</button>
                                       </div>
                                    )}
                                 </div>
                              ) : (
                                 <Link href="/login" className="tg-btn tg-btn-seven" style={{ border: "none", textDecoration: "none" }}>Sign in</Link>
                              )}
                           </li>
                        </ul>
                     </div>
                     <div onClick={() => setSidebar(true)} style={{ cursor: "pointer" }} className="mobile-nav-toggler" role="button" aria-label="Open menu">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                           <line x1="3" y1="6" x2="21" y2="6" />
                           <line x1="3" y1="12" x2="21" y2="12" />
                           <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                     </div>
                  </nav>
               </div>
            </div>
         </div>
         <MobileSidebar
            sidebar={sidebar}
            setSidebar={setSidebar}
            authUser={authUser}
            isElevated={isElevated}
            onLogout={handleLogout}
            hideSignIn={hideSignIn}
         />

         <style jsx>{`
            .user-menu {
               position: relative;
               display: inline-block;
            }
            .user-menu__trigger {
               display: inline-flex;
               align-items: center;
               gap: 8px;
               background: rgba(11, 26, 74, 0.04);
               border: 1px solid rgba(11, 26, 74, 0.10);
               border-radius: 999px;
               padding: 5px 12px 5px 5px;
               cursor: pointer;
               font-family: var(--tg-heading-font-family), sans-serif;
               font-size: 14px;
               font-weight: 600;
               color: #0b1a4a;
               line-height: 1;
               transition: background 0.2s ease, border-color 0.2s ease;
            }
            .user-menu__trigger:hover {
               background: rgba(11, 26, 74, 0.08);
               border-color: rgba(11, 26, 74, 0.18);
            }
            .user-menu__avatar {
               display: inline-flex;
               align-items: center;
               justify-content: center;
               width: 26px;
               height: 26px;
               border-radius: 999px;
               background: linear-gradient(135deg, #0b1a4a 0%, #0a3cc2 100%);
               color: #fff;
               font-size: 12px;
               font-weight: 700;
               flex-shrink: 0;
            }
            .user-menu__name {
               max-width: 150px;
               overflow: hidden;
               text-overflow: ellipsis;
               white-space: nowrap;
            }
            .user-menu__caret {
               transition: transform 0.2s ease;
               opacity: 0.7;
               flex-shrink: 0;
            }
            .user-menu__caret.is-open {
               transform: rotate(180deg);
            }
            .user-menu__dropdown {
               position: absolute;
               top: calc(100% + 10px);
               right: 0;
               min-width: 210px;
               background: #ffffff;
               border: 1px solid rgba(11, 26, 74, 0.08);
               border-radius: 12px;
               box-shadow: 0 12px 32px rgba(11, 26, 74, 0.14);
               padding: 6px;
               z-index: 1100;
               animation: user-menu-in 0.14s ease-out;
            }
            @keyframes user-menu-in {
               from { opacity: 0; transform: translateY(-4px); }
               to { opacity: 1; transform: translateY(0); }
            }
            /* :global + parent selector so these win over the marketing
               theme's <a> styling, which otherwise renders the next/link
               items blue, oversized and inline (styled-jsx's scope class does
               not reliably land on <Link>). */
            :global(.user-menu__dropdown .user-menu__item) {
               display: block !important;
               width: 100%;
               text-align: left;
               background: none;
               border: none;
               border-radius: 8px;
               padding: 8px 12px !important;
               font-family: var(--tg-body-font-family), sans-serif;
               font-size: 13.5px !important;
               font-weight: 500 !important;
               line-height: 1.4 !important;
               color: #334155 !important;
               text-decoration: none !important;
               cursor: pointer;
               transition: background 0.15s ease, color 0.15s ease;
            }
            :global(.user-menu__dropdown .user-menu__item:hover) {
               background: #f1f5f9 !important;
               color: #0f172a !important;
            }
            :global(.user-menu__dropdown .user-menu__item--danger) {
               color: #dc2626 !important;
            }
            :global(.user-menu__dropdown .user-menu__item--danger:hover) {
               background: rgba(220, 38, 38, 0.08) !important;
               color: #dc2626 !important;
            }
            :global(.user-menu__divider) {
               height: 1px;
               margin: 6px 4px;
               background: rgba(15, 23, 42, 0.08);
            }

            .brand-mark-wrap {
               display: flex;
               align-items: center;
               gap: 12px;
               text-decoration: none;
               white-space: nowrap;
               flex-shrink: 0;
            }

            .logo-icon img {
               height: clamp(30px, 3.5vw, 40px) !important;
               width: auto !important;
               transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
               filter: drop-shadow(0 4px 8px rgba(0, 71, 255, 0.1));
            }

            .brand-mark-wrap:hover .logo-icon img {
               transform: scale(1.1) rotate(-5deg);
            }

            .logo-text-wrap {
               display: flex;
               flex-direction: column;
               justify-content: center;
               line-height: 1;
            }

            .logo-text {
               font-family: 'Plus Jakarta Sans', var(--tg-heading-font-family), sans-serif;
               font-size: clamp(14px, 1.4vw, 20px);
               font-weight: 700;
               letter-spacing: -0.03em;
               text-transform: uppercase;
               display: inline-block;
               position: relative;
               line-height: 1.2;
               color: #0B1A4A !important; /* Base color */
            }

            @supports (background-clip: text) or (-webkit-background-clip: text) {
               .logo-text {
                  background-image: linear-gradient(135deg, #0B1A4A 0%, #0A3CC2 100%);
                  -webkit-background-clip: text;
                  background-clip: text;
                  color: transparent !important;
                  -webkit-text-fill-color: transparent !important;
               }
            }

            .logo-tagline {
               font-size: clamp(8px, 0.7vw, 10px);
               font-weight: 600;
               letter-spacing: 0.15em;
               text-transform: uppercase;
               color: #64748b;
               margin-top: 2px;
            }

            .tgmenu__nav {
               display: flex;
               align-items: center;
               justify-content: space-between;
               width: 100%;
               gap: clamp(10px, 1vw, 22px);
            }

            .tgmenu__navbar-wrap {
               flex: 1 1 auto;
               min-width: 0;
               display: flex;
               justify-content: flex-end;
               margin-left: clamp(16px, 2vw, 34px);
               margin-right: clamp(10px, 1.1vw, 18px);
            }

            .tgmenu__action-seven {
               margin-left: auto;
               flex-shrink: 0;
            }

            .tgmenu__navbar-wrap :global(.navigation) {
               display: flex;
               align-items: center;
               justify-content: center;
               flex-wrap: nowrap;
               width: 100%;
               margin: 0 !important;
               padding: 0;
               gap: clamp(4px, 0.5vw, 12px);
            }

            .tgmenu__navbar-wrap :global(.navigation > li) {
               flex: 0 0 auto;
            }

            .tgmenu__navbar-wrap :global(.navigation > li > a) {
               padding: clamp(16px, 1.8vw, 22px) clamp(6px, 0.7vw, 12px) !important;
               font-size: clamp(11px, 0.82vw, 13px) !important;
            }

             .logo {
                padding: 12px 0;
             }

             :global(.transparent-header) {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                z-index: 1000;
             }

             :global(#sticky-header) {
                background: transparent !important;
                z-index: 1000;
                padding: 0 !important;
                transition: background 0.3s ease, box-shadow 0.3s ease;
             }

            :global(#sticky-header .container.custom-container),
            :global(#sticky-header .tgmenu__wrap),
            :global(#sticky-header .tgmenu__nav) {
               background: transparent !important;
            }

            :global(#sticky-header .tgmenu__wrap) {
               border-bottom: 1px solid transparent;
               box-shadow: none;
               backdrop-filter: none;
            }

            :global(#sticky-header.sticky-menu) {
               background: #ffffff !important;
               backdrop-filter: blur(10px);
               border-bottom: 1px solid rgba(11, 26, 74, 0.08);
               box-shadow: 0 8px 24px rgba(11, 26, 74, 0.06);
               z-index: 1000;
               top: 0 !important;
               margin-top: 0 !important;
               padding: 0 !important;
               animation: none !important;
            }

            :global(#sticky-header.sticky-menu .container.custom-container),
            :global(#sticky-header.sticky-menu .tgmenu__wrap),
            :global(#sticky-header.sticky-menu .tgmenu__nav) {
               background: transparent !important;
               backdrop-filter: none !important;
            }

            :global(#sticky-header .tgmenu__nav) {
               padding: 10px 0 !important;
            }

            @media (max-width: 1400px) {
               .tgmenu__nav {
                  gap: 15px;
               }
               .logo-text {
                  font-size: clamp(15px, 1.2vw, 19px);
               }
               .logo-icon img {
                  height: clamp(36px, 3.4vw, 48px) !important;
               }
               .logo-tagline {
                  display: none;
               }
               .tgmenu__navbar-wrap :global(.navigation > li > a) {
                  padding-left: 8px !important;
                  padding-right: 8px !important;
                  font-size: 12px !important;
               }
               .tgmenu__navbar-wrap {
                  margin-left: 16px;
                  margin-right: 12px;
               }
                .tgmenu__action-seven :global(.tg-btn) {
                   padding: 8px 12px !important;
                   font-size: 11px !important;
                }
            }

            @media (max-width: 1200px) {
               .tgmenu__nav {
                  gap: 10px;
               }
               .logo-text {
                  font-size: 14px;
               }
               .tgmenu__navbar-wrap :global(.navigation > li > a) {
                  padding-left: 6px !important;
                  padding-right: 6px !important;
                  font-size: 11px !important;
               }
               .tgmenu__navbar-wrap {
                  margin-left: 12px;
                  margin-right: 10px;
               }
               .tgmenu__action-seven :global(.tg-btn) {
                  padding: 7px 10px !important;
                  font-size: 10px !important;
               }
            }

            /* Prevent menu from wrapping to next line */
            @media (min-width: 992px) {
               .tgmenu__nav {
                  flex-wrap: nowrap !important;
               }
               .tgmenu__navbar-wrap {
                  min-width: 0;
               }
            }

            @media (max-width: 991px) {
                .tg-header__area-seven {
                   padding: 12px 0 !important;
                }
               .logo-text {
                  font-size: 19px;
                  /* Ensure solid color on mobile if gradient fails */
                  color: #0B1A4A !important;
                  -webkit-text-fill-color: initial;
               }
               @supports (background-clip: text) or (-webkit-background-clip: text) {
                  .logo-text {
                     -webkit-text-fill-color: transparent !important;
                  }
               }
               .brand-mark-wrap {
                  gap: 10px;
               }
            }

            @media (max-width: 480px) {
                .tg-header__area-seven {
                   padding: 10px 0 !important;
                }
               .logo-text {
                  font-size: 16px;
               }
               .brand-mark-wrap {
                  gap: 8px;
               }
               .logo-icon img {
                  height: 36px !important;
               }
            }
         `}</style>

      </header>
   )
}

export default HeaderFive
