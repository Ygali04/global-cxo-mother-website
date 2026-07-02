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
      title: "About Us",
      link: "/about-us",
   },
   {
      id: 3,
      has_dropdown: false,
      title: "Circles",
      link: "/circles",
   },
   {
      id: 4,
      has_dropdown: false,
      title: "Pricing",
      link: "/pricing",
   },
   {
      id: 5,
      has_dropdown: false,
      title: "Events",
      link: "/events",
   },
   {
      id: 6,
      has_dropdown: false,
      title: "Gallery",
      link: "/gallery",
   },
   {
      id: 7,
      has_dropdown: false,
      title: "Resources",
      link: "/resources",
   },
   {
      id: 8,
      has_dropdown: false,
      title: "Awards",
      link: "/awards",
   },
   {
      id: 9,
      has_dropdown: false,
      title: "Contact",
      link: "/contact",
   },
];
export default menu_data;
