import NotFound from "@/components/pages/error";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
   title: "404 - Page Not Found | Global CXO Circle",
};
const NotFoundPage = () => {
   return (
      <Wrapper>
         <NotFound />
      </Wrapper>
   )
}

export default NotFoundPage