import { useProfile } from "@/hooks/useProfile";

export default function Footer() {
  const { profile } = useProfile();
  return (
    <footer
      data-testid="site-footer"
      className="px-6 md:px-12 lg:px-16 pt-16 pb-10 bg-[#141517] text-[#fdfbf7]/80"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#fdfbf7]/15">
          <div className="md:col-span-5">
            <div className="font-serif text-3xl md:text-4xl text-[#fdfbf7]">
              {profile.name}<span className="text-[#c9a08e]">.</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-[#fdfbf7]/65 leading-relaxed">
              {profile.title} — supporting SMEs, EdTech founders and
              government-backed programmes across Indonesia.
            </p>
          </div>
          <div className="md:col-span-3">
            <p className="overline mb-4" style={{ color: "#c9a08e" }}>
              Contact
            </p>
            <a
              data-testid="footer-email"
              href={`mailto:${profile.email}`}
              className="block text-[#fdfbf7] link-underline"
            >
              {profile.email}
            </a>
            <a
              data-testid="footer-phone"
              href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}
              className="block text-sm mt-2 text-[#fdfbf7]/70 link-underline"
            >
              {profile.phone}
            </a>
          </div>
          <div className="md:col-span-4">
            <p className="overline mb-4" style={{ color: "#c9a08e" }}>
              Elsewhere
            </p>
            <ul className="space-y-2 text-[#fdfbf7]/85">
              <li>
                <a
                  data-testid="footer-turikale-site"
                  href={profile.company_site || "https://turikaleprint.space"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Turikale Print — turikaleprint.space
                </a>
              </li>
              <li>
                <a
                  data-testid="footer-turikale-maps"
                  href={profile.company_maps || "https://www.google.com/maps/place/Turikale+Print/data=!4m2!3m1!1s0x0:0xf34aa0af5aa85dd9?sa=X&ved=1t:2428&ictx=111"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Turikale Print on Google Maps
                </a>
              </li>
              <li>
                <a
                  data-testid="footer-instagram"
                  href={profile.instagram || "https://instagram.com/andry_ridwan"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  Instagram — @andry_ridwan
                </a>
              </li>
              <li>
                <a
                  data-testid="footer-admin"
                  href="/admin"
                  className="link-underline"
                >
                  Admin sign in
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-[#fdfbf7]/55 tracking-wide">
          <span data-testid="footer-copyright">
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </span>
          <span>Portfolio · {profile.location}</span>
        </div>
      </div>
    </footer>
  );
}
