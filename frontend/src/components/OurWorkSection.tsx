const ImageGridTailwind = ({ numberOfPlaceholders = 4 }) => {
  const placeholders = Array.from({ length: numberOfPlaceholders }, (_, i) => (
    <div
      key={i}
      className="w-[160px] h-[160px] bg-gray-200"
    ></div>
  ));

  return (
    <section className="px-6 py-10 max-w-7xl mx-auto">
      <h2 className="text-green-600 font-bold text-lg mb-6">OUR WORK</h2>
      <div className="flex gap-6 flex-wrap">
        {placeholders}
      </div>
    </section>
  );
};

export default ImageGridTailwind;
