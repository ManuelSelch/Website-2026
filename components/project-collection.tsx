import { getFeaturedProjects, getProjects, assetUrlFrom } from '@/lib/projects'
import { ProjectCard, ProjectState } from './portfolio'

export async function ProjectCollection({ featured = false }: { featured?: boolean }) {
  let projects
  try {
    projects = await (featured ? getFeaturedProjects() : getProjects())
  } catch (error) {
    console.error(
      'Project collection unavailable:',
      error instanceof Error ? error.message : 'Unknown error',
    )
    return <ProjectState error />
  }
  if (!projects.length) return <ProjectState />
  return (
    <div className="project-grid">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.slug}
          index={index}
          featured={featured && index === 0}
          project={{
            ...project,
            cover: project.cover
              ? { ...project.cover, path: assetUrlFrom(project.cover.path)! }
              : undefined,
          }}
        />
      ))}
    </div>
  )
}
