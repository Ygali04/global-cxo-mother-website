import { StaticImageData } from "next/image";

import blog_1 from "@/assets/img/blog/blog_post02.jpg"
import blog_2 from "@/assets/img/blog/blog_post03.jpg"

import blog2_1 from "@/assets/img/blog/blog_post03.jpg"
import blog2_2 from "@/assets/img/blog/blog_post04.jpg"
import blog2_3 from "@/assets/img/blog/blog_post06.jpg"

import blog3_1 from "@/assets/img/blog/blog_post01.jpg"
import blog3_2 from "@/assets/img/blog/blog_post02.jpg"
import blog3_3 from "@/assets/img/blog/blog_post03.jpg"

import blog4_1 from "@/assets/img/blog/h5_blog_post02.jpg"
import blog4_2 from "@/assets/img/blog/h5_blog_post03.jpg"

import inner_blog1 from "@/assets/img/blog/blog_post01.jpg"
import inner_blog2 from "@/assets/img/blog/blog_post02.jpg"
import inner_blog3 from "@/assets/img/blog/blog_post03.jpg"
import inner_blog4 from "@/assets/img/blog/blog_post04.jpg"

import avatar_1 from "@/assets/img/images/testi_avatar01.png"
import avatar_2 from "@/assets/img/images/testi_avatar02.png"
import avatar_3 from "@/assets/img/images/testi_avatar03.png"

export interface BlogDataType {
   id: number;
   page: string;
   thumb: StaticImageData;
   tag?: string;
   date: string;
   title: string;
   desc?: string;
   avatar: StaticImageData;
   name?: string;
   comment?: string;
   space?: string;
}

const blog_data: BlogDataType[] = [
   {
      id: 1,
      page: "home_1",
      thumb: blog_1,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "How To Monitor Optimize Google Core Web Vitals",
      desc: "Building areathing you need toter atching presence.",
      avatar: avatar_2,
      name: "Doman Smith",
      space: "mb-20",
   },
   {
      id: 2,
      page: "home_1",
      thumb: blog_2,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "How To Monitor Optimize Google Core Web Vitals",
      desc: "Building areathing you need toter atching presence.",
      avatar: avatar_3,
      name: "Doman Smith"
   },

   // home_2
   {
      id: 1,
      page: "home_2",
      thumb: blog2_1,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "Participate In Staff Meetings Dedicated To Strategically",
      avatar: avatar_1,
      name: "Doman Smith",
      comment: "15",
   },
   {
      id: 2,
      page: "home_2",
      thumb: blog2_2,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "Sketchnotes And Key Takea ways From Smashin",
      avatar: avatar_2,
      name: "Doman Smith",
      comment: "15",
   },
   {
      id: 3,
      page: "home_2",
      thumb: blog2_3,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "Modern CSS Tooltips And Speech Bubbles",
      avatar: avatar_3,
      name: "Doman Smith",
      comment: "15",
   },

   // home_3
   {
      id: 1,
      page: "home_3",
      thumb: blog3_1,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "How To Monitor And Google Core Web Vitals",
      avatar: avatar_1,
      name: "Doman Smith",
   },
   {
      id: 2,
      page: "home_3",
      thumb: blog3_2,
      tag: "Corporate Work",
      date: "Oct 21, 2025",
      title: "How To Monitor And Google Core Web Vitals",
      avatar: avatar_2,
      name: "Doman Smith",
   },
   {
      id: 3,
      page: "home_3",
      thumb: blog3_3,
      tag: "consulting",
      date: "Oct 21, 2025",
      title: "How To Monitor And Google Core Web Vitals",
      avatar: avatar_3,
      name: "Doman Smith",
   },

   // home_4

   {
      id: 1,
      page: "home_4",
      thumb: blog4_1,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "How To Monitor Optimize Google Core Web Vitals",
      desc: "Building areathing you need toter atching presence.",
      avatar: avatar_2,
      name: "Doman Smith",
      space: "mb-20",
   },
   {
      id: 2,
      page: "home_4",
      thumb: blog4_2,
      tag: "Business",
      date: "Oct 21, 2025",
      title: "How To Monitor Optimize Google Core Web Vitals",
      desc: "Building areathing you need toter atching presence.",
      avatar: avatar_3,
      name: "Doman Smith"
   },

   // inner_blog
   {
      id: 1,
      page: "inner_blog",
      thumb: inner_blog1,
      date: "Oct 21, 2025",
      title: "Get a few solutions to hire a best candidate",
      desc: "Eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond.",
      avatar: avatar_3,
   },
   {
      id: 2,
      page: "inner_blog",
      thumb: inner_blog2,
      date: "Oct 21, 2025",
      title: "Get a few solutions to hire a best candidate",
      desc: "Eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond.",
      avatar: avatar_3,
   },
   {
      id: 3,
      page: "inner_blog",
      thumb: inner_blog3,
      date: "Oct 21, 2025",
      title: "Get a few solutions to hire a best candidate",
      desc: "Eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond.",
      avatar: avatar_3,
   },
   {
      id: 4,
      page: "inner_blog",
      thumb: inner_blog4,
      date: "Oct 21, 2025",
      title: "Get a few solutions to hire a best candidate",
      desc: "Eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond.",
      avatar: avatar_3,
   },
   {
      id: 5,
      page: "inner_blog",
      thumb: inner_blog3,
      date: "Oct 21, 2025",
      title: "Get a few solutions to hire a best candidate",
      desc: "Eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond.",
      avatar: avatar_3,
   },
   {
      id: 6,
      page: "inner_blog",
      thumb: inner_blog4,
      date: "Oct 21, 2025",
      title: "Get a few solutions to hire a best candidate",
      desc: "Eed a little help from our friends from time to time. Although we offer the one-stop convenience of annery integrated range of legal, financial services under one roof, there are occasions when our clients areaneed specia- list advice beyond.",
      avatar: avatar_3,
   },
];

export default blog_data;