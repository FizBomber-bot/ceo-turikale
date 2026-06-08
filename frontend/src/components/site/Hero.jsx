import { ArrowDownRight, Download } from "lucide-react";
import { profile } from "@/data/site";
import { cvDownloadUrl } from "@/lib/api";

export default function Hero() {
  const go = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      data-testid="hero-section"
      className="relative pt-32 md:pt-40 pb-24 md:pb-32 px-6 md:px-12 lg:px-16 overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end">
          <div className="lg:col-span-7 reveal">
            <p className="overline mb-8" data-testid="hero-overline">
              Portfolio — 2012 / 2025
            </p>
            <h1
              className="font-serif font-light tracking-tighter leading-[0.95] text-[#141517]
                text-[3.4rem] sm:text-7xl md:text-8xl lg:text-[8.5rem]"
              data-testid="hero-name"
            >
              Alex
              <br />
              Morgan<span className="text-[#7a2d2a]">.</span>
            </h1>
            <p
              className="mt-10 max-w-xl text-base md:text-lg text-[#5e5b55] leading-relaxed"
              data-testid="hero-intro"
            >
              {profile.intro}
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <a
                href={cvDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-download-cv"
                className="btn-primary inline-flex items-center gap-3 px-6 py-3.5 text-xs tracking-[0.2em] uppercase"
              >
                Download CV
                <Download size={14} />
              </a>
              <button
                onClick={() => go("work")}
                data-testid="hero-view-work"
                className="btn-outline inline-flex items-center gap-3 px-6 py-3.5 text-xs tracking-[0.2em] uppercase"
              >
                View Work
                <ArrowDownRight size={14} />
              </button>
            </div>

            <div className="mt-16 flex items-center gap-6 text-xs tracking-[0.18em] uppercase text-[#5e5b55]">
              <span>{profile.location}</span>
              <span className="h-px w-10 bg-[#e5e1d8]" />
              <span>{profile.title}</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative reveal" style={{ animationDelay: "180ms" }}>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={profile.portrait}
                alt="Alex Morgan portrait"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-[#e5e1d8] pointer-events-none" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block">
              <div className="bg-[#fdfbf7] px-5 py-4 border border-[#e5e1d8]">
                <div className="text-[10px] tracking-[0.22em] uppercase text-[#7a2d2a]">
                  Available
                </div>
                <div className="font-serif text-xl text-[#141517] mt-1">
                  Q1 / Q2 2026
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 md:mt-32 border-t border-[#e5e1d8] pt-8">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <p className="overline">Selected Clients</p>
            <p className="text-xs text-[#5e5b55] tracking-wide">8 of 200+ engagements</p>
          </div>
        </div>
      </div>
    </section>
  );
}
