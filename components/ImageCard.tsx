import React from 'react';
import { DownloadIcon } from './icons/DownloadIcon';

interface ImageCardProps {
  src: string;
  onImageClick: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ src, onImageClick }) => {
    const handleDownload = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation(); // Prevent the modal from opening when downloading
    };
    
  return (
    <div 
        className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer shadow-lg transform transition-transform duration-300 hover:scale-105"
        onClick={onImageClick}
    >
      <img src={src} alt="Generated pose" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
        <a
          href={src}
          download={`generated_pose_${Date.now()}.png`}
          onClick={handleDownload}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 p-4 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30"
          aria-label="Download image"
        >
          <DownloadIcon />
        </a>
      </div>
    </div>
  );
};