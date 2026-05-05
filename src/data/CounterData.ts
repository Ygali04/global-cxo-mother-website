interface DataType {
   id: number;
   page: string;
   icon: string;
   count: number;
   title: string;
}

const counter_data: DataType[] = [
   {
      id: 1,
      page: "home_1",
      icon: "flaticon-partner",
      count: 95,
      title: "Project Completed",
   },
   {
      id: 2,
      page: "home_1",
      icon: "flaticon-rating",
      count: 67,
      title: "Satisfied Clients",
   },
   {
      id: 3,
      page: "home_1",
      icon: "flaticon-achievement",
      count: 17,
      title: "Company Award",
   },
   {
      id: 4,
      page: "home_1",
      icon: "flaticon-statistics",
      count: 82,
      title: "Repeat Customers",
   },
];

export default counter_data;