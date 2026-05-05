import { StaticImageData } from "next/image";

import team_1 from "@/assets/img/team/team_img01.png"
import team_2 from "@/assets/img/team/team_img02.png"
import team_3 from "@/assets/img/team/team_img03.png"
import team_4 from "@/assets/img/team/team_img04.png"

import team2_1 from "@/assets/img/team/h3_team_img01.png"
import team2_2 from "@/assets/img/team/h3_team_img02.png"
import team2_3 from "@/assets/img/team/h3_team_img03.png"
import team2_4 from "@/assets/img/team/h3_team_img04.png"

import team4_1 from "@/assets/img/team/h5_team_img01.png"
import team4_2 from "@/assets/img/team/h5_team_img02.png"
import team4_3 from "@/assets/img/team/h5_team_img03.png"
import team4_4 from "@/assets/img/team/h5_team_img04.png"

interface DataType {
   id: number;
   page: string;
   thumb: StaticImageData;
   name: string;
   designation: string;
}

const team_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      thumb: team_1,
      name: "Eleanor Pena",
      designation: "Tax Advisor",
   },
   {
      id: 2,
      page: "home_1",
      thumb: team_2,
      name: "Ralph Edwards",
      designation: "Finance Advisor",
   },
   {
      id: 3,
      page: "home_1",
      thumb: team_3,
      name: "Jone Cooper",
      designation: "Finance Advisor",
   },
   {
      id: 4,
      page: "home_1",
      thumb: team_4,
      name: "Floyd Miles",
      designation: "Finance Advisor",
   },

   // home_2
   {
      id: 1,
      page: "home_2",
      thumb: team2_1,
      name: "Eleanor Pena",
      designation: "Tax Advisor",
   },
   {
      id: 2,
      page: "home_2",
      thumb: team2_2,
      name: "Jenny Wilson",
      designation: "Tax Advisor",
   },
   {
      id: 3,
      page: "home_2",
      thumb: team2_3,
      name: "Robert Fox",
      designation: "Tax Advisor",
   },
   {
      id: 4,
      page: "home_2",
      thumb: team2_4,
      name: "Floyd Miles",
      designation: "Tax Advisor",
   },

   // home_4

   {
      id: 1,
      page: "home_4",
      thumb: team4_1,
      name: "Eleanor Pena",
      designation: "Tax Advisor",
   },
   {
      id: 2,
      page: "home_4",
      thumb: team4_2,
      name: "Jane Cooper",
      designation: "Finance Manager",
   },
   {
      id: 3,
      page: "home_4",
      thumb: team4_3,
      name: "Jerome Bell",
      designation: "Sr. Brand Designer",
   },
   {
      id: 4,
      page: "home_4",
      thumb: team4_4,
      name: "Leslie Alexander",
      designation: "SEO Expert",
   },

   // inner_page
   {
      id: 1,
      page: "inner_page",
      thumb: team2_1,
      name: "Eleanor Pena",
      designation: "Tax Advisor",
   },
   {
      id: 2,
      page: "inner_page",
      thumb: team2_2,
      name: "Jenny Wilson",
      designation: "Tax Advisor",
   },
   {
      id: 3,
      page: "inner_page",
      thumb: team2_3,
      name: "Robert Fox",
      designation: "Tax Advisor",
   },
   {
      id: 4,
      page: "inner_page",
      thumb: team2_4,
      name: "Floyd Miles",
      designation: "Tax Advisor",
   },
   {
      id: 5,
      page: "inner_page",
      thumb: team4_1,
      name: "Eleanor Pena",
      designation: "Tax Advisor",
   },
   {
      id: 6,
      page: "inner_page",
      thumb: team4_2,
      name: "Jane Cooper",
      designation: "Finance Manager",
   },
   {
      id: 7,
      page: "inner_page",
      thumb: team4_3,
      name: "Jerome Bell",
      designation: "Sr. Brand Designer",
   },
   {
      id: 8,
      page: "inner_page",
      thumb: team4_4,
      name: "Leslie Alexander",
      designation: "SEO Expert",
   },
];

export default team_data;