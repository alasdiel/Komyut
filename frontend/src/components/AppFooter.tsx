import footerLogo from "@/assets/footer-logo.svg";
import facebookLogo from "@/assets/facebook-icon.svg";
import githubLogo from "@/assets/github-icon.svg";

export default function Footer() {
  return (
    <footer id="contact" className="bg-komyut-orange text-white px-4 sm:px-6 md:px-8 py-14 relative overflow-hidden">
      {/* Decorative Logo (Responsive watermark style) */}
      <div className="absolute -bottom-65 right-0 w-[300px] sm:w-[340px] md:w-[380px] lg:w-[420px] opacity-100 z-0 pointer-events-none select-none">
        <img
          src={footerLogo}
          alt="Footer Logo"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div>
          <p className="font-epilogue text-sm font-semibold tracking-wide mb-2">© komyut.ph</p>
          <h2 className="font-epilogue font-extrabold text-2xl sm:text-3xl md:text-4xl mb-4">Contact Us!</h2>
          <div className="text-base sm:text-lg font-epilogue tracking-wide space-y-1">
            <p>komyut.ph@gmail.com</p>
            <p>09475505753</p>
            <p>Tugbok, Davao City, 8000 Davao del Sur</p>
          </div>

          {/* Social Icons */}
          <div className="mt-6">
            <p className="font-bold font-epilogue uppercase text-sm mb-2">Follow us</p>
            <div className="flex gap-4">
              <a
                href="https://github.com/alasdiel/Komyut"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <img
                  src={githubLogo}
                  alt="GitHub"
                  className="w-6 h-6 hover:opacity-80 transition"
                />
              </a>
              <a
                href="https://facebook.com/komyutph"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img
                  src={facebookLogo}
                  alt="Facebook"
                  className="w-6 h-6 hover:opacity-80 transition"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
