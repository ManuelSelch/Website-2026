import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getAllProjectSlugs, getProjectBySlug, assetUrlFrom } from '@/lib/projects'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const slugs = await getAllProjectSlugs(100)
    return slugs.map(slug => ({ slug }))
  } catch {
    // fallback to on-demand rendering
    return []
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) return { title: 'Projekt nicht gefunden' }
  return {
    title: `${project.title} — Projekt` ,
    description: project.summary ?? '',
    openGraph: {
      title: project.title,
      description: project.summary ?? '',
      images: project.cover?.path ? [assetUrlFrom(project.cover.path)!] : [],
      type: 'article',
    },
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  const coverUrl = assetUrlFrom(project.cover?.path || undefined)

  return (
    <div className="container-page py-10">
      <a href="/" className="text-sm text-slate-300 hover:text-white">← Zurück</a>
      <article className="mt-6">
        <h1 className="text-3xl md:text-4xl font-bold">{project.title}</h1>
        {project.summary && (
          <p className="mt-2 text-slate-300 max-w-2xl">{project.summary}</p>
        )}

        {coverUrl && (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt={project.title} className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Content (supports simple HTML from Cockpit) */}
        {project.content && (
          <div className="prose prose-invert mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: project.content }} />
        )}

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Bilder</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {project.gallery.map((g, i) => {
                const url = assetUrlFrom(g.path)
                if (!url) return null
                return (
                  <img key={i} src={url} alt={`Bild ${i+1}`} className="rounded-lg border border-white/10" />
                )
              })}
            </div>
          </section>
        )}

        {/* Links */}
        {project.links && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-3">Links</h2>
            <div className="flex flex-wrap gap-3">
              {project.links.website && <a className="btn-primary" href={project.links.website} target="_blank" rel="noreferrer">Website</a>}
              {project.links.github && <a className="btn-primary" href={project.links.github} target="_blank" rel="noreferrer">GitHub</a>}
              {project.links.playstore && <a className="btn-primary" href={project.links.playstore} target="_blank" rel="noreferrer">Play Store</a>}
              {project.links.appstore && <a className="btn-primary" href={project.links.appstore} target="_blank" rel="noreferrer">App Store</a>}
              {project.links.article && <a className="btn-primary" href={project.links.article} target="_blank" rel="noreferrer">Artikel</a>}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
