import ScrollToTop from "@/components/common/ScrollToTop";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";

type WrapperProps = {
   children: ReactNode;
};

const Wrapper = ({ children }: WrapperProps) => {

   return (
      <>
         {children}
         <ScrollToTop />
         <ToastContainer position="top-center" />
      </>
   );
};

export default Wrapper;