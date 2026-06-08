import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cvDownloadUrl } from "@/lib/api";

const links = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#fdfbf7]/80 backdrop-blur-xl border-b border-[#e5e1d8]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          <button
            data-testid="nav-logo"
            onClick={() => go("hero")}
            className="font-serif text-xl md:text-2xl tracking-tight"
          >
            Alex<span className="text-[#7a2d2a]">.</span>Morgan
          </button>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-link-${l.id}`}
                onClick={() => go(l.id)}
                className="text-sm tracking-wide text-[#141517] link-underline"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              data-testid="nav-cv-download"
              href={cvDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
            >
              CV
            </a>
            <button
              data-testid="nav-contact-cta"
              onClick={() => go("contact")}
              className="btn-primary px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
            >
              Get in touch
            </button>
          </div>

          <button
            data-testid="nav-mobile-toggle"
            className="md:hidden p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-8 pt-2 border-t border-[#e5e1d8]">
            <nav className="flex flex-col gap-5 pt-6">
              {links.map((l) => (
                <button
                  key={l.id}
                  data-testid={`nav-mobile-${l.id}`}
                  onClick={() => go(l.id)}
                  className="text-left font-serif text-3xl"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex gap-3 pt-4">
                <a
                  data-testid="nav-mobile-cv"
                  href={cvDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
                >
                  Download CV
                </a>
                <button
                  data-testid="nav-mobile-contact"
                  onClick={() => go("contact")}
                  className="btn-primary px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
                >
                  Contact
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
