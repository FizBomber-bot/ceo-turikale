import { useState } from "react";
import { testimonials } from "@/data/site";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { pickLang } from "@/i18n/strings";

export default function Testimonials() {
  const { t, lang } = useLang();
  const [i, setI] = useState(0);
  const tItem = testimonials[i];
  const next = () => setI((p) => (p + 1) % testimonials.length);
  const prev = () => setI((p) => (p - 1 + testimonials.length) % testimonials.length);

  const quote = pickLang(tItem.quote, tItem.quote_id, lang);
  const name = pickLang(tItem.name, tItem.name_id, lang);
  const role = pickLang(tItem.role, tItem.role_id, lang);

  return (
    <section
      data-testid="testimonials-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-[#e3dcd5] bg-[#1f444c] text-[#f1ece9]"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="overline mb-6" style={{ color: "#d49b5a" }}>
              {t("test.overline")}
            </p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
              {t("test.title")}
            </h2>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <Quote className="text-[#a45f1a]" size={42} />
            <blockquote
              data-testid={`testimonial-${i}`}
              className="mt-8 font-serif text-2xl md:text-3xl lg:text-4xl leading-[1.25] font-light"
            >
              {quote}
            </blockquote>
            <div className="mt-10 flex items-center gap-5">
              <div className="h-14 w-14 overflow-hidden ring-1 ring-[#f1ece9]/20">
                <img src={tItem.avatar} alt={name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-serif text-xl">{name}</div>
                <div className="text-sm text-[#f1ece9]/65 tracking-wide">{role}</div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <button
                data-testid="testimonial-prev"
                onClick={prev}
                className="h-12 w-12 border border-[#f1ece9]/30 inline-flex items-center justify-center hover:bg-[#f1ece9] hover:text-[#1f444c] transition-colors"
                aria-label={t("test.prev")}
              >
                <ArrowLeft size={18} />
              </button>
              <button
                data-testid="testimonial-next"
                onClick={next}
                className="h-12 w-12 border border-[#f1ece9]/30 inline-flex items-center justify-center hover:bg-[#f1ece9] hover:text-[#1f444c] transition-colors"
                aria-label={t("test.next")}
              >
                <ArrowRight size={18} />
              </button>
              <div className="ml-3 text-xs tracking-[0.22em] uppercase text-[#f1ece9]/60 tabular-nums">
                {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
