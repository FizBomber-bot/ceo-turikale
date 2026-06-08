import { useState } from "react";
import { testimonials } from "@/data/site";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

export default function Testimonials() {
  const [i, setI] = useState(0);
  const t = testimonials[i];
  const next = () => setI((p) => (p + 1) % testimonials.length);
  const prev = () => setI((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      data-testid="testimonials-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-[#e5e1d8] bg-[#141517] text-[#fdfbf7]"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <p className="overline mb-6" style={{ color: "#c9a08e" }}>
              Endorsements
            </p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
              From founders, CROs and the board room.
            </h2>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <Quote className="text-[#7a2d2a]" size={42} />
            <blockquote
              data-testid={`testimonial-${i}`}
              className="mt-8 font-serif text-2xl md:text-3xl lg:text-4xl leading-[1.25] font-light"
            >
              {t.quote}
            </blockquote>
            <div className="mt-10 flex items-center gap-5">
              <div className="h-14 w-14 overflow-hidden ring-1 ring-[#fdfbf7]/20">
                <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-serif text-xl">{t.name}</div>
                <div className="text-sm text-[#fdfbf7]/65 tracking-wide">{t.role}</div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4">
              <button
                data-testid="testimonial-prev"
                onClick={prev}
                className="h-12 w-12 border border-[#fdfbf7]/30 inline-flex items-center justify-center hover:bg-[#fdfbf7] hover:text-[#141517] transition-colors"
                aria-label="Previous testimonial"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                data-testid="testimonial-next"
                onClick={next}
                className="h-12 w-12 border border-[#fdfbf7]/30 inline-flex items-center justify-center hover:bg-[#fdfbf7] hover:text-[#141517] transition-colors"
                aria-label="Next testimonial"
              >
                <ArrowRight size={18} />
              </button>
              <div className="ml-3 text-xs tracking-[0.22em] uppercase text-[#fdfbf7]/60 tabular-nums">
                {String(i + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
