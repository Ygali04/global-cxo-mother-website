import HeaderFive from "@/layouts/headers/HeaderFive";
import FoundersArea from "./FoundersArea";
import FooterThree from "@/layouts/footers/FooterThree";

const Founders = () => {
    return (
        <>
            <HeaderFive />
            <main className="main-area fix">
                <FoundersArea />
            </main>
            <FooterThree />
        </>
    )
}

export default Founders;
