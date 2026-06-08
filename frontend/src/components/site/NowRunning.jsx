import { ExternalLink, MapPin } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

export default function NowRunning() {
  const { profile } = useProfile();
  const site = profile.company_site || "https://turikaleprint.space";
  const maps = profile.company_maps || "https://www.google.com/maps/place/Turikale+Print/data=!4m2!3m1!1s0x0:0xf34aa0af5aa85dd9?sa=X&ved=1t:2428&ictx=111";
  return (
    <section
      data-testid="now-running-section"
      className="px-6 md:px-12 lg:px-16 py-16 md:py-24 border-t border-[#e5e1d8] bg-[#fdfbf7]"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <p className="overline mb-5">Currently Running</p>
            <h2 className="font-serif font-light tracking-tight text-3xl md:text-4xl lg:text-5xl leading-[1.05] text-[#141517]">
              Turikale Print<span className="text-[#7a2d2a]">.</span>
            </h2>
            <p className="mt-4 text-sm tracking-wide text-[#5e5b55]">
              CV. OPU BARAKATI JAYA · Maros, South Sulawesi
            </p>
          </div>

          <div className="md:col-span-4">
            <p className="text-base md:text-lg text-[#5e5b55] leading-relaxed">
              A community-anchored print &amp; creative service business I have
              run since 2019 — with a 5-star Google rating and 3,715+ profile
              views. Visit the website or drop by on Google Maps.
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 md:items-end">
            <a
              data-testid="turikale-website-button"
              href={site}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-between gap-3 px-5 py-3.5 text-xs tracking-[0.2em] uppercase w-full md:w-auto md:min-w-[260px]"
            >
              <span>Visit turikaleprint.space</span>
              <ExternalLink size={14} />
            </a>
            <a
              data-testid="turikale-maps-button"
              href={maps}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center justify-between gap-3 px-5 py-3.5 text-xs tracking-[0.2em] uppercase w-full md:w-auto md:min-w-[260px]"
            >
              <span>View on Google Maps</span>
              <MapPin size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
