interface MenuItem {
   id: number;
   title: string;
   link: string;
   has_dropdown: boolean;
   sub_menus?: {
      link: string;
      title: string;
      inner_sub_menus?: {
         link: string;
         title: string;
      }[];
   }[];
};

const menu_data: MenuItem[] = [
   {
      id: 1,
      has_dropdown: false,
      title: "Home",
      link: "/",
   },
   {
      id: 2,
      has_dropdown: false,
      title: "About",
      link: "/#about",
   },
   {
      id: 3,
      has_dropdown: false,
      title: "Framework",
      link: "/#cxo-concept",
   },
   {
      id: 4,
      has_dropdown: false,
      title: "Circles",
      link: "/circles",
   },
   {
      id: 5,
      has_dropdown: false,
      title: "Platform",
      link: "/#platform",
   },
   {
      id: 6,
      has_dropdown: false,
      title: "Membership",
      link: "/#membership",
   },
   {
      id: 7,
      has_dropdown: false,
      title: "Events",
      link: "/#events",
   },
   {
      id: 8,
      has_dropdown: false,
      title: "Partners",
      link: "/#partners",
   },
   {
      id: 9,
      has_dropdown: false,
      title: "Contact",
      link: "/#contact",
   },
];
export default menu_data;