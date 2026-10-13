const { useState, useEffect, useRef } = React;
const h = React.createElement;

const SECTIONS = ["Home", "About", "Skills", "Projects", "Resume", "Contact"];

// ===== ICONS (simple inline SVG) =====
const ICONS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  about: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  skills: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  projects: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  resume: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  contact: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'
};

function Icon(props) {
  return h("svg", {
    className: "icon",
    viewBox: "0 0 24 24",
    width: 22,
    height: 22,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    dangerouslySetInnerHTML: { __html: ICONS[props.name] }
  });
}

// Section heading with an icon beside it
function SectionTitle(props) {
  return h("h2", { className: "section-title" },
    h("span", { className: "title-icon" }, h(Icon, { name: props.icon })),
    props.text
  );
}

// Returns true once the element has scrolled into view
function useInView(ref) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return seen;
}

function Nav() {
  const [active, setActive] = useState("home");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return h("nav", null,
    h("div", { className: "nav-in" },
      h("a", { href: "#home", className: "logo" },
  h(Icon, { name: "code" }),
  PROFILE.name
),
      h("div", { className: "links" },
        SECTIONS.map((id) =>
          h("a", { key: id, href: "#" + id, className: active === id ? "on" : "" },
            id === "about" ? "About" : id[0].toUpperCase() + id.slice(1))
        )
      )
    )
  );
}

function Hero() {
  const [text, setText] = useState("");
  useEffect(() => {
    let r = 0, c = 0, deleting = false, timer;
    const tick = () => {
      const word = PROFILE.roles[r];
      c += deleting ? -1 : 1;
      setText(word.slice(0, c));
      let delay = deleting ? 45 : 90;
      if (!deleting && c === word.length) { deleting = true; delay = 1400; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % PROFILE.roles.length; delay = 300; }
      timer = setTimeout(tick, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  return h("section", { id: "home", className: "hero" },
    h("div", { className: "orb", "aria-hidden": "true" }),
    h("h1", null, "Hi, I'm " + PROFILE.name),
    h("div", { className: "role" }, text, h("span", { className: "cursor" })),
    h("p", null, PROFILE.intro),
    h("div", { className: "btns" },
      h("a", { href: "#projects", className: "btn fill" }, "View projects"),
      h("a", { href: "#contact", className: "btn line" }, "Contact me")
    )
  );
}

function About() {
  return h("section", { id: "about" },
    h(SectionTitle, { icon: "about", text: "About me" }),
    h("div", { className: "about" },
      ABOUT.photo
        ? h("img", { className: "photo-img", src: ABOUT.photo, alt: PROFILE.name })
        : h("div", { className: "photo" }, "Your photo"),
      h("div", null,
        ABOUT.paragraphs.map((t, i) => h("p", { key: i, className: "about-text" }, t)),
        h("ul", { className: "facts" },
          ABOUT.facts.map((f) =>
            h("li", { key: f.label }, h("small", null, f.label), h("strong", null, f.value))
          )
        )
      )
    )
  );
}

function Skills() {
  const ref = useRef(null);
  const seen = useInView(ref);
  return h("section", { id: "skills" },
    h(SectionTitle, { icon: "skills", text: "Skills" }),
    h("div", { className: "skills", ref: ref },
      SKILLS.map((s) =>
        h("div", { key: s.name },
          h("div", { className: "skill-top" },
            h("span", null, s.name),
            h("span", null, s.level + "%")
          ),
          h("div", { className: "track" },
            h("div", { className: "fill-bar", style: { width: seen ? s.level + "%" : 0 } })
          )
        )
      )
    )
  );
}

function Card(props) {
  const p = props.project;
  const ref = useRef(null);
  const seen = useInView(ref);
  return h("article", {
      ref: ref,
      className: "card" + (seen ? " show" : ""),
      style: { transitionDelay: (props.index % 2) * 120 + "ms" }
    },
    h("h3", null, p.title),
    h("p", null, p.desc),
    h("div", { className: "tags" }, p.tags.map((t) => h("span", { key: t }, t))),
    h("a", { className: "gh", href: p.link, target: "_blank", rel: "noreferrer" }, "View on GitHub")
  );
}

function Projects() {
  return h("section", { id: "projects" },
    h(SectionTitle, { icon: "projects", text: "Projects" }),
    h("div", { className: "grid" },
      PROJECTS.map((p, i) => h(Card, { key: p.title, project: p, index: i }))
    )
  );
}

function Resume() {
  return h("section", { id: "resume" },
    h(SectionTitle, { icon: "resume", text: "Resume" }),
    h("div", { className: "resume" },
      h("p", null, "Download my resume to see my education, skills and experience."),
      h("a", { className: "btn fill", href: PROFILE.resume, download: true }, "Download resume")
    )
  );
}

function Contact() {
  const items = [
    { label: "Phone", value: PROFILE.phone, href: "tel:" + PROFILE.phone.replace(/\s/g, "") },
    { label: "Email", value: PROFILE.email, href: "mailto:" + PROFILE.email },
    { label: "LinkedIn", value: "Open profile", href: PROFILE.linkedin },
    { label: "GitHub", value: "Open profile", href: PROFILE.github }
  ];
  return h("section", { id: "contact" },
    h(SectionTitle, { icon: "contact", text: "Contact" }),
    h("div", { className: "contact" },
      items.map((it) =>
        h("a", {
            key: it.label,
            className: "c-item",
            href: it.href,
            target: it.href.startsWith("http") ? "_blank" : undefined,
            rel: "noreferrer"
          },
          h("small", null, it.label),
          h("strong", null, it.value)
        )
      )
    )
  );
}

function App() {
  return h(React.Fragment, null,
    h(Nav),
    h("main", null, h(Hero), h(About), h(Skills), h(Projects), h(Resume), h(Contact)),
    h("footer", null, "© " + new Date().getFullYear() + " " + PROFILE.name)
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));