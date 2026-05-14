import Link from 'next/link'
import { assetUrlFrom, getAllProjectSlugs } from '@/lib/projects'
import { cockpit } from '@/lib/cockpit'

export const revalidate = 60

async function getProjects() {
  const res = await cockpit.collection('projects', {
    sort: { date: -1 },
    populate: 1,
    limit: 100,
  }) as { entries?: any[] }
  return res.entries ?? []
}

export default async function ProjectsIndexPage() {
  const projects = await getProjects()

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl md:text-4xl font-bold">Projekte</h1>
      <p className="text-slate-300 mt-2">Ausgewählte Projekte und Arbeiten.</p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {projects.map((p:any) => {
          const cover = p.cover?.path || p.hero?.path
          const coverUrl = assetUrlFrom(cover)
          return (
            <Link key={p._id} href={`/projects/${p.slug}`} className="card block hover:bg-white/10 transition">
              {coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverUrl} alt={p.title} className="w-full h-40 object-cover rounded-lg" />
              )}
              <h2 className="mt-3 font-semibold text-lg">{p.title}</h2>
              {p.summary && <p className="text-slate-300 text-sm mt-1 line-clamp-2">{p.summary}</p>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
