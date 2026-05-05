import arrow from "@/assets/img/icons/right_arrow.svg"
import InjectableSvg from "./InjectableSvg"
const Arrow = () => {
   return (
      <>
         <InjectableSvg src={arrow.src} alt="" className="injectable" />
      </>
   )
}

export default Arrow
