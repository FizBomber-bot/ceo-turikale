import { clients } from "@/data/site";

export default function ClientMarquee() {
  const row = [...clients, ...clients];
  return (
    <section
      data-testid="client-marquee"
      className="overflow-hidden border-b border-[#e5e1d8] py-10 bg-[#fdfbf7]"
    >
      <div className="flex marquee-track gap-16 whitespace-nowrap">
        {row.map((c, i) => (
          <div
            key={i}
            className="font-serif text-3xl md:text-4xl tracking-tight text-[#141517]/80"
          >
            {c}
            <span className="text-[#7a2d2a]">.</span>
          </div>
        ))}
      </div>
    </section>
  );
}
