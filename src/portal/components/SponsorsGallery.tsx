import React from 'react';
import { Sponsor } from '../data/sponsors';
import ScrollingGallery from './ui/ScrollingGallery';

interface SponsorsGalleryProps {
  sponsors: Sponsor[];
  showTitle?: boolean;
}

const SponsorsGallery: React.FC<SponsorsGalleryProps> = ({ sponsors, showTitle = true }) => {
  // Convert sponsors to scrolling gallery items
  const sponsorItems = sponsors.map(sponsor => ({
    id: sponsor.name,
    image: sponsor.logo,
    name: sponsor.name,
    website: sponsor.website
  }));

  return (
    <ScrollingGallery
      items={sponsorItems}
      title="Partners"
      showTitle={showTitle}
      speed={2.0} // Moderate speed for good visibility
      height="h-27"
      itemWidth="w-50" // Larger width for better visibility
      grayscale={false} // Show original colors
      spacing={35} // Consistent spacing between all logos
    />
  );
};

export default SponsorsGallery; 