
import React, { useState } from 'react';
import { ImageCard } from './ImageCard';

interface ImageGridProps {
  images: string[];
}

const Modal: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div className="relative max-w-4xl max-h-4xl p-4" onClick={e => e.stopPropagation()}>
                <img src={src} alt="Enlarged pose" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};


export const ImageGrid: React.FC<ImageGridProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const openModal = (src: string) => {
        setSelectedImage(src);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {images.map((src, index) => (
                    <ImageCard 
                        key={index} 
                        src={src} 
                        onImageClick={() => openModal(src)}
                    />
                ))}
            </div>
            {selectedImage && <Modal src={selectedImage} onClose={closeModal} />}
        </>
    );
};
