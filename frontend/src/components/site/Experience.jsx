import { experience } from "@/data/site";

export default function Experience() {
  return (
    <section
      id="experience"
      data-testid="experience-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-5">
            <p className="overline mb-6">Experience</p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#141517]">
              From classroom
              <br />
              to cooperatives.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:flex md:items-end">
            <p className="text-base md:text-lg text-[#5e5b55] leading-relaxed">
              Seventeen years across tutoring, EdTech leadership, SME
              facilitation and national government programmes — every chapter
              compounding into the next.
            </p>
          </div>
        </div>

        <div className="border-t border-[#141517]">
          {experience.map((e, i) => (
            <div
              key={i}
              data-testid={`exp-${i}`}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 py-8 md:py-10 border-b border-[#e5e1d8] group hover:bg-[#fdfbf7] transition-colors"
            >
              <div className="md:col-span-2 text-xs tracking-[0.18em] uppercase text-[#5e5b55] pt-1">
                {e.period}
              </div>
              <div className="md:col-span-5">
                <h3 className="font-serif text-2xl md:text-3xl text-[#141517] tracking-tight">
                  {e.role}
                </h3>
              </div>
              <div className="md:col-span-3 text-base text-[#141517] pt-1">
                {e.org}
              </div>
              <div className="md:col-span-2 text-sm text-[#5e5b55] pt-1.5 italic font-serif">
                {e.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
