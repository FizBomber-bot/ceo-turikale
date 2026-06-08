import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function CaseStudyDialog({ caseStudy, open, onOpenChange }) {
  if (!caseStudy) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="case-study-dialog"
        className="max-w-[1100px] w-[95vw] max-h-[92vh] overflow-y-auto p-0 bg-[#fdfbf7] border border-[#e5e1d8] rounded-none"
      >
        <DialogTitle className="sr-only">{caseStudy.title}</DialogTitle>
        <div className="relative">
          <div className="aspect-[16/8] w-full overflow-hidden bg-[#dcd6cc]">
            <img
              src={caseStudy.cover_image}
              alt={caseStudy.title}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            data-testid="case-study-close"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 bg-[#fdfbf7]/90 border border-[#e5e1d8] hover:bg-[#141517] hover:text-[#fdfbf7] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8 md:p-14 lg:p-16">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs tracking-[0.2em] uppercase text-[#5e5b55] mb-6">
            <span className="text-[#7a2d2a]">{caseStudy.year}</span>
            <span className="h-px w-8 bg-[#e5e1d8]" />
            <span>{caseStudy.client}</span>
          </div>

          <h2 className="font-serif font-light tracking-tight text-3xl md:text-5xl lg:text-6xl text-[#141517] leading-[1.05]">
            {caseStudy.title}
          </h2>
          <p className="mt-6 max-w-3xl text-lg md:text-xl text-[#5e5b55] leading-relaxed font-serif italic">
            {caseStudy.subtitle}
          </p>

          {/* Metrics row */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e5e1d8] border border-[#e5e1d8]">
            {caseStudy.metrics.map((m) => (
              <div key={m.label} className="bg-[#fdfbf7] p-6">
                <div className="font-serif font-light text-4xl md:text-5xl text-[#141517]">
                  {m.value}
                </div>
                <div className="mt-2 overline">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <p className="overline mb-3">The Challenge</p>
            </div>
            <div className="md:col-span-8">
              <p className="text-base md:text-lg text-[#5e5b55] leading-relaxed">
                {caseStudy.challenge}
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-t border-[#e5e1d8] pt-12">
            <div className="md:col-span-4">
              <p className="overline mb-3">The Approach</p>
            </div>
            <ol className="md:col-span-8 space-y-5">
              {caseStudy.approach.map((step, i) => (
                <li key={i} className="flex gap-5">
                  <span className="font-serif text-2xl text-[#7a2d2a] leading-none tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="text-base md:text-lg text-[#141517] leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-t border-[#e5e1d8] pt-12">
            <div className="md:col-span-4">
              <p className="overline mb-3">The Outcome</p>
            </div>
            <ul className="md:col-span-8 space-y-4">
              {caseStudy.outcomes.map((o, i) => (
                <li key={i} className="flex gap-4 text-base md:text-lg text-[#141517] leading-relaxed">
                  <span className="mt-2.5 h-1.5 w-1.5 bg-[#7a2d2a] shrink-0" />
                  {o}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 pt-8 border-t border-[#e5e1d8] flex flex-wrap gap-3">
            {caseStudy.tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase border border-[#e5e1d8] text-[#5e5b55]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
