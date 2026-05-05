import React from "react";
import Lightbox from "yet-another-react-lightbox";

interface SlideType {
   src: string;
}

interface ImagePopupProps {
   images: SlideType[];
   isOpen: boolean;
   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
   photoIndex: number;
}

const ImagePopup = ({ images, isOpen, setIsOpen, photoIndex }: ImagePopupProps) => {
   return (
      <Lightbox
         open={isOpen}
         close={() => setIsOpen(false)}
         slides={images}
         index={photoIndex}
      />
   );
};

export default ImagePopup;