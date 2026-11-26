import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Gift,
  Heart,
  MapPin,
  Menu,
  Music2,
  Sparkles,
  X,
} from "lucide-react";
import { galleryPhotos, wedding } from "./data/wedding";

type FamilySide = "groom" | "bride";
type RSVPState = "idle" | "sending" | "success" | "error";

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
const groomTemplate = import.meta.env.VITE_EMAILJS_GROOM_TEMPLATE_ID as
  | string
  | undefined;
const brideTemplate = import.meta.env.VITE_EMAILJS_BRIDE_TEMPLATE_ID as
  | string
  | undefined;

function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`botanical ${className}`}
      viewBox="0 0 180 180"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 157C53 125 54 75 135 19"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M53 119C23 116 17 94 20 80C42 81 57 96 53 119Z"
        fill="currentColor"
        opacity=".24"
      />
      <path
        d="M77 87C73 59 90 44 106 39C113 60 99 81 77 87Z"
        fill="currentColor"
        opacity=".22"
      />
      <path
        d="M111 51C106 29 121 13 137 9C145 28 131 47 111 51Z"
        fill="currentColor"
        opacity=".2"
      />
      <path
        d="M42 139C40 117 54 105 68 102C75 120 62 136 42 139Z"
        fill="currentColor"
        opacity=".18"
      />
      <circle cx="142" cy="23" r="3" fill="currentColor" />
      <circle cx="26" cy="75" r="2" fill="currentColor" />
    </svg>
  );
}

function Divider({ label }: { label?: string }) {
  return (
    <div className="ornament-divider">
      <span />
      {label ? <em>{label}</em> : <i>✦</i>}
      <span />
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const target = new Date(wedding.date).getTime();
  const diff = Math.max(0, target - now);
  const values = [
    ["Days", Math.floor(diff / 86400000)],
    ["Hours", Math.floor((diff / 3600000) % 24)],
    ["Minutes", Math.floor((diff / 60000) % 60)],
    ["Seconds", Math.floor((diff / 1000) % 60)],
  ] as const;
  if (diff === 0)
    return (
      <p className="countdown-after">
        Today is the day! Let the celebrations begin.
      </p>
    );
  return (
    <div className="countdown-grid">
      {values.map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Envelope({
  onOpen,
  isOpening,
}: {
  onOpen: () => void;
  isOpening: boolean;
}) {
  return (
    <motion.main
      className="envelope-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.7 }}
    >
      <div className="envelope-backdrop">
        <span className="backdrop-leaf leaf-one">✿</span>
        <span className="backdrop-leaf leaf-two">✧</span>
        <span className="backdrop-leaf leaf-three">❀</span>
      </div>
      <div className="envelope-intro">
        <span className="eyebrow">A LITTLE SOMETHING SPECIAL</span>
        <h1>
          With love, <i>for you</i>
        </h1>
        <p>
          A wedding invitation from
          <br />
          Aashish & Arushi
        </p>
      </div>
      <motion.button
        className="envelope"
        onClick={onOpen}
        disabled={isOpening}
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Open wedding invitation"
      >
        <div className="envelope-paper">
          <div className="paper-arch">
            <span className="ganesh-mini">ॐ</span>
            <small>॥ श्री गणेशाय नमः ॥</small>
            <span className="paper-invite">
              You are cordially
              <br />
              invited to the wedding of
            </span>
            <strong>
              Aashish <b>&</b> Arushi
            </strong>
            <small>12 DECEMBER 2026</small>
          </div>
        </div>
        <div className="envelope-flap" />
        <div className="envelope-front-left" />
        <div className="envelope-front-right" />
        <div className="envelope-front-bottom" />
        <div className="wax-seal">
          <span>A</span>
          <i>♥</i>
          <span>A</span>
        </div>
        <div className="envelope-sprig sprig-left">
          ✿<br />❧
        </div>
        <div className="envelope-sprig sprig-right">
          ❧<br />✿
        </div>
      </motion.button>
      <motion.button
        className="open-prompt"
        onClick={onOpen}
        disabled={isOpening}
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown size={15} /> TAP TO OPEN INVITATION
      </motion.button>
      <span className="envelope-footnote">
        A celebration of love, family & togetherness
      </span>
    </motion.main>
  );
}

function RSVPSection() {
  const [status, setStatus] = useState<RSVPState>("idle");
  const [side, setSide] = useState<FamilySide>("groom");
  const [attendance, setAttendance] = useState("Yes, happily!");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    guests: "2",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const ready = Boolean(
    serviceId && publicKey && groomTemplate && brideTemplate,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (honeypot) return;
    if (
      !form.name.trim() ||
      !/^[+\d][\d\s()-]{7,16}$/.test(form.phone.trim())
    ) {
      setError("Please enter your name and a valid mobile number.");
      return;
    }
    if (!ready) {
      setError(
        "EmailJS is not configured yet. Please add the four VITE_EMAILJS values in your .env file.",
      );
      return;
    }
    setStatus("sending");
    const templateId = side === "groom" ? groomTemplate! : brideTemplate!;
    const params = {
      guest_name: form.name.trim(),
      guest_phone: form.phone.trim(),
      family_side: side === "groom" ? "Groom's Side" : "Bride's Side",
      attendance,
      guest_count: attendance.startsWith("Yes") ? form.guests : "0",
      personal_message: form.message.trim() || "No message",
      wedding_couple: "Aashish Khullar & Arushi Sachdeva",
      wedding_date: "12 December 2026",
      submitted_at: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    };
    try {
      await emailjs.send(serviceId!, templateId, params, {
        publicKey: publicKey!,
      });
      setStatus("success");
    } catch (err) {
      console.error("RSVP email failed:", err);
      setStatus("error");
      setError(
        "We could not send your RSVP just now. Please try again in a moment.",
      );
    }
  }

  return (
    <section className="section rsvp-section" id="rsvp">
      <Botanical className="rsvp-leaf left" />
      <Botanical className="rsvp-leaf right" />
      <div className="section-inner narrow">
        <span className="eyebrow">KINDLY REPLY</span>
        <h2>
          Will you <i>join us?</i>
        </h2>
        <p className="section-subtitle">
          Your presence would make our celebration even more special. Let us
          know if you'll be joining us.
        </p>
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              className="success-card"
              key="success"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="success-icon">
                <Check size={28} />
              </div>
              <h3>Thank you, {form.name.split(" ")[0]}!</h3>
              <p>
                Your response has been sent. We can't wait to celebrate with
                you.
              </p>
              <button
                className="text-button"
                onClick={() => {
                  setStatus("idle");
                  setForm({ name: "", phone: "", guests: "2", message: "" });
                }}
              >
                Submit another response
              </button>
            </motion.div>
          ) : (
            <motion.form
              className="rsvp-form"
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="form-row">
                <label>
                  YOUR NAME
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  MOBILE NUMBER
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>
              <fieldset>
                <legend>WHICH FAMILY ARE YOU JOINING?</legend>
                <div className="side-choice">
                  <button
                    type="button"
                    className={side === "groom" ? "selected" : ""}
                    onClick={() => setSide("groom")}
                  >
                    <span className="choice-monogram">A</span>
                    <span>Groom's side</span>
                  </button>
                  <button
                    type="button"
                    className={side === "bride" ? "selected" : ""}
                    onClick={() => setSide("bride")}
                  >
                    <span className="choice-monogram">A</span>
                    <span>Bride's side</span>
                  </button>
                </div>
              </fieldset>
              <fieldset>
                <legend>WILL YOU BE ATTENDING?</legend>
                <div className="attendance-choice">
                  {["Yes, happily!", "Sorry, can’t make it"].map((value) => (
                    <button
                      type="button"
                      key={value}
                      className={attendance === value ? "selected" : ""}
                      onClick={() => setAttendance(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
              {attendance.startsWith("Yes") && (
                <label>
                  NUMBER OF GUESTS
                  <select
                    value={form.guests}
                    onChange={(e) =>
                      setForm({ ...form, guests: e.target.value })
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "guest" : "guests"}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                A LITTLE NOTE (OPTIONAL)
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Leave us a message..."
                />
              </label>
              <input
                className="hp-field"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-primary submit-button"
                disabled={status === "sending"}
                type="submit"
              >
                {status === "sending" ? "SENDING YOUR RSVP…" : "SEND MY RSVP"}{" "}
                <ArrowRight size={16} />
              </button>
              <p className="privacy-note">
                Your response will be sent to the{" "}
                {side === "groom" ? "groom's" : "bride's"} family.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function App() {
  const [opened, setOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const photos = useMemo(() => galleryPhotos, []);
  const [storyIndex, setStoryIndex] = useState(0);
  const storyPhotos = [photos[0], photos[1], photos[2]];
  const musicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;

    music
      .play()
      .then(() => setMusicPlaying(true))
      .catch(() => {
        // Most browsers require a user interaction before unmuted audio can play.
        setMusicPlaying(false);
      });
  }, []);

  function openInvitation() {
    if (isOpening) return;
    setIsOpening(true);
    window.scrollTo({ top: 0, behavior: "auto" });

    const music = musicRef.current;
    if (music) {
      music
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    }

    window.setTimeout(() => {
      setOpened(true);
      setIsOpening(false);
      window.requestAnimationFrame(() => {
        // The hero is the first section after the sticky header. Resetting the
        // document is more reliable than scrolling to an element during its mount.
        window.scrollTo({ top: 0, behavior: "auto" });
      });
    }, 1450);
  }
  function replay() {
    musicRef.current?.pause();
    setMusicPlaying(false);
    setOpened(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function toggleMusic() {
    const music = musicRef.current;
    if (!music) return;
    if (music.paused) {
      music
        .play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    } else {
      music.pause();
      setMusicPlaying(false);
    }
  }
  function scrollTo(id: string) {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
  function movePhoto(direction: number) {
    if (activePhoto === null) return;
    setActivePhoto((activePhoto + direction + photos.length) % photos.length);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (activePhoto !== null && e.key === "Escape") setActivePhoto(null);
      if (activePhoto !== null && e.key === "ArrowRight") movePhoto(1);
      if (activePhoto !== null && e.key === "ArrowLeft") movePhoto(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activePhoto, photos.length]);

  return (
    <>
      <audio
        ref={musicRef}
        src="/audio/wedding-invitation.mp3"
        loop
        autoPlay
        preload="auto"
      />
      <AnimatePresence>
        {!opened && <Envelope onOpen={openInvitation} isOpening={isOpening} />}
      </AnimatePresence>
      <AnimatePresence>
        {isOpening && (
          <motion.div
            className="curtain-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-live="polite"
          >
            <div className="curtain-panel curtain-left" />
            <div className="curtain-panel curtain-right" />
            <div className="curtain-welcome">
              <span>सुस्वागतम्</span>
              <small>Welcome to our celebration of love</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {opened && (
        <motion.div
          className="site"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <header className="site-header">
            <button
              className="brand"
              onClick={() => scrollTo("home")}
              aria-label="Back to top"
            >
              <span>A</span>
              <i>♥</i>
              <span>A</span>
            </button>
            <nav className={menuOpen ? "nav-open" : ""}>
              <button onClick={() => scrollTo("home")}>Home</button>
              <button onClick={() => scrollTo("story")}>Our Story</button>
              <button onClick={() => scrollTo("details")}>The Wedding</button>
              <button onClick={() => scrollTo("gallery")}>Gallery</button>
              <button onClick={() => scrollTo("rsvp")}>RSVP</button>
            </nav>
            <button className="header-rsvp" onClick={() => scrollTo("rsvp")}>
              RSVP <ArrowRight size={14} />
            </button>
            <button
              className="music-toggle"
              onClick={toggleMusic}
              aria-label={
                musicPlaying
                  ? "Pause background music"
                  : "Play background music"
              }
              aria-pressed={musicPlaying}
            >
              <Music2 size={16} />
              <span>{musicPlaying ? "MUSIC ON" : "MUSIC OFF"}</span>
            </button>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </header>

          <main>
            <section className="hero section" id="home">
              <div className="hero-wash" />
              <Botanical className="hero-botanical top-left" />
              <Botanical className="hero-botanical top-right" />
              <div className="hero-content">
                <div className="ganesh-mark">ॐ</div>
                <p className="sanskrit">॥ श्री गणेशाय नमः ॥</p>
                <p className="hero-welcome">शुभविवाहे सुस्वागतम्</p>
                <span className="eyebrow">TOGETHER WITH OUR FAMILIES</span>
                <h1 style={{ marginTop: "50px" }}>
                  <span>Aashish</span>
                  <i>&</i>
                  <span>Arushi</span>
                </h1>
                <div className="hero-rule">
                  <span />✦<span />
                </div>
                <p className="hero-invite">
                  With the blessings of our elders, we joyfully invite you
                  <br className="desktop-break" /> to celebrate the beginning of
                  our forever.
                </p>
                <div className="family-intro">
                  <div>
                    <span>SON OF</span>
                    <strong>Raman Khullar</strong>
                    <small>& Savita Khullar</small>
                  </div>
                  <div className="family-heart">♡</div>
                  <div>
                    <span>DAUGHTER OF</span>
                    <strong>Amaresh Sachdeva</strong>
                    <small>& Manju Sachdeva</small>
                  </div>
                </div>
                <div className="hero-date">
                  <CalendarDays size={18} />
                  <span>12</span>
                  <div>
                    <b>DECEMBER</b>
                    <small>2026 · SATURDAY · 11:00 AM</small>
                  </div>
                </div>
                <button
                  className="scroll-cue"
                  onClick={() => scrollTo("details")}
                >
                  <span style={{ marginTop: "-10px" }}>SCROLL TO EXPLORE</span>
                  <ArrowDown size={15} />
                </button>
              </div>
              <div className="hero-bottom-flower">❀</div>
            </section>

            <section className="section date-section" id="details">
              <div className="section-inner">
                <span className="eyebrow">SAVE THE DATE</span>
                <h2>
                  Counting down to <i>forever</i>
                </h2>
                <Countdown />
                <Divider label="THE WEDDING DAY" />
                <div className="venue-card">
                  <div className="venue-illustration">
                    <div className="arch-line">
                      <span>✧</span>
                      <b>H</b>
                      <small>
                        HERITAGE
                        <br />
                        HAVeli
                      </small>
                    </div>
                    <div className="venue-caption">
                      A day to remember, a place to celebrate
                    </div>
                  </div>
                  <div className="venue-info">
                    <span className="eyebrow">THE CELEBRATION</span>
                    <h3>{wedding.venue}</h3>
                    <p>
                      <MapPin size={15} />
                      {wedding.address}
                    </p>
                    <a
                      className="button button-outline"
                      href={wedding.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      VIEW ON MAPS <ArrowRight size={15} />
                    </a>
                    <p className="timing-note">
                      <Clock3 size={14} /> Ceremony will start by 11:00 AM.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section story-section" id="story">
              <Botanical className="story-leaf" />
              <div className="section-inner story-inner">
                <span className="eyebrow">A LITTLE ABOUT US</span>
                <h2>
                  Two hearts, <i>one journey</i>
                </h2>
                <p className="story-copy">
                  Every beautiful story has its own beginning. Ours is a journey
                  of friendship, love, laughter and countless memories. Now,
                  we're excited to begin our forever together — and we'd love to
                  have you by our side.
                </p>
                <div className="story-photo-wrap">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={storyIndex}
                      src={storyPhotos[storyIndex].src}
                      alt={storyPhotos[storyIndex].alt}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </AnimatePresence>
                  <button
                    className="photo-arrow prev"
                    onClick={() =>
                      setStoryIndex(
                        (storyIndex + storyPhotos.length - 1) %
                          storyPhotos.length,
                      )
                    }
                    aria-label="Previous photo"
                  >
                    <ArrowLeft />
                  </button>
                  <button
                    className="photo-arrow next"
                    onClick={() =>
                      setStoryIndex((storyIndex + 1) % storyPhotos.length)
                    }
                    aria-label="Next photo"
                  >
                    <ArrowRight />
                  </button>
                </div>
                <div className="story-dots">
                  {storyPhotos.map((_, i) => (
                    <button
                      key={i}
                      className={storyIndex === i ? "active" : ""}
                      onClick={() => setStoryIndex(i)}
                      aria-label={`Show story photo ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            <section className="section gallery-section" id="gallery">
              <div className="section-inner">
                <span className="eyebrow">LITTLE MOMENTS, BIG MEMORIES</span>
                <h2>
                  Our <i>gallery</i>
                </h2>
                <p className="section-subtitle">
                  A few moments we'd love to share with you.
                </p>
                <div className="gallery-grid">
                  {photos.map((photo, i) => (
                    <motion.button
                      key={photo.src}
                      className={`gallery-photo ${photo.className}`}
                      onClick={() => setActivePhoto(i)}
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ delay: (i % 3) * 0.08 }}
                    >
                      <img src={photo.src} alt={photo.alt} loading="lazy" />
                      <span className="gallery-zoom">＋</span>
                    </motion.button>
                  ))}
                </div>
                <p className="photo-placeholder-note">
                  Gallery photographs are sample images — replace them with your
                  own photos before sharing.
                </p>
              </div>
            </section>

            <section className="section no-gifts-section">
              <div className="no-gifts-card">
                <div className="gift-icon">
                  <Gift size={22} />
                </div>
                <span className="eyebrow">A SMALL REQUEST</span>
                <h2>
                  Your presence is <i>our present</i>
                </h2>
                <p>
                  Your love, blessings and presence are the only gifts we wish
                  for.
                </p>
                <strong>No Shagun. No Gifts, Please.</strong>
                <div className="punjabi-line">
                  ਸਿਰਫ਼ ਤੁਹਾਡਾ ਪਿਆਰ ਤੇ ਅਸ਼ੀਰਵਾਦ ਹੀ ਸਾਡਾ ਸ਼ਗਨ ਹੈ।
                </div>
                <Divider />
              </div>
            </section>

            <section className="section punjabi-section">
              <div className="section-inner">
                <span className="eyebrow">A LITTLE PUNJABI DISCLAIMER</span>
                <h2>
                  The outfits are ready,
                  <br />
                  <i>the dance moves are questionable.</i>
                </h2>
                <p>
                  Come dressed to impress, bring your dancing shoes, charge your
                  phones and keep your appetites ready.
                </p>
                <div className="fun-points">
                  <div>
                    <Music2 />
                    <span>Bhangra is highly encouraged</span>
                  </div>
                  <div>
                    <Sparkles />
                    <span>Bring your best moves</span>
                  </div>
                  <div>
                    <Heart />
                    <span>Save room for dessert</span>
                  </div>
                </div>
                <h3>
                  Come for the wedding, stay for the food,
                  <br />
                  and leave only after dessert!
                </h3>
              </div>
            </section>

            <RSVPSection />
          </main>
          <footer className="footer">
            <div className="footer-flower">❀</div>
            <span className="eyebrow">WITH LOVE & BEST COMPLIMENTS</span>
            <h2>
              Raman Khullar <i>&</i> Savita Khullar
            </h2>
            <p>Together with the entire Khullar family</p>
            <div className="footer-names">
              Aashish <span>♥</span> Arushi
            </div>
            <p className="footer-thanks">
              We look forward to celebrating with you.
            </p>
            <button className="text-button" onClick={replay}>
              OPEN INVITATION AGAIN ↗
            </button>
            <small>12 · 12 · 2026</small>
          </footer>
        </motion.div>
      )}

      <AnimatePresence>
        {activePhoto !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActivePhoto(null)}
          >
            <button
              className="lightbox-close"
              onClick={() => setActivePhoto(null)}
              aria-label="Close gallery"
            >
              <X />
            </button>
            <button
              className="lightbox-arrow left"
              onClick={(e) => {
                e.stopPropagation();
                movePhoto(-1);
              }}
              aria-label="Previous image"
            >
              <ArrowLeft />
            </button>
            <motion.img
              key={activePhoto}
              src={photos[activePhoto].src}
              alt={photos[activePhoto].alt}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="lightbox-arrow right"
              onClick={(e) => {
                e.stopPropagation();
                movePhoto(1);
              }}
              aria-label="Next image"
            >
              <ArrowRight />
            </button>
            <span className="lightbox-count">
              {activePhoto + 1} / {photos.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
