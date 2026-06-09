import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload, LogOut, Save, ExternalLink, Trash2 } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  adminGetProfile,
  adminUpdateProfile,
  adminListCaseStudies,
  adminUpdateCaseStudy,
  adminCreateCaseStudy,
  adminDeleteCaseStudy,
  adminListContacts,
  adminDeleteContact,
  uploadImage,
  uploadCv,
  assetUrl,
  formatApiError,
  cvDownloadUrl,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { id: "photos", label: "Photos & CV" },
  { id: "profile", label: "Profile" },
  { id: "case-studies", label: "Case Studies" },
  { id: "messages", label: "Messages" },
];

const CATEGORY_OPTIONS = [
  { id: "strategic-partnerships", label: "Strategic Partnerships" },
  { id: "enterprise-sales", label: "Enterprise Sales" },
  { id: "market-expansion", label: "Market Expansion" },
  { id: "client-success", label: "Client Success" },
  { id: "gtm-strategy", label: "GTM Strategy" },
];

export default function AdminDashboard() {
  const { user, checked, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("photos");

  if (checked && !user) return <Navigate to="/admin/login" replace />;

  return (
    <main data-testid="admin-dashboard" className="min-h-screen bg-[#f1ece9]">
      <header className="border-b border-[#e3dcd5] bg-[#f1ece9] sticky top-0 z-30 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-4 flex items-center justify-between gap-6">
          <div className="font-serif text-xl md:text-2xl">
            Admin<span className="text-[#a45f1a]">.</span>
            <span className="ml-2 text-xs tracking-[0.22em] uppercase text-[#5b6e72]">
              Andry Ridwan Portfolio
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="admin-open-public"
              className="text-xs tracking-[0.18em] uppercase link-underline inline-flex items-center gap-2"
            >
              View site <ExternalLink size={12} />
            </a>
            <button
              data-testid="admin-logout"
              onClick={async () => {
                await logout();
                navigate("/admin/login", { replace: true });
              }}
              className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-xs tracking-[0.18em] uppercase"
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-[1400px] px-6 md:px-10 flex gap-8 pb-2 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                data-testid={`admin-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`text-sm pb-3 border-b-2 transition-colors whitespace-nowrap ${
                  active ? "border-[#a45f1a] text-[#a45f1a]" : "border-transparent text-[#1f444c] hover:border-[#1f444c]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <section className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
        {tab === "photos" && <PhotosTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "case-studies" && <CaseStudiesTab />}
        {tab === "messages" && <MessagesTab />}
      </section>
    </main>
  );
}

// ------------- Reusable controls -------------
function SectionHeader({ overline, title, description }) {
  return (
    <div className="mb-10">
      <p className="overline mb-3">{overline}</p>
      <h2 className="font-serif font-light text-3xl md:text-4xl text-[#1f444c] tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-[#5b6e72] max-w-2xl">{description}</p>
      )}
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.22em] uppercase text-[#5b6e72]">
        {label}
      </span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-[#f1ece9] border border-[#e3dcd5] px-3 py-2.5 text-sm text-[#1f444c] focus:outline-none focus:border-[#1f444c]"
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4, placeholder }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.22em] uppercase text-[#5b6e72]">
        {label}
      </span>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="mt-2 w-full bg-[#f1ece9] border border-[#e3dcd5] px-3 py-2.5 text-sm text-[#1f444c] focus:outline-none focus:border-[#1f444c] resize-y"
      />
    </label>
  );
}

// ------------- Photos & CV Tab -------------
function PhotosTab() {
  const qc = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["admin-profile"], queryFn: adminGetProfile });
  const { data: cases = [] } = useQuery({
    queryKey: ["admin-case-studies"],
    queryFn: adminListCaseStudies,
  });

  const setPortrait = useMutation({
    mutationFn: (url) => adminUpdateProfile({ portrait: url }),
    onSuccess: () => {
      toast.success("Hero portrait updated. Refresh the public site to see it.");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  const setCover = useMutation({
    mutationFn: ({ id, payload }) => adminUpdateCaseStudy(id, payload),
    onSuccess: () => {
      toast.success("Cover image updated.");
      qc.invalidateQueries({ queryKey: ["admin-case-studies"] });
      qc.invalidateQueries({ queryKey: ["case-studies", "all"] });
      qc.invalidateQueries({ queryKey: ["case-studies"] });
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  return (
    <>
      <SectionHeader
        overline="Photos & CV"
        title="Update your hero portrait, case study covers and CV PDF."
        description="Upload images up to 8 MB (JPG, PNG, WEBP). PDF up to 12 MB."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Hero portrait */}
        <div className="lg:col-span-5">
          <p className="overline mb-4">Hero portrait</p>
          <ImageUploader
            currentUrl={profile?.portrait}
            aspect="aspect-[4/5]"
            testId="portrait"
            onUploaded={(url) => setPortrait.mutate(url)}
          />
        </div>

        {/* CV */}
        <div className="lg:col-span-7">
          <p className="overline mb-4">CV (PDF)</p>
          <CvUploader />
        </div>
      </div>

      <div className="mt-16 border-t border-[#e3dcd5] pt-10">
        <p className="overline mb-4">Case study covers</p>
        <p className="text-sm text-[#5b6e72] mb-8 max-w-2xl">
          Each cover is the image that appears for that engagement in the
          gallery. Recommended ratio: landscape, around 1400×900.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cases.map((cs) => (
            <div key={cs.id} data-testid={`cover-card-${cs.id}`}>
              <ImageUploader
                currentUrl={cs.cover_image}
                aspect="aspect-[4/3]"
                testId={`cover-${cs.id}`}
                onUploaded={(url) =>
                  setCover.mutate({
                    id: cs.id,
                    payload: { ...stripUnknown(cs), cover_image: url },
                  })
                }
              />
              <div className="mt-3">
                <div className="text-xs tracking-[0.18em] uppercase text-[#a45f1a]">
                  {cs.year}
                </div>
                <div className="font-serif text-lg text-[#1f444c] leading-tight mt-1">
                  {cs.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function stripUnknown(cs) {
  const {
    title,
    title_id,
    subtitle,
    subtitle_id,
    category,
    year,
    cover_image,
    summary,
    summary_id,
    challenge,
    challenge_id,
    approach,
    approach_id,
    outcomes,
    outcomes_id,
    metrics,
    client,
    tags,
    sort_order,
  } = cs;
  return {
    title,
    title_id: title_id || "",
    subtitle: subtitle || "",
    subtitle_id: subtitle_id || "",
    category,
    year: year || "",
    cover_image: cover_image || "",
    summary: summary || "",
    summary_id: summary_id || "",
    challenge: challenge || "",
    challenge_id: challenge_id || "",
    approach: approach || [],
    approach_id: approach_id || [],
    outcomes: outcomes || [],
    outcomes_id: outcomes_id || [],
    metrics: (metrics || []).map((m) => ({ label: m.label, value: m.value })),
    client: client || "",
    tags: tags || [],
    sort_order: sort_order ?? 0,
  };
}

function ImageUploader({ currentUrl, aspect = "aspect-[4/3]", onUploaded, testId }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [override, setOverride] = useState(null);
  const preview = override ?? currentUrl ?? "";

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image too large (max 8 MB)");
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadImage(file);
      setOverride(url);
      onUploaded(url);
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <div className={`relative ${aspect} w-full overflow-hidden bg-[#e3dcd5] border border-[#e3dcd5]`}>
        {preview ? (
          <img src={assetUrl(preview)} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs tracking-[0.22em] uppercase text-[#5b6e72]">
            No image yet
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-[#f1ece9]/70 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#1f444c]" size={24} />
          </div>
        )}
      </div>
      <button
        type="button"
        data-testid={`upload-${testId}`}
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="btn-outline mt-4 inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
      >
        <Upload size={14} /> Replace
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        data-testid={`upload-input-${testId}`}
      />
    </div>
  );
}

function CvUploader() {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [stamp, setStamp] = useState(() => Date.now());

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      toast.error("PDF too large (max 12 MB)");
      return;
    }
    setBusy(true);
    try {
      await uploadCv(file);
      setStamp(Date.now());
      toast.success("CV updated. Public Download CV button now serves the new file.");
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail) || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="border border-[#e3dcd5] bg-[#f1ece9] p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl text-[#1f444c]">CV PDF</h3>
          <p className="mt-2 text-sm text-[#5b6e72] max-w-md">
            The public <code className="text-[#1f444c]">/api/cv</code> endpoint
            serves whatever file you upload here. Replace anytime.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`${cvDownloadUrl}?t=${stamp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-[0.18em] uppercase link-underline inline-flex items-center gap-2"
            data-testid="cv-preview-link"
          >
            Preview current <ExternalLink size={12} />
          </a>
          <button
            type="button"
            data-testid="upload-cv"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
          >
            {busy ? (
              <>
                Uploading <Loader2 size={14} className="animate-spin" />
              </>
            ) : (
              <>
                Replace CV <Upload size={14} />
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onChange}
            data-testid="upload-cv-input"
          />
        </div>
      </div>
    </div>
  );
}

// ------------- Profile Tab -------------
function ProfileTab() {
  const { data: profile } = useQuery({ queryKey: ["admin-profile"], queryFn: adminGetProfile });
  if (!profile) return <p className="text-sm text-[#5b6e72]">Loading profile…</p>;
  return <ProfileForm key={profile.name + "-" + (profile.bio || []).length} initial={profile} />;
}

function ProfileForm({ initial }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => deepCopyProfile(initial));

  const save = useMutation({
    mutationFn: (data) => adminUpdateProfile(data),
    onSuccess: () => {
      toast.success("Profile saved.");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateBio = (key, i, v) =>
    setForm((f) => ({ ...f, [key]: (f[key] || []).map((p, idx) => (idx === i ? v : p)) }));
  const addBio = (key) =>
    setForm((f) => ({ ...f, [key]: [...(f[key] || []), ""] }));
  const removeBio = (key, i) =>
    setForm((f) => ({ ...f, [key]: (f[key] || []).filter((_, idx) => idx !== i) }));
  const updateStat = (i, field, v) =>
    setForm((f) => ({
      ...f,
      stats: f.stats.map((s, idx) => (idx === i ? { ...s, [field]: v } : s)),
    }));
  const addStat = () =>
    setForm((f) => ({ ...f, stats: [...(f.stats || []), { label: "", label_id: "", value: "" }] }));
  const removeStat = (i) =>
    setForm((f) => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }));

  return (
    <>
      <SectionHeader
        overline="Profile"
        title="The text the public site reads (English + Bahasa)."
        description="Both languages are stored side by side; if a Bahasa field is empty the public site falls back to English."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <TextField label="Name" value={form.name} onChange={(v) => update("name", v)} />
        <TextField label="Email" value={form.email} onChange={(v) => update("email", v)} />
        <TextField label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
        <TextField label="Instagram URL" value={form.instagram} onChange={(v) => update("instagram", v)} />
        <TextField label="Company website" value={form.company_site} onChange={(v) => update("company_site", v)} />
        <TextField label="Google Maps URL" value={form.company_maps} onChange={(v) => update("company_maps", v)} />
      </div>

      <BilingualText
        labelEn="Title (EN)" labelId="Title (ID — Bahasa)"
        valueEn={form.title} valueId={form.title_id}
        onEn={(v) => update("title", v)} onId={(v) => update("title_id", v)}
      />
      <BilingualText
        labelEn="Location (EN)" labelId="Location (ID — Bahasa)"
        valueEn={form.location} valueId={form.location_id}
        onEn={(v) => update("location", v)} onId={(v) => update("location_id", v)}
      />
      <BilingualArea
        labelEn="Intro (EN)" labelId="Intro (ID — Bahasa)"
        valueEn={form.intro} valueId={form.intro_id}
        onEn={(v) => update("intro", v)} onId={(v) => update("intro_id", v)}
        rows={3}
      />

      <BilingualParagraphs
        title="Bio paragraphs"
        en={form.bio || []}
        id={form.bio_id || []}
        onAdd={(k) => addBio(k)}
        onUpdate={(k, i, v) => updateBio(k, i, v)}
        onRemove={(k, i) => removeBio(k, i)}
      />

      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <p className="overline">Headline stats</p>
          <button
            type="button"
            onClick={addStat}
            className="text-xs tracking-[0.18em] uppercase link-underline"
          >
            + Add stat
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.stats.map((s, i) => (
            <div key={i} className="flex items-end gap-3 border border-[#e3dcd5] p-4 bg-[#f1ece9]">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <TextField label="Value" value={s.value} onChange={(v) => updateStat(i, "value", v)} />
                <TextField label="Label (EN)" value={s.label} onChange={(v) => updateStat(i, "label", v)} />
                <TextField label="Label (ID)" value={s.label_id || ""} onChange={(v) => updateStat(i, "label_id", v)} />
              </div>
              <button
                type="button"
                onClick={() => removeStat(i)}
                className="p-2 text-[#a45f1a] hover:text-[#1f444c]"
                aria-label="Remove stat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        data-testid="profile-save"
        onClick={() => save.mutate(form)}
        disabled={save.isPending}
        className="btn-primary inline-flex items-center gap-3 px-6 py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
      >
        {save.isPending ? (
          <>Saving <Loader2 size={14} className="animate-spin" /></>
        ) : (
          <>Save profile <Save size={14} /></>
        )}
      </button>
    </>
  );
}

function deepCopyProfile(p) {
  return {
    name: p.name || "",
    title: p.title || "",
    title_id: p.title_id || "",
    location: p.location || "",
    location_id: p.location_id || "",
    email: p.email || "",
    phone: p.phone || "",
    intro: p.intro || "",
    intro_id: p.intro_id || "",
    bio: [...(p.bio || [])],
    bio_id: [...(p.bio_id || [])],
    stats: (p.stats || []).map((s) => ({ label: s.label || "", label_id: s.label_id || "", value: s.value || "" })),
    portrait: p.portrait || "",
    instagram: p.instagram || "",
    company_site: p.company_site || "",
    company_maps: p.company_maps || "",
  };
}

function BilingualText({ labelEn, labelId, valueEn, valueId, onEn, onId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <TextField label={labelEn} value={valueEn} onChange={onEn} />
      <TextField label={labelId} value={valueId} onChange={onId} />
    </div>
  );
}

function BilingualArea({ labelEn, labelId, valueEn, valueId, onEn, onId, rows = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <TextArea label={labelEn} value={valueEn} onChange={onEn} rows={rows} />
      <TextArea label={labelId} value={valueId} onChange={onId} rows={rows} />
    </div>
  );
}

function BilingualParagraphs({ title, en, id, onAdd, onUpdate, onRemove }) {
  const rows = Math.max(en.length, id.length);
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <p className="overline">{title}</p>
        <div className="flex gap-4 text-xs tracking-[0.18em] uppercase">
          <button type="button" onClick={() => onAdd("bio")} className="link-underline">
            + EN paragraph
          </button>
          <button type="button" onClick={() => onAdd("bio_id")} className="link-underline">
            + ID paragraph
          </button>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ParagraphCell
              label={`EN — Paragraph ${i + 1}`}
              value={en[i]}
              empty={i >= en.length}
              onChange={(v) => onUpdate("bio", i, v)}
              onRemove={() => onRemove("bio", i)}
            />
            <ParagraphCell
              label={`ID — Paragraf ${i + 1}`}
              value={id[i]}
              empty={i >= id.length}
              onChange={(v) => onUpdate("bio_id", i, v)}
              onRemove={() => onRemove("bio_id", i)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ParagraphCell({ label, value, empty, onChange, onRemove }) {
  if (empty) {
    return (
      <div className="border border-dashed border-[#e3dcd5] p-4 text-xs text-[#5b6e72] italic">
        ({label.startsWith("ID") ? "Bahasa version" : "English version"} not yet provided)
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <TextArea label={label} value={value || ""} onChange={onChange} rows={4} />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="mt-7 p-2 text-[#a45f1a] hover:text-[#1f444c]"
        aria-label="Remove"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

// ------------- Case Studies Tab -------------
function CaseStudiesTab() {
  const qc = useQueryClient();
  const { data: cases = [] } = useQuery({
    queryKey: ["admin-case-studies"],
    queryFn: adminListCaseStudies,
  });
  const [editingId, setEditingId] = useState(null);

  const create = useMutation({
    mutationFn: () =>
      adminCreateCaseStudy({
        title: "New case study",
        title_id: "",
        subtitle: "",
        subtitle_id: "",
        category: "strategic-partnerships",
        year: "",
        cover_image: "",
        summary: "",
        summary_id: "",
        challenge: "",
        challenge_id: "",
        approach: [],
        approach_id: [],
        outcomes: [],
        outcomes_id: [],
        metrics: [],
        client: "",
        tags: [],
        sort_order: ((cases[cases.length - 1] || {}).sort_order || 0) + 10,
      }),
    onSuccess: (cs) => {
      toast.success("New case study created.");
      qc.invalidateQueries({ queryKey: ["admin-case-studies"] });
      qc.invalidateQueries({ queryKey: ["case-studies"] });
      setEditingId(cs.id);
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  const remove = useMutation({
    mutationFn: (id) => adminDeleteCaseStudy(id),
    onSuccess: () => {
      toast.success("Case study deleted.");
      qc.invalidateQueries({ queryKey: ["admin-case-studies"] });
      qc.invalidateQueries({ queryKey: ["case-studies"] });
      setEditingId(null);
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  const active = cases.find((c) => c.id === editingId) || null;

  return (
    <>
      <SectionHeader
        overline="Case Studies"
        title="Edit, add or remove engagements."
        description="Each case study appears in the gallery and opens in a dialog when clicked."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-4 space-y-2">
          <button
            type="button"
            data-testid="case-create"
            onClick={() => create.mutate()}
            disabled={create.isPending}
            className="w-full btn-primary inline-flex items-center justify-center gap-2 px-4 py-3 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
          >
            + Add new case study
          </button>
          <ul className="mt-4 divide-y divide-[#e3dcd5] border border-[#e3dcd5]">
            {cases.map((cs) => (
              <li key={cs.id}>
                <button
                  type="button"
                  data-testid={`case-pick-${cs.id}`}
                  onClick={() => setEditingId(cs.id)}
                  className={`w-full text-left p-4 transition-colors ${
                    editingId === cs.id ? "bg-[#f1ece9]" : "hover:bg-[#f1ece9]"
                  }`}
                >
                  <div className="text-[10px] tracking-[0.22em] uppercase text-[#a45f1a]">
                    {cs.year || "—"} · {CATEGORY_OPTIONS.find((o) => o.id === cs.category)?.label || cs.category}
                  </div>
                  <div className="font-serif text-base text-[#1f444c] mt-1 leading-tight">
                    {cs.title}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="lg:col-span-8">
          {active ? (
            <CaseStudyEditor
              key={active.id}
              caseStudy={active}
              onDelete={() => {
                if (window.confirm("Delete this case study? This cannot be undone.")) {
                  remove.mutate(active.id);
                }
              }}
            />
          ) : (
            <div className="border border-[#e3dcd5] p-10 text-center text-[#5b6e72]">
              <p className="overline mb-3">No case study selected</p>
              <p className="text-sm">Pick one from the list to start editing, or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CaseStudyEditor({ caseStudy, onDelete }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => stripUnknown(caseStudy));

  const save = useMutation({
    mutationFn: (data) => adminUpdateCaseStudy(caseStudy.id, data),
    onSuccess: () => {
      toast.success("Case study saved.");
      qc.invalidateQueries({ queryKey: ["admin-case-studies"] });
      qc.invalidateQueries({ queryKey: ["case-studies"] });
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  const u = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updateList = (k, i, v) =>
    setForm((f) => ({ ...f, [k]: f[k].map((x, idx) => (idx === i ? v : x)) }));
  const addList = (k, val = "") =>
    setForm((f) => ({ ...f, [k]: [...(f[k] || []), val] }));
  const removeList = (k, i) =>
    setForm((f) => ({ ...f, [k]: f[k].filter((_, idx) => idx !== i) }));
  const updateMetric = (i, field, v) =>
    setForm((f) => ({ ...f, metrics: f.metrics.map((m, idx) => (idx === i ? { ...m, [field]: v } : m)) }));

  return (
    <div className="border border-[#e3dcd5] p-6 md:p-8 bg-[#f1ece9]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TextField label="Client / Organisation" value={form.client} onChange={(v) => u("client", v)} />
        <label className="block">
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#5b6e72]">Category</span>
          <select
            value={form.category}
            onChange={(e) => u("category", e.target.value)}
            className="mt-2 w-full bg-[#f1ece9] border border-[#e3dcd5] px-3 py-2.5 text-sm text-[#1f444c] focus:outline-none focus:border-[#1f444c]"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </label>
        <TextField label="Year" value={form.year} onChange={(v) => u("year", v)} placeholder="2024 or 2018 — 2020" />
        <TextField label="Sort order (lower = earlier)" type="number" value={form.sort_order} onChange={(v) => u("sort_order", parseInt(v) || 0)} />
        <div className="md:col-span-2">
          <TextField label="Cover image URL" value={form.cover_image} onChange={(v) => u("cover_image", v)} placeholder="/api/uploads/... or https://..." />
        </div>
      </div>

      <div className="mt-6 mb-2 overline">Title</div>
      <BilingualText
        labelEn="Title (EN)" labelId="Title (ID — Bahasa)"
        valueEn={form.title} valueId={form.title_id}
        onEn={(v) => u("title", v)} onId={(v) => u("title_id", v)}
      />
      <div className="overline mb-2">Subtitle</div>
      <BilingualText
        labelEn="Subtitle (EN)" labelId="Subtitle (ID — Bahasa)"
        valueEn={form.subtitle} valueId={form.subtitle_id}
        onEn={(v) => u("subtitle", v)} onId={(v) => u("subtitle_id", v)}
      />
      <div className="overline mb-2">Summary</div>
      <BilingualArea
        labelEn="Summary (EN)" labelId="Summary (ID — Bahasa)"
        valueEn={form.summary} valueId={form.summary_id}
        onEn={(v) => u("summary", v)} onId={(v) => u("summary_id", v)}
        rows={3}
      />
      <div className="overline mb-2">Challenge</div>
      <BilingualArea
        labelEn="Challenge (EN)" labelId="Challenge (ID — Bahasa)"
        valueEn={form.challenge} valueId={form.challenge_id}
        onEn={(v) => u("challenge", v)} onId={(v) => u("challenge_id", v)}
        rows={4}
      />

      <BilingualList
        title="Approach steps"
        enItems={form.approach}
        idItems={form.approach_id}
        onUpdate={(k, i, v) => updateList(k, i, v)}
        onAdd={(k) => addList(k, "")}
        onRemove={(k, i) => removeList(k, i)}
        keys={{ en: "approach", id: "approach_id" }}
      />

      <BilingualList
        title="Outcomes"
        enItems={form.outcomes}
        idItems={form.outcomes_id}
        onUpdate={(k, i, v) => updateList(k, i, v)}
        onAdd={(k) => addList(k, "")}
        onRemove={(k, i) => removeList(k, i)}
        keys={{ en: "outcomes", id: "outcomes_id" }}
      />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="overline">Metrics</p>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, metrics: [...f.metrics, { label: "", value: "" }] }))}
            className="text-xs tracking-[0.18em] uppercase link-underline"
          >
            + Add metric
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {form.metrics.map((m, i) => (
            <div key={i} className="flex items-end gap-2 border border-[#e3dcd5] p-3 bg-white">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <TextField label="Value" value={m.value} onChange={(v) => updateMetric(i, "value", v)} />
                <TextField label="Label" value={m.label} onChange={(v) => updateMetric(i, "label", v)} />
              </div>
              <button
                type="button"
                onClick={() => removeList("metrics", i)}
                className="p-2 text-[#a45f1a] hover:text-[#1f444c]"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="overline">Tags</p>
          <button
            type="button"
            onClick={() => addList("tags", "")}
            className="text-xs tracking-[0.18em] uppercase link-underline"
          >
            + Add tag
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.tags.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={t}
                onChange={(e) => updateList("tags", i, e.target.value)}
                className="bg-[#f1ece9] border border-[#e3dcd5] px-3 py-1.5 text-xs"
              />
              <button
                type="button"
                onClick={() => removeList("tags", i)}
                className="text-[#a45f1a] hover:text-[#1f444c]"
                aria-label="Remove tag"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={onDelete}
          data-testid={`case-delete-${caseStudy.id}`}
          className="text-xs tracking-[0.2em] uppercase text-[#a45f1a] hover:text-[#1f444c] inline-flex items-center gap-2"
        >
          <Trash2 size={14} /> Delete
        </button>
        <button
          type="button"
          data-testid={`case-save-${caseStudy.id}`}
          onClick={() => save.mutate(form)}
          disabled={save.isPending}
          className="btn-primary inline-flex items-center gap-3 px-6 py-3.5 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
        >
          {save.isPending ? (
            <>Saving <Loader2 size={14} className="animate-spin" /></>
          ) : (
            <>Save changes <Save size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function ListEditor({ title, items, onChange, onAdd, onRemove }) {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <p className="overline">{title}</p>
        <button
          type="button"
          onClick={onAdd}
          className="text-xs tracking-[0.18em] uppercase link-underline"
        >
          + Add item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-[10px] tabular-nums mt-3 text-[#a45f1a]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <textarea
              value={it}
              onChange={(e) => onChange(i, e.target.value)}
              rows={2}
              className="flex-1 bg-[#f1ece9] border border-[#e3dcd5] px-3 py-2 text-sm resize-y focus:outline-none focus:border-[#1f444c]"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="mt-2 p-2 text-[#a45f1a] hover:text-[#1f444c]"
              aria-label="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BilingualList({ title, enItems, idItems, onUpdate, onAdd, onRemove, keys }) {
  return (
    <div className="mt-8 border-t border-[#e3dcd5] pt-6">
      <p className="overline mb-3">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ListEditor
          title="English"
          items={enItems || []}
          onChange={(i, v) => onUpdate(keys.en, i, v)}
          onAdd={() => onAdd(keys.en)}
          onRemove={(i) => onRemove(keys.en, i)}
        />
        <ListEditor
          title="Bahasa Indonesia"
          items={idItems || []}
          onChange={(i, v) => onUpdate(keys.id, i, v)}
          onAdd={() => onAdd(keys.id)}
          onRemove={(i) => onRemove(keys.id, i)}
        />
      </div>
    </div>
  );
}

// ------------- Messages Tab -------------
function MessagesTab() {
  const qc = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: adminListContacts,
  });

  const remove = useMutation({
    mutationFn: (id) => adminDeleteContact(id),
    onSuccess: () => {
      toast.success("Message deleted.");
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: (e) => toast.error(formatApiError(e?.response?.data?.detail)),
  });

  return (
    <>
      <SectionHeader
        overline="Messages"
        title="Inbound enquiries from the contact form."
      />

      {isLoading && <p className="text-sm text-[#5b6e72]">Loading messages…</p>}

      {!isLoading && items.length === 0 && (
        <div className="border border-[#e3dcd5] p-10 text-center text-[#5b6e72]">
          No messages yet.
        </div>
      )}

      <div className="space-y-4">
        {items.map((m) => (
          <article key={m.id} data-testid={`message-${m.id}`} className="border border-[#e3dcd5] p-6 bg-[#f1ece9]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-serif text-xl text-[#1f444c]">{m.name}</div>
                <div className="text-xs text-[#5b6e72] mt-1 tracking-wide">
                  <a href={`mailto:${m.email}`} className="link-underline">{m.email}</a>
                  {m.company && <> · {m.company}</>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.22em] uppercase text-[#5b6e72]">
                  {new Date(m.created_at).toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this message?")) remove.mutate(m.id);
                  }}
                  className="p-2 text-[#a45f1a] hover:text-[#1f444c]"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {m.subject && (
              <div className="mt-4 text-sm font-medium text-[#1f444c]">
                {m.subject}
              </div>
            )}
            <p className="mt-3 text-[#1f444c] text-base leading-relaxed whitespace-pre-wrap">
              {m.message}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
