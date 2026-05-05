import { StaticImageData } from "next/image";

import project_thumb1 from "@/assets/img/project/h2_project_img01.jpg"
import project_thumb2 from "@/assets/img/project/h2_project_img02.jpg"
import project_thumb3 from "@/assets/img/project/h2_project_img03.jpg"
import project_thumb4 from "@/assets/img/project/h2_project_img04.jpg"

import project2_thumb1 from "@/assets/img/project/h3_project_img01.jpg"
import project2_thumb2 from "@/assets/img/project/h3_project_img02.jpg"
import project2_thumb3 from "@/assets/img/project/h3_project_img03.jpg"
import project2_thumb4 from "@/assets/img/project/h3_project_img04.jpg"

import project3_thumb1 from "@/assets/img/project/project_img01.jpg"
import project3_thumb2 from "@/assets/img/project/project_img02.jpg"
import project3_thumb3 from "@/assets/img/project/project_img03.jpg"
import project3_thumb4 from "@/assets/img/project/project_img04.jpg"

import project4_thumb1 from "@/assets/img/project/h5_project_img01.jpg"
import project4_thumb2 from "@/assets/img/project/h5_project_img02.jpg"
import project4_thumb3 from "@/assets/img/project/h5_project_img03.jpg"
import project4_thumb4 from "@/assets/img/project/h5_project_img04.jpg"
import project4_thumb5 from "@/assets/img/project/h5_project_img05.jpg"
import project4_thumb6 from "@/assets/img/project/h5_project_img06.jpg"

interface DataType {
   id: number;
   page: string;
   thumb: StaticImageData;
   title: string;
   tag: string;
   class?: string;
}

const project_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      thumb: project_thumb1,
      title: "Market Share Gain",
      tag: "Marketing",
      class: "col-lg-4",
   },
   {
      id: 2,
      page: "home_1",
      thumb: project_thumb2,
      title: "Market Share Gain",
      tag: "Marketing",
      class: "col-lg-8",
   },
   {
      id: 3,
      page: "home_1",
      thumb: project_thumb3,
      title: "Market Share Gain",
      tag: "Marketing",
      class: "col-lg-6",
   },
   {
      id: 4,
      page: "home_1",
      thumb: project_thumb4,
      title: "Market Share Gain",
      tag: "Marketing",
      class: "col-lg-6",
   },

   // home_2
   {
      id: 1,
      page: "home_2",
      thumb: project2_thumb1,
      tag: "Keywords",
      title: "Conducting Accessibility Research Inaccessible"
   },
   {
      id: 2,
      page: "home_2",
      thumb: project2_thumb2,
      tag: "Market Analysis",
      title: "How To Work With Graphic WordPress In 2025"
   },
   {
      id: 3,
      page: "home_2",
      thumb: project2_thumb3,
      tag: "Marketing",
      title: "How To Monitor And Optim ze Google Core Web"
   },
   {
      id: 4,
      page: "home_2",
      thumb: project2_thumb4,
      tag: "Web Traffic",
      title: "Sketchnotes And Key Take aways 2025"
   },
   {
      id: 5,
      page: "home_2",
      thumb: project2_thumb3,
      tag: "Marketing",
      title: "How To Monitor And Optim ze Google Core Web"
   },

   // home_3
   {
      id: 1,
      page: "home_3",
      thumb: project3_thumb1,
      tag: "Business Strategy",
      title: "Conducting Accessibility Research Inaccessible"
   },
   {
      id: 2,
      page: "home_3",
      thumb: project3_thumb2,
      tag: "Business Strategy",
      title: "Conducting Accessibility Research Inaccessible"
   },
   {
      id: 3,
      page: "home_3",
      thumb: project3_thumb3,
      tag: "Business Strategy",
      title: "Conducting Accessibility Research Inaccessible"
   },
   {
      id: 4,
      page: "home_3",
      thumb: project3_thumb4,
      tag: "Business Strategy",
      title: "Conducting Accessibility Research Inaccessible"
   },
   {
      id: 5,
      page: "home_3",
      thumb: project3_thumb2,
      tag: "Business Strategy",
      title: "Conducting Accessibility Research Inaccessible"
   },

   // home_4
   {
      id: 1,
      page: "home_4",
      thumb: project4_thumb1,
      tag: "Business Strategy",
      title: "10x Business Growth"
   },
   {
      id: 2,
      page: "home_4",
      thumb: project4_thumb2,
      tag: "Strategy Map",
      title: "Web Development"
   },
   {
      id: 3,
      page: "home_4",
      thumb: project4_thumb3,
      tag: "Planning",
      title: "Business Planning"
   },
   {
      id: 4,
      page: "home_4",
      thumb: project4_thumb4,
      tag: "Data Process",
      title: "Big Data & Analytics"
   },
   {
      id: 5,
      page: "home_4",
      thumb: project4_thumb5,
      tag: "Business",
      title: "Data Management"
   },
   {
      id: 6,
      page: "home_4",
      thumb: project4_thumb6,
      tag: "Business Strategy",
      title: "10x Business Growth"
   },
];

export default project_data;