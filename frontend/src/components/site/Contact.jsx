import { useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { submitContact, cvDownloadUrl } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";

const initial = { name: "", email: "", company: "", subject: "", message: "" };

export default function Contact() {
  const { profile } = useProfile();
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k) => (e) => {
    setData((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!data.name || data.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Please enter a valid email.";
    if (!data.message || data.message.trim().length < 10) e.message = "A short message (10+ chars) helps.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitContact({
        name: data.name.trim(),
        email: data.email.trim(),
        company: data.company.trim() || null,
        subject: data.subject.trim() || null,
        message: data.message.trim(),
      });
      setSuccess(true);
      setData(initial);
      toast.success("Message sent. I'll get back to you within 48 hours.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Something went wrong. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="px-6 md:px-12 lg:px-16 py-24 md:py-32 border-t border-[#e5e1d8]"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          <div className="md:col-span-5">
            <p className="overline mb-6">Get in touch</p>
            <h2 className="font-serif font-light tracking-tight text-4xl md:text-5xl lg:text-6xl leading-[1.0] text-[#141517]">
              Let&rsquo;s build the
              <br />
              next chapter.
            </h2>
            <p className="mt-8 text-base md:text-lg text-[#5e5b55] leading-relaxed max-w-md">
              Open to mentoring, programme facilitation and BD engagements with
              SMEs, EdTech founders and government-backed initiatives. I reply
              within 48 hours.
            </p>

            <div className="mt-12 space-y-4 text-[#141517]">
              <a
                data-testid="contact-email-link"
                href={`mailto:${profile.email}`}
                className="block link-underline font-serif text-2xl md:text-3xl"
              >
                {profile.email}
              </a>
              <a
                data-testid="contact-phone-link"
                href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}
                className="block link-underline text-base"
              >
                {profile.phone}
              </a>
              <a
                data-testid="contact-instagram-link"
                href={profile.instagram || "https://instagram.com/andry_ridwan"}
                target="_blank"
                rel="noopener noreferrer"
                className="block link-underline text-base"
              >
                Instagram — @andry_ridwan
              </a>
              <div className="text-sm text-[#5e5b55] tracking-wide">
                {profile.location}
              </div>
            </div>

            <a
              data-testid="contact-cv-download"
              href={cvDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-12 btn-outline inline-flex items-center gap-3 px-6 py-3.5 text-xs tracking-[0.2em] uppercase"
            >
              Download CV
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="md:col-span-7">
            {success ? (
              <div
                data-testid="contact-success"
                className="border border-[#e5e1d8] bg-[#fdfbf7] p-10 md:p-14"
              >
                <p className="overline mb-6">Message Received</p>
                <h3 className="font-serif text-3xl md:text-4xl text-[#141517] leading-tight">
                  Thank you. I&rsquo;ll be in touch within 48 hours.
                </h3>
                <p className="mt-6 text-base text-[#5e5b55]">
                  In the meantime, feel free to browse the work or download
                  the CV.
                </p>
                <button
                  data-testid="contact-send-another"
                  onClick={() => setSuccess(false)}
                  className="mt-10 btn-outline inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.2em] uppercase"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                data-testid="contact-form"
                onSubmit={submit}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
                noValidate
              >
                <Field
                  id="name"
                  label="Your name"
                  value={data.name}
                  onChange={update("name")}
                  error={errors.name}
                />
                <Field
                  id="email"
                  type="email"
                  label="Email"
                  value={data.email}
                  onChange={update("email")}
                  error={errors.email}
                />
                <Field
                  id="company"
                  label="Company / Organization"
                  value={data.company}
                  onChange={update("company")}
                />
                <Field
                  id="subject"
                  label="Subject"
                  value={data.subject}
                  onChange={update("subject")}
                />
                <div className="md:col-span-2">
                  <Label htmlFor="message">What can I help with?</Label>
                  <textarea
                    id="message"
                    data-testid="contact-input-message"
                    rows={5}
                    value={data.message}
                    onChange={update("message")}
                    className="minimal-input mt-2 w-full bg-transparent border-0 border-b border-[#e5e1d8] py-3 text-base text-[#141517] placeholder:text-[#5e5b55]/60 focus:border-[#141517] resize-none"
                    placeholder="A few lines about the opportunity, timeline and stage."
                  />
                  {errors.message && (
                    <p className="mt-2 text-xs text-[#7a2d2a]" data-testid="error-message">
                      {errors.message}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-4 pt-2">
                  <p className="text-xs text-[#5e5b55] tracking-wide max-w-md">
                    By submitting, you agree to be contacted about your enquiry.
                    No newsletters, ever.
                  </p>
                  <button
                    type="submit"
                    data-testid="contact-submit"
                    disabled={submitting}
                    className="btn-primary inline-flex items-center gap-3 px-7 py-4 text-xs tracking-[0.2em] uppercase disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        Sending <Loader2 size={14} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Send Message <ArrowUpRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Label({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] tracking-[0.22em] uppercase text-[#5e5b55]"
    >
      {children}
    </label>
  );
}

function Field({ id, label, value, onChange, type = "text", error }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        data-testid={`contact-input-${id}`}
        type={type}
        value={value}
        onChange={onChange}
        className="minimal-input mt-2 w-full bg-transparent border-0 border-b border-[#e5e1d8] py-3 text-base text-[#141517] placeholder:text-[#5e5b55]/60 focus:border-[#141517]"
      />
      {error && (
        <p className="mt-2 text-xs text-[#7a2d2a]" data-testid={`error-${id}`}>
          {error}
        </p>
      )}
    </div>
  );
}
