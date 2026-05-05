import InjectableSvg from '@/components/common/InjectableSvg'
import Link from 'next/link'

import facebookIcon from '@/assets/img/icons/facebook.svg';
import twitterIcon from '@/assets/img/icons/twitter.svg';
import instagramIcon from '@/assets/img/icons/instagram.svg';
import pinterestIcon from '@/assets/img/icons/pinterest.svg';
import youtubeIcon from "@/assets/img/icons/youtube.svg"

const FooterIcon = () => {
   return (
      <>
         <li><Link href="https://www.facebook.com/" target="_blank"><InjectableSvg src={facebookIcon.src} className="injectable" alt="Facebook" /></Link></li>
         <li><Link href="https://x.com/home" target="_blank"><InjectableSvg src={twitterIcon.src} className="injectable" alt="Twitter" /></Link></li>
         <li><Link href="https://www.instagram.com/" target="_blank"><InjectableSvg src={instagramIcon.src} className="injectable" alt="Instagram" /></Link></li>
         <li><Link href="https://www.pinterest.com/" target="_blank"><InjectableSvg src={pinterestIcon.src} className="injectable" alt="Pinterest" /></Link></li>
         <li><Link href="https://www.youtube.com/" target="_blank"><InjectableSvg src={youtubeIcon.src} className="injectable" alt="youtube" /></Link></li>
      </>
   )
}

export default FooterIcon
