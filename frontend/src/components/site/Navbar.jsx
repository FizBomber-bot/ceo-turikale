import { useEffect, useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { cvDownloadUrl } from "@/lib/api";
import { useLang } from "@/context/LanguageContext";

export default function Navbar() {
  const { t, lang, toggleLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    { id: "work", label: t("nav.work") },
    { id: "about", label: t("nav.about") },
    { id: "experience", label: t("nav.experience") },
    { id: "contact", label: t("nav.contact") },
  ];

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
          ? "bg-[#f1ece9]/80 backdrop-blur-xl border-b border-[#e3dcd5]"
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
            Andry<span className="text-[#a45f1a]">.</span>Ridwan
          </button>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <button
                key={l.id}
                data-testid={`nav-link-${l.id}`}
                onClick={() => go(l.id)}
                className="text-sm tracking-wide text-[#1f444c] link-underline"
              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              data-testid="nav-lang-toggle"
              onClick={toggleLang}
              aria-label={t("lang.label")}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs tracking-[0.18em] uppercase border border-[#e3dcd5] hover:border-[#1f444c] transition-colors"
              title={`${t("lang.label")}: ${lang.toUpperCase()}`}
            >
              <Globe size={12} />
              <span className="tabular-nums">{lang === "en" ? "EN" : "ID"}</span>
              <span className="text-[#5b6e72]">/</span>
              <span className="text-[#5b6e72]">{lang === "en" ? "ID" : "EN"}</span>
            </button>
            <a
              data-testid="nav-cv-download"
              href={cvDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
            >
              {t("nav.cv")}
            </a>
            <button
              data-testid="nav-contact-cta"
              onClick={() => go("contact")}
              className="btn-primary px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
            >
              {t("nav.getInTouch")}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              data-testid="nav-lang-toggle-mobile"
              onClick={toggleLang}
              aria-label={t("lang.label")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] tracking-[0.18em] uppercase border border-[#e3dcd5]"
            >
              <Globe size={11} />
              {lang === "en" ? "EN" : "ID"}
            </button>
            <button
              data-testid="nav-mobile-toggle"
              className="p-2 -mr-2"
              onClick={() => setOpen((v) => !v)}
              aria-label={t("nav.toggle")}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-8 pt-2 border-t border-[#e3dcd5]">
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
                  {t("nav.downloadCv")}
                </a>
                <button
                  data-testid="nav-mobile-contact"
                  onClick={() => go("contact")}
                  className="btn-primary px-5 py-2.5 text-xs tracking-[0.18em] uppercase"
                >
                  {t("nav.contact")}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
