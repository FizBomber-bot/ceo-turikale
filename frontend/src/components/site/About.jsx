import { useProfile } from "@/hooks/useProfile";

export default function About() {
  const { profile } = useProfile();
  return (
    <section
      id="about"
      data-testid="about-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-4">
            <p className="overline mb-6">About</p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-[#141517]">
              The mentor behind the businesses that grow.
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6 space-y-6">
            {(profile.bio || []).map((p, i) => (
              <p key={i} className="text-base md:text-lg text-[#5e5b55] leading-relaxed">
                {p}
              </p>
            ))}
            <div className="pt-4 flex items-center gap-3 text-xs tracking-[0.18em] uppercase text-[#141517]">
              <span className="h-px w-10 bg-[#7a2d2a]" />
              Based in {profile.location}
            </div>
          </div>
        </div>

        {/* Stats / bento */}
        <div className="mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-12 gap-px bg-[#e5e1d8] border border-[#e5e1d8]">
          {(profile.stats || []).map((s, i, arr) => (
            <div
              key={`${s.label}-${i}`}
              data-testid={`stat-${i}`}
              className={`bg-[#fdfbf7] p-8 md:p-12 ${
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
              <div className="font-serif font-light text-5xl md:text-6xl lg:text-7xl text-[#141517] tracking-tighter">
                {s.value}
              </div>
              <div className="mt-4 text-xs tracking-[0.22em] uppercase text-[#5e5b55]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
