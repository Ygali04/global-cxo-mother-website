import HeaderFive from "@/layouts/headers/HeaderFive";
import AdvisorsArea from "./AdvisorsArea";
import FooterThree from "@/layouts/footers/FooterThree";

const Advisors = () => {
    return (
        <>
            <HeaderFive />
            <main className="main-area fix">
                <AdvisorsArea />
            </main>
            <FooterThree />
        </>
    )
}

export default Advisors;
