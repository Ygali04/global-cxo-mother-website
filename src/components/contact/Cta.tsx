import Image from "next/image"
import Link from "next/link"
import Arrow from "../common/Arrow"

import shape from "@/assets/img/images/h2_cta_shape.svg"

const Cta = () => {
    return (
        <section className="cta__area-two">
            <div className="container">
                <div className="cta__inner-wrap-two">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="cta__content-three">
                                <h2 className="title">Let’s Request a Schedule For Free Consultation</h2>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="cta__content-right">
                                <div className="cta__contact">
                                    <div className="icon">
                                        <i className="flaticon-telephone"></i>
                                    </div>
                                    <div className="content">
                                        <span>Call For More Info</span>
                                        <Link href="tel:+919845845616">+91 98458 45616</Link>
                                    </div>
                                </div>
                                <Link href="/#contact" className="tg-btn tg-btn-three tg-border-btn ">Join Us <Arrow /></Link>
                            </div>
                        </div>
                    </div>
                    <div className="cta__shape-three">
                        <Image src={shape} alt="shape" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Cta
