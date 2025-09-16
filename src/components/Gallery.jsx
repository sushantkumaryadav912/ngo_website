const images = [
  'https://images.unsplash.com/photo-1549492423-400259a2197a?q=80&w=1887',
  'https://images.unsplash.com/photo-1588955216315-b7337f374744?q=80&w=1887',
  'https://images.unsplash.com/photo-1610484830359-93c44a7edd4c?q=80&w=1964',
  'https://images.unsplash.com/photo-1616183011855-63f25633457a?q=80&w=1887',
  'https://images.unsplash.com/photo-1576495199933-3176717f2238?q=80&w=1934',
  'https://images.unsplash.com/photo-1608682570935-2632b85a3c63?q=80&w=1887',
];

const Gallery = () => {
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800">Moments of Joy</h2>
          <p className="mt-4 text-lg text-gray-600">
            A glimpse into the happy and vibrant life at Suryoday.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg group">
              <img
                src={src}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;

