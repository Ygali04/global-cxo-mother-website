"use client"
import { useState } from "react";
import VideoPopup from "@/modals/VideoPopup";

import bg_img from "@/assets/img/bg/h6_video_bg.webp"

const VideoArea = () => {

   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <div className="video__area-four">
            <div className="video__bg-four" style={{ backgroundImage: `url(${bg_img.src})` }}></div>
            <div className="video__btn-three">
               <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="play__btn-two play__btn-three popup-video">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28" fill="none">
                     <path d="M0 2.66333C0 1.081 1.75049 0.125316 3.08152 0.980974L20.7163 12.3176C21.941 13.1049 21.941 14.8951 20.7163 15.6824L3.08152 27.019C1.7505 27.8747 0 26.919 0 25.3367V2.66333Z" fill="currentColor" />
                  </svg>
               </a>
            </div>
         </div>
         <VideoPopup
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            videoId="6mkoGSqTqFI"
         />
      </>
   )
}

export default VideoArea
