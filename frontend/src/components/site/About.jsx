import { useProfile } from "@/hooks/useProfile";
import { useLang } from "@/context/LanguageContext";
import { pickLang } from "@/i18n/strings";

export default function About() {
  const { profile } = useProfile();
  const { t, lang } = useLang();
  const bio = pickLang(profile.bio, profile.bio_id, lang) || [];
  const location = pickLang(profile.location, profile.location_id, lang);

  return (
    <section
      id="about"
      data-testid="about-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <p className="overline mb-6">{t("about.overline")}</p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#1f444c]">
              {t("about.title")}
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6 space-y-6">
            {(Array.isArray(bio) ? bio : []).map((p, i) => (
              <p key={i} className="text-base md:text-lg text-[#5b6e72] leading-relaxed">
                {p}
              </p>
            ))}
            <div className="pt-4 flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[#1f444c]">
              <span className="h-px w-10 bg-[#a45f1a]" />
              {t("about.basedIn")} {location}
            </div>
          </div>
        </div>

        {/* Stats / bento */}
        <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-12 gap-px bg-[#e3dcd5] border border-[#e3dcd5]">
          {(profile.stats || []).map((s, i, arr) => {
            const label = pickLang(s.label, s.label_id, lang);
            return (
              <div
                key={`${s.label}-${i}`}
                data-testid={`stat-${i}`}
                className={`bg-[#f1ece9] p-8 md:p-12 ${
                  arr.length === 4
                    ? i === 0
                      ? "md:col-span-5"
                      : i === 1
                      ? "md:col-span-3"
                      : i === 2
                      ? "md:col-span-4"
                      : "md:col-span-12"
                    : `md:col-span-${Math.max(3, Math.floor(12 / arr.length))}`
                }`}
              >
                <div className="font-serif font-light text-5xl md:text-6xl lg:text-7xl text-[#1f444c] tracking-tighter">
                  {s.value}
                </div>
                <div className="mt-4 text-xs tracking-[0.22em] uppercase text-[#5b6e72]">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
