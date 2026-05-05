"use client"
import menu_data from "@/data/MenuData";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const MobileMenus = () => {
   const [navTitle, setNavTitle] = useState<string>("");
   const [subNavTitle, setSubNavTitle] = useState<string>("");
   const currentRoute = usePathname();

   const isMenuItemActive = (menuLink: string) => currentRoute === menuLink;
   const isSubMenuItemActive = (subMenuLink: string) => currentRoute === subMenuLink;

   const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
      if (link.startsWith('/#') && typeof window !== 'undefined' && window.location.pathname === '/') {
         const targetId = link.substring(2); // Remove '/#'
         if (targetId) {
            e.preventDefault();
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, '', link);
         }
      }
   };

   // toggle parent menu
   const toggleMenu = (menu: string) => {
      setNavTitle((prev) => (prev === menu ? "" : menu));
      setSubNavTitle("");
   };

   // toggle child menu
   const toggleSubMenu = (subMenu: string) => {
      setSubNavTitle((prev) => (prev === subMenu ? "" : subMenu));
   };

   return (
      <ul className="navigation">
         {menu_data.map((menu, i) => (
            <React.Fragment key={i}>
               {menu.has_dropdown ? (
                  <li className={`menu-item-has-children ${navTitle === menu.title ? "open" : ""}`}>
                     <Link
                        href={menu.link}
                        className={`${isMenuItemActive(menu.link) ||
                           (menu.sub_menus &&
                              menu.sub_menus.some((sub_m) => sub_m.link && isSubMenuItemActive(sub_m.link)))
                           ? "active"
                           : ""
                           }`}
                        onClick={(e) => { toggleMenu(menu.title); handleScroll(e, menu.link); }}
                     >
                        {menu.title}
                     </Link>

                     <div className={`dropdown-btn ${navTitle === menu.title ? "open" : ""}`} onClick={() => toggleMenu(menu.title)}>
                        <span className="plus-line"></span>
                     </div>

                     {menu.sub_menus && (
                        <ul className="sub-menu" style={{ display: navTitle === menu.title ? "block" : "none" }}>
                           {menu.sub_menus.map((sub_m, index) => (
                              <li
                                 key={index}
                                 className={`${sub_m.inner_sub_menus ? "menu-item-has-children" : ""
                                    } ${subNavTitle === sub_m.title ? "open" : ""}`}
                              >
                                 <Link
                                    href={sub_m.link}
                                    className={sub_m.link && isSubMenuItemActive(sub_m.link) ? "active" : ""}
                                    onClick={(e) => { toggleSubMenu(sub_m.title); handleScroll(e, sub_m.link); }}
                                 >
                                    {sub_m.title}
                                 </Link>

                                 {sub_m.inner_sub_menus && (
                                    <>
                                       <div className={`dropdown-btn ${subNavTitle === sub_m.title ? "open" : ""}`} onClick={() => toggleSubMenu(sub_m.title)}>
                                          <span className="plus-line"></span>
                                       </div>
                                       <ul
                                          className="sub-menu"
                                          style={{ display: subNavTitle === sub_m.title ? "block" : "none" }}
                                       >
                                          {sub_m.inner_sub_menus.map((inner, j) => (
                                             <li key={j}>
                                                <Link
                                                   href={inner.link}
                                                   className={isSubMenuItemActive(inner.link) ? "active" : ""}
                                                   onClick={(e) => handleScroll(e, inner.link)}
                                                >
                                                   {inner.title}
                                                </Link>
                                             </li>
                                          ))}
                                       </ul>
                                    </>
                                 )}
                              </li>
                           ))}
                        </ul>
                     )}
                  </li>
               ) : (
                  <li>
                     <Link href={menu.link} className={isMenuItemActive(menu.link) ? "active" : ""} onClick={(e) => handleScroll(e, menu.link)}>
                        {menu.title}
                     </Link>
                  </li>
               )}
            </React.Fragment>
         ))}
      </ul>
   );
};

export default MobileMenus;
