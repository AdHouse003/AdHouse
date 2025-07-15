/*
  src/components/ImageGallery.js
  -----------------------------
  This component displays a gallery of images for an ad or organization.
  - Shows thumbnails and allows users to view images in a larger format
  - Handles image navigation and selection
  - Used as a child component in ad and organization detail pages
*/

import React, { useState } from 'react';

const ImageGallery = ({ images }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index) => {
    setCurrentImage(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const previousImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Gallery ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => openModal(index)}
          />
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="relative max-w-6xl mx-auto p-4">
            {/* Navigation Buttons */}
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
              onClick={previousImage}
            >
              ‹
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300"
              onClick={nextImage}
            >
              ›
            </button>

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={closeModal}
            >
              ×
            </button>

            {/* Image */}
            <img
              src={images[currentImage]}
              alt={`Full size ${currentImage + 1}`}
              className="max-h-[90vh] max-w-full object-contain mx-auto"
            />

            {/* Image Counter */}
            <div className="text-white text-center mt-4">
              {currentImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery; 