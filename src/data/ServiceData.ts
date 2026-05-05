import { StaticImageData } from "next/image";

import service_thumb1 from "@/assets/img/services/h6_services_img01.jpg"
import service_thumb2 from "@/assets/img/services/h6_services_img02.jpg"
import service_thumb3 from "@/assets/img/services/h6_services_img03.jpg"
import service_thumb4 from "@/assets/img/services/h6_services_img04.jpg"

interface DataType {
   id: number;
   page: string;
   icon: string;
   thumb?: StaticImageData;
   title: string;
   desc: string;
};

const service_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      icon: "flaticon-analytics",
      title: "Market Research",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 2,
      page: "home_1",
      icon: "flaticon-envelope-1",
      title: "E-mail Marketing",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 3,
      page: "home_1",
      icon: "flaticon-report",
      title: "Reports Analysis",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },

   // home_3
   {
      id: 1,
      page: "home_3",
      icon: "flaticon-idea",
      title: "Creative Business Ideas",
      desc: "Transform your business witsformative consultin gear solutionso beyond shor t-term fixes to deliver"
   },
   {
      id: 2,
      page: "home_3",
      icon: "flaticon-report",
      title: "Digital Marketing Solutions",
      desc: "Transform your business witsformative consultin gear solutionso beyond shor t-term fixes to deliver"
   },
   {
      id: 3,
      page: "home_3",
      icon: "flaticon-database",
      title: "UI/UX Design Consultancy",
      desc: "Transform your business witsformative consultin gear solutionso beyond shor t-term fixes to deliver"
   },
   {
      id: 4,
      page: "home_3",
      icon: "flaticon-target",
      title: "Branding Design Agency",
      desc: "Transform your business witsformative consultin gear solutionso beyond shor t-term fixes to deliver"
   },
   {
      id: 5,
      page: "home_3",
      icon: "flaticon-database",
      title: "UI/UX Design Consultancy",
      desc: "Transform your business witsformative consultin gear solutionso beyond shor t-term fixes to deliver"
   },

   // home_4
   {
      id: 1,
      page: "home_4",
      icon: "flaticon-idea",
      title: "Initiation & Planning",
      desc: "Transform your business with ourtransfo reive consulting solutione go beyond short-term fixes to deliver"
   },
   {
      id: 2,
      page: "home_4",
      icon: "flaticon-startup",
      title: "Design & Development",
      desc: "Transform your business with ourtransfo reive consulting solutione go beyond short-term fixes to deliver"
   },
   {
      id: 3,
      page: "home_4",
      icon: "flaticon-medal",
      title: "Quality Insurance",
      desc: "Transform your business with ourtransfo reive consulting solutione go beyond short-term fixes to deliver"
   },

   // home_5

   {
      id: 1,
      page: "home_5",
      thumb: service_thumb1,
      icon: "flaticon-health-insurance",
      title: "Life Insurance",
      desc: "Transform your business with our trane ormative consulting solutione go beyo sustainable growth."
   },
   {
      id: 2,
      page: "home_5",
      thumb: service_thumb2,
      icon: "flaticon-real-estate",
      title: "Home Insurance",
      desc: "Transform your business with our trane ormative consulting solutione go beyo sustainable growth."
   },
   {
      id: 3,
      page: "home_5",
      thumb: service_thumb3,
      icon: "flaticon-protection",
      title: "Cargo Insurance",
      desc: "Transform your business with our trane ormative consulting solutione go beyo sustainable growth."
   },
   {
      id: 4,
      page: "home_5",
      thumb: service_thumb4,
      icon: "flaticon-house",
      title: "Fire Insurance",
      desc: "Transform your business with our trane ormative consulting solutione go beyo sustainable growth."
   },

   {
      id: 1,
      page: "home_5_work",
      icon: "flaticon-health-insurance",
      title: "Choose Insurance",
      desc: "Transform your business with ourtransfo reive consulting solutione go beyond short-term fixes to deliver"
   },
   {
      id: 2,
      page: "home_5_work",
      icon: "flaticon-growth",
      title: "Meet With Agent",
      desc: "Transform your business with ourtransfo reive consulting solutione go beyond short-term fixes to deliver"
   },
   {
      id: 3,
      page: "home_5_work",
      icon: "flaticon-handshake",
      title: "Start Your Policy",
      desc: "Transform your business with ourtransfo reive consulting solutione go beyond short-term fixes to deliver"
   },

   // inner_page
   {
      id: 1,
      page: "inner_page",
      icon: "flaticon-analytics",
      title: "Market Research",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 2,
      page: "inner_page",
      icon: "flaticon-envelope-1",
      title: "E-mail Marketing",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 3,
      page: "inner_page",
      icon: "flaticon-report",
      title: "Reports Analysis",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 4,
      page: "inner_page",
      icon: "flaticon-investment",
      title: "Innovation Idea",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 5,
      page: "inner_page",
      icon: "flaticon-target",
      title: "Strategic Planning",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },
   {
      id: 6,
      page: "inner_page",
      icon: "flaticon-accountant",
      title: "Tax Advisory",
      desc: "Transform your siness with they are ative consng Weshfixes erm enu ring the sustainable succes."
   },

   // feature
   {
      id: 1,
      page: "feature",
      icon: "flaticon-megaphone",
      title: "Initial Consultation",
      desc: "Gather client details and understand their concerns.",
   },
   {
      id: 2,
      page: "feature",
      icon: "flaticon-health-insurance",
      title: "Information Gathering",
      desc: "Collect all necessary financial and tax-related.",
   },
   {
      id: 3,
      page: "feature",
      icon: "flaticon-calculator",
      title: "Tax Assessment",
      desc: "Evaluate the client's financial tax obligations.",
   },
   {
      id: 4,
      page: "feature",
      icon: "flaticon-tax",
      title: "Strategic Tax Planning",
      desc: "Develop a tax-efficient strategy to the client’s.",
   },

   //benefit 
   {
      id: 1,
      page: "benefit",
      icon: "flaticon-target",
      title: "Highly targeted",
      desc: "Gather client details and understand their concerns.",
   },
   {
      id: 2,
      page: "benefit",
      icon: "flaticon-idea",
      title: "Improves customer",
      desc: "Gather client details and understand their concerns.",
   },
   {
      id: 3,
      page: "benefit",
      icon: "flaticon-investment",
      title: "Reach a global",
      desc: "Gather client details and understand their concerns.",
   },
   {
      id: 4,
      page: "benefit",
      icon: "flaticon-tax",
      title: "Cost-effective",
      desc: "Gather client details and understand their concerns.",
   },
   {
      id: 5,
      page: "benefit",
      icon: "flaticon-personal",
      title: "Delivers real-time",
      desc: "Gather client details and understand their concerns.",
   },
];

export default service_data;