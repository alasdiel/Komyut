function AboutSection() {
  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto md:text-left">
        <h2 className="font-epilogue text-komyut-green font-extrabold uppercase text-lg tracking-wider mb-4">
          About Us
        </h2>
        <p className="font-epilogue tracking-wider text-komyut-grey md:text-lg leading-relaxed">
          Komyut is a Davao-based initiative that helps commuters navigate the city’s jeepney system with
          ease and confidence. We’re building a platform that provides clear, accurate fare estimates and
          route options, so whether you’re a student heading to class or a worker commuting daily, <strong>you’ll
          know exactly how much to pay and which jeepney to ride.</strong>
          <br /><br />
          Our mission is to solve fare confusion, promote commuter awareness, and support a more organized
          public transport experience. No more guessing. No more overpaying. With Komyut, Davao jeepney
          commuting becomes simple, smart, and stress-free.
        </p>
      </div>
    </section>
  );
}

export default AboutSection;
