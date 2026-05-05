import InjectableSvg from '@/components/common/InjectableSvg'
import Link from 'next/link'

import facebookIcon from '@/assets/img/icons/facebook.svg';
import twitterIcon from '@/assets/img/icons/twitter.svg';
import instagramIcon from '@/assets/img/icons/instagram.svg';
import pinterestIcon from '@/assets/img/icons/pinterest.svg';

const Icon = () => {
   return (
      <>
         <li><Link href="https://www.facebook.com/" target="_blank"><InjectableSvg src={facebookIcon.src} className="injectable" alt="Facebook" /></Link></li>
         <li><Link href="https://x.com/home" target="_blank"><InjectableSvg src={twitterIcon.src} className="injectable" alt="Twitter" /></Link></li>
         <li><Link href="https://www.instagram.com/" target="_blank"><InjectableSvg src={instagramIcon.src} className="injectable" alt="Instagram" /></Link></li>
         <li><Link href="https://www.pinterest.com/" target="_blank"><InjectableSvg src={pinterestIcon.src} className="injectable" alt="Pinterest" /></Link></li>
      </>
   )
}

export default Icon
