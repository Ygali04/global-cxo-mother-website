import { StaticImageData } from "next/image";

import avatar_1 from "@/assets/img/images/testi_avatar01.png"
import avatar_2 from "@/assets/img/images/testi_avatar02.png"
import avatar_3 from "@/assets/img/images/testi_avatar03.png"
import avatar_4 from "@/assets/img/images/testi_avatar04.png"

interface DataType {
   id: number;
   page: string;
   avatar: StaticImageData;
   name: string;
   designation: string;
   desc: string;
}

const testi_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      avatar: avatar_1,
      name: "Mr.Robey Alexa",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elita florai psum dolor sitter amet consect eture.Borem ”",
   },
   {
      id: 2,
      page: "home_1",
      avatar: avatar_2,
      name: "Mr.Robey Alexa",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elita florai psum dolor sitter amet consect eture.Borem ”",
   },
   {
      id: 3,
      page: "home_1",
      avatar: avatar_3,
      name: "Mr.Robey Alexa",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elita florai psum dolor sitter amet consect eture.Borem ”",
   },
   {
      id: 4,
      page: "home_1",
      avatar: avatar_4,
      name: "Mr.Robey Alexa",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elita florai psum dolor sitter amet consect eture.Borem ”",
   },
   {
      id: 5,
      page: "home_1",
      avatar: avatar_3,
      name: "Mr.Robey Alexa",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elita florai psum dolor sitter amet consect eture.Borem ”",
   },

   // home_2
   {
      id: 1,
      page: "home_2",
      avatar: avatar_4,
      name: "Mr.Robey Alexa",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elitaaey um dolor sitter amet consect eturellam eu neque esacili facilisis vitae massa. Quisque ”",
   },
   {
      id: 2,
      page: "home_2",
      avatar: avatar_2,
      name: "Savannah Nguyen",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elitaaey um dolor sitter amet consect eturellam eu neque esacili facilisis vitae massa. Quisque ”",
   },
   {
      id: 3,
      page: "home_2",
      avatar: avatar_3,
      name: "Wade Warren",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elitaaey um dolor sitter amet consect eturellam eu neque esacili facilisis vitae massa. Quisque ”",
   },
   {
      id: 4,
      page: "home_2",
      avatar: avatar_1,
      name: "Courtney Henry",
      designation: "CEO, Xara Agency",
      desc: "“Morem ipsum dolor sit amconsectetur adipiscing elitaaey um dolor sitter amet consect eturellam eu neque esacili facilisis vitae massa. Quisque ”",
   },
];

export default testi_data;