import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="container-page">
      <section className="py-16 md:py-24">
        <h1 className="hero-title">Hallo, ich bin Manuel — Entwickler & Maker</h1>
        <p className="hero-subtitle max-w-2xl">
          Ich baue Software, Roboter und digitale Produkte. Von iOS-Apps bis Webplattformen —
          mit Fokus auf Nutzererlebnis, zuverlässige Technik und sauberen Code.
        </p>
        <div className="mt-8 flex gap-4">
          <a href="#projects" className="btn-primary">Meine Projekte ansehen</a>
          <a href="#contact" className="inline-flex items-center px-5 py-3 rounded-lg border border-white/10 hover:bg-white/10 transition">Kontakt</a>
        </div>
      </section>

      <section id="projects" className="py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Ausgewählte Projekte</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <article className="card">
            <h3 className="text-xl font-semibold">Autonomer Lieferroboter</h3>
            <p className="mt-2 text-slate-300 text-sm">
              Sensorfusion mit Kalman-Filter zur Selbstlokalisierung. Regionaler JuFo-Preisträger 2023.
            </p>
            <a className="mt-4 inline-flex text-brand-300 hover:text-brand-200" href="https://manuelselch.de/2023/blog.php?id=30" target="_blank" rel="noreferrer">Mehr erfahren →</a>
          </article>

          <article className="card">
            <h3 className="text-xl font-semibold">Odoo App Entwicklung</h3>
            <p className="mt-2 text-slate-300 text-sm">
              Module und Integrationen für das ERP-System Odoo. Fokus auf saubere Architektur und Tests.
            </p>
            <a className="mt-4 inline-flex text-brand-300 hover:text-brand-200" href="https://github.com/ManuelSelch" target="_blank" rel="noreferrer">GitHub ansehen →</a>
          </article>
        </div>
      </section>

      <section id="about" className="py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Über mich</h2>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <p className="text-slate-300">
              Ich studiere Informatik, arbeite an praktischen Projekten und teile mein Wissen in Open-Source.
              Themen: Robotik, Webentwicklung, iOS, Clean Code, Testing und Systemdesign.
            </p>
            <ul className="mt-4 list-disc pl-5 text-slate-300 text-sm">
              <li>Standort: Bayreuth, Bayern, Deutschland</li>
              <li>LinkedIn: <a className="underline hover:text-white" href="https://de.linkedin.com/in/manuel-selch" target="_blank" rel="noreferrer">manuel-selch</a></li>
              <li>GitHub: <a className="underline hover:text-white" href="https://github.com/ManuelSelch" target="_blank" rel="noreferrer">@ManuelSelch</a></li>
            </ul>
          </div>
          <div>
            <div className="card">
              <h3 className="font-semibold">Skills</h3>
              <ul className="mt-2 text-sm text-slate-300 space-y-1">
                <li>Next.js, React, TypeScript</li>
                <li>Node.js, Python, Java</li>
                <li>Tailwind CSS, UI/UX</li>
                <li>Robotics, Sensorfusion, Kalman-Filter</li>
                <li>CI/CD, Docker, Git</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Kontakt</h2>
        <p className="text-slate-300">Für Projekte, Kooperationen oder einfach zum Vernetzen — schreibe mir gerne:</p>
        <div className="mt-4 flex gap-4">
          <a className="btn-primary" href="mailto:manuel@selch.dev">E-Mail senden</a>
          <a className="inline-flex items-center px-5 py-3 rounded-lg border border-white/10 hover:bg-white/10 transition" href="https://de.linkedin.com/in/manuel-selch" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
      </section>
    </div>
  )
}
