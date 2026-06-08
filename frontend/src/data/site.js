// Bilingual content used by sections that aren't yet stored in the DB
// (Services, Experience, Testimonials, Clients/Programmes marquee).
// The `profile` export is a *fallback* for the public site when the API is
// still loading; the live profile is fetched from /api/profile.

export const profile = {
  name: "Andry Ridwan",
  title: "Business Development & SME Growth Mentor",
  title_id: "Mentor Pengembangan Bisnis & Pertumbuhan UKM",
  location: "Maros · South Sulawesi, Indonesia",
  location_id: "Maros · Sulawesi Selatan, Indonesia",
  email: "ndriyconnect@gmail.com",
  phone: "+62 823 4657 3790",
  intro:
    "I help SMEs, EdTech founders and government-backed programmes turn early traction into measurable, fundable businesses across Indonesia.",
  intro_id:
    "Saya membantu UKM, founder EdTech, dan program pemerintah mengubah traksi awal menjadi bisnis yang terukur dan layak didanai di seluruh Indonesia.",
  bio: [],
  bio_id: [],
  stats: [],
  portrait: "",
  instagram: "https://instagram.com/andry_ridwan",
  company_site: "https://turikaleprint.space",
  company_maps:
    "https://www.google.com/maps/place/Turikale+Print/data=!4m2!3m1!1s0x0:0xf34aa0af5aa85dd9?sa=X&ved=1t:2428&ictx=111",
};

export const services = [
  { n: "01", key: "1" },
  { n: "02", key: "2" },
  { n: "03", key: "3" },
  { n: "04", key: "4" },
];

export const experience = [
  {
    role: "Business Assistant — Koperasi Desa Merah Putih",
    role_id: "Pendamping Bisnis — Koperasi Desa Merah Putih",
    org: "Kemenkop RI",
    period: "Oct 2025 — Present",
    period_id: "Okt 2025 — Sekarang",
    note: "Helping village cooperatives run as real businesses.",
    note_id: "Membantu koperasi desa berjalan sebagai bisnis sungguhan.",
  },
  {
    role: "Mentor — TKMP 2024 Programme",
    role_id: "Mentor — Program TKMP 2024",
    org: "Ministry of Manpower × Politeknik STIA LAN Bandung",
    org_id: "Kementerian Ketenagakerjaan × Politeknik STIA LAN Bandung",
    period: "Sep — Dec 2024",
    period_id: "Sep — Des 2024",
    note: "Business funding & mentoring for first-time entrepreneurs.",
    note_id: "Pendanaan bisnis & mentoring untuk wirausaha pemula.",
  },
  {
    role: "Owner",
    role_id: "Pemilik",
    org: "Turikale Print — CV. OPU BARAKATI JAYA",
    period: "Jun 2019 — Present",
    period_id: "Jun 2019 — Sekarang",
    note: "Running a 5-star community print business.",
    note_id: "Menjalankan bisnis cetak komunitas dengan rating 5 bintang.",
  },
  {
    role: "Mentor — Gerakan Nasional 1000 Startup Digital",
    role_id: "Mentor — Gerakan Nasional 1000 Startup Digital",
    org: "Ministry of Communication and Informatics",
    org_id: "Kementerian Komunikasi dan Informatika",
    period: "Oct 2019 — Apr 2020",
    period_id: "Okt 2019 — Apr 2020",
    note: "Guiding founders through validated business plans.",
    note_id: "Memandu founder menyusun rencana bisnis yang tervalidasi.",
  },
  {
    role: "CEO",
    role_id: "CEO",
    org: "AIDU — EdTech Startup",
    org_id: "AIDU — Startup EdTech",
    period: "Jul 2018 — Feb 2020",
    period_id: "Jul 2018 — Feb 2020",
    note: "Built Makassar's first exam-management EdTech.",
    note_id: "Membangun EdTech manajemen ujian pertama di Makassar.",
  },
  {
    role: "CMO",
    role_id: "CMO",
    org: "CV Education Code Solution",
    period: "Aug 2016 — Jan 2018",
    period_id: "Agu 2016 — Jan 2018",
    note: "Marketing strategy for an early EdTech venture.",
    note_id: "Strategi pemasaran untuk usaha EdTech tahap awal.",
  },
  {
    role: "Branch Manager & Master Tutor",
    role_id: "Manajer Cabang & Master Tutor",
    org: "JILC (Tutoring Centre)",
    org_id: "JILC (Bimbel)",
    period: "Jan 2008 — Jul 2017",
    period_id: "Jan 2008 — Jul 2017",
    note: "Led branches and coordinated teaching teams; best-tutor award.",
    note_id: "Memimpin cabang dan mengoordinasikan tim pengajar; penghargaan tutor terbaik.",
  },
];

export const testimonials = [
  {
    quote:
      "Andry rebuilt my business from the ground up — legal entity, books, branding and the first real sales pipeline. Six months in I finally felt like I was running a company, not a side hustle.",
    quote_id:
      "Andry membangun ulang bisnis saya dari nol — badan hukum, pembukuan, branding, dan pipeline penjualan pertama yang nyata. Enam bulan kemudian saya akhirnya merasa benar-benar menjalankan perusahaan, bukan sekadar sampingan.",
    name: "SME Owner",
    name_id: "Pemilik UKM",
    role: "TKMP 2024 cohort, Bandung",
    role_id: "Peserta TKMP 2024, Bandung",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwyfHxjb25maWRlbnQlMjBwcm9mZXNzaW9uYWwlMjBjb3Jwb3JhdGUlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODA4OTY2MDh8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote:
      "As facilitator for our regional cohort, Andry didn't just deliver the curriculum — he stayed close to every founder until the playbook actually worked in their market.",
    quote_id:
      "Sebagai fasilitator kohort regional kami, Andry bukan sekadar menyampaikan materi — ia mendampingi setiap founder hingga playbook itu benar-benar berjalan di pasar mereka.",
    name: "Programme Lead",
    name_id: "Penanggung Jawab Program",
    role: "Gerakan UMKM Jualan Online",
    role_id: "Gerakan UMKM Jualan Online",
    avatar:
      "https://images.unsplash.com/photo-1676989880361-091e12efc056?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwzfHxjb25maWRlbnQlMjBwcm9mZXNzaW9uYWwlMjBjb3Jwb3JhdGUlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODA4OTY2MDh8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote:
      "The merchant onboarding sprint was the smoothest week our team has ever run. 121 merchants live in five days, and the local community has stayed active ever since.",
    quote_id:
      "Sprint onboarding mitra dagang itu menjadi minggu paling mulus yang pernah dijalankan tim kami. 121 mitra aktif dalam lima hari, dan komunitas lokalnya tetap aktif sampai sekarang.",
    name: "Channel Partner",
    name_id: "Mitra Channel",
    role: "Bukalapak × GrabFood — South Sulawesi",
    role_id: "Bukalapak × GrabFood — Sulawesi Selatan",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
];

export const clients = [
  "Kemenkop RI",
  "Ministry of Manpower",
  "Kominfo",
  "Google Gapura Digital",
  "Bukalapak",
  "GrabFood",
  "Bank Indonesia (Bootcamp)",
  "NextDev Academy by Telkomsel (Bootcamp)",
  "AIDU EdTech (Co-founded)",
  "Turikale Print (Owner)",
];
