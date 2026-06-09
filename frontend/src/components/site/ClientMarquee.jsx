import { clients } from "@/data/site";

export default function ClientMarquee() {
  const row = [...clients, ...clients];
  return (
    <section
      data-testid="client-marquee"
      className="overflow-hidden border-b border-[#e3dcd5] py-10 bg-[#f1ece9]"
    >
      <div className="flex marquee-track gap-16 whitespace-nowrap">
        {row.map((c, i) => (
          <div
            key={i}
            className="font-serif text-3xl md:text-4xl tracking-tight text-[#1f444c]/80"
          >
            {c}
            <span className="text-[#a45f1a]">.</span>
          </div>
        ))}
      </div>
    </section>
  );
}
