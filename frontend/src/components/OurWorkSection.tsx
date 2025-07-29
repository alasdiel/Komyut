const ImageGridTailwind = ({ numberOfPlaceholders = 4 }) => {
  const placeholders = Array.from({ length: numberOfPlaceholders }, (_, i) => (
    <div
      key={i}
      className="aspect-square bg-gray-200 rounded-md w-full"
    ></div>
  ));

  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto text-center md:text-left">
        <h2 className="text-green-700 font-bold uppercase text-lg tracking-wider mb-4">OUR WORK</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {placeholders}
        </div>
      </div>
    </section>
  );
};

export default ImageGridTailwind;
