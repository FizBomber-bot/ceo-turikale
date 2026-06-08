import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { fetchCategories, fetchCaseStudies } from "@/lib/api";
import CaseStudyDialog from "./CaseStudyDialog";

export default function Gallery() {
  const [active, setActive] = useState("all");
  const [openId, setOpenId] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["case-studies", active],
    queryFn: () => fetchCaseStudies(active),
  });

  const selected = items.find((i) => i.id === openId) || null;

  return (
    <section
      id="work"
      data-testid="gallery-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-[#e5e1d8]"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-7">
            <p className="overline mb-6">Selected Work</p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#141517]">
              Six engagements from
              <br />
              the last decade.
            </h2>
          </div>
          <div className="md:col-span-5 md:flex md:items-end">
            <p className="text-base md:text-lg text-[#5e5b55] leading-relaxed">
              Each engagement is documented with the actual problem, the
              approach taken and the metric that mattered. Filter by capability
              below.
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div
          data-testid="filter-row"
          className="flex flex-wrap gap-x-8 gap-y-4 mb-14 border-b border-[#e5e1d8] pb-6"
        >
          {categories.map((c) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                data-testid={`filter-${c.id}`}
                onClick={() => setActive(c.id)}
                className={`group inline-flex items-baseline gap-2 text-sm tracking-wide transition-colors ${
                  isActive ? "text-[#7a2d2a]" : "text-[#141517]"
                }`}
              >
                <span
                  className={`border-b-2 pb-1 transition-colors ${
                    isActive
                      ? "border-[#7a2d2a]"
                      : "border-transparent group-hover:border-[#141517]"
                  }`}
                >
                  {c.label}
                </span>
                <span className="text-[10px] tabular-nums text-[#5e5b55]">
                  ({c.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-20">
          {isLoading && (
            <div
              className="md:col-span-12 text-[#5e5b55] text-sm"
              data-testid="gallery-loading"
            >
              Loading work&hellip;
            </div>
          )}

          {!isLoading &&
            items.map((cs, i) => {
              const spans = [
                "md:col-span-7",
                "md:col-span-5",
                "md:col-span-5 md:col-start-2",
                "md:col-span-6",
                "md:col-span-8",
                "md:col-span-4",
              ];
              const heights = [
                "aspect-[4/3]",
                "aspect-[3/4]",
                "aspect-[4/3]",
                "aspect-[5/4]",
                "aspect-[16/10]",
                "aspect-[4/5]",
              ];
              return (
                <article
                  key={cs.id}
                  data-testid={`case-card-${cs.id}`}
                  className={`${spans[i % spans.length]} group cursor-pointer`}
                  onClick={() => setOpenId(cs.id)}
                >
                  <div
                    className={`relative w-full ${heights[i % heights.length]} overflow-hidden bg-[#dcd6cc]`}
                  >
                    <img
                      src={cs.cover_image}
                      alt={cs.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#fdfbf7]/90 backdrop-blur-sm text-[10px] tracking-[0.22em] uppercase text-[#141517]">
                      {cs.year}
                    </div>
                  </div>
                  <div className="mt-6 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="overline mb-2">
                        {categoryLabel(cs.category, categories)}
                      </div>
                      <h3 className="font-serif text-2xl md:text-3xl text-[#141517] tracking-tight leading-tight">
                        {cs.title}
                      </h3>
                      <p className="mt-3 text-[#5e5b55] text-base leading-relaxed">
                        {cs.subtitle}
                      </p>
                    </div>
                    <div className="shrink-0 mt-1 transition-transform duration-300 group-hover:rotate-45 group-hover:text-[#7a2d2a]">
                      <ArrowUpRight size={22} />
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      <CaseStudyDialog
        caseStudy={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setOpenId(null)}
      />
    </section>
  );
}

function categoryLabel(id, cats) {
  return cats.find((c) => c.id === id)?.label ?? id;
}
