import { services } from "@/data/site";
import { useLang } from "@/context/LanguageContext";

export default function Services() {
  const { t } = useLang();
  return (
    <section
      data-testid="services-section"
      id="services"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-[#e3dcd5] bg-[#ebe5df]/40"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="overline mb-6">{t("services.overline")}</p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#1f444c]">
              {t("services.title")}
            </h2>
          </div>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e3dcd5] border border-[#e3dcd5]">
            {services.map((s) => (
              <div
                key={s.n}
                data-testid={`service-${s.n}`}
                className="bg-[#f1ece9] p-8 md:p-10 group transition-colors hover:bg-[#1f444c]"
              >
                <div className="font-serif text-2xl text-[#a45f1a] group-hover:text-[#f1ece9]/70 transition-colors">
                  {s.n}
                </div>
                <h3 className="mt-8 font-serif text-2xl md:text-3xl text-[#1f444c] group-hover:text-[#f1ece9] transition-colors">
                  {t(`services.${s.key}.title`)}
                </h3>
                <p className="mt-4 text-base text-[#5b6e72] group-hover:text-[#f1ece9]/75 leading-relaxed transition-colors">
                  {t(`services.${s.key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
