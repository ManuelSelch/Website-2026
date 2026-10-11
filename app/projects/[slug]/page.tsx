import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, Badge, Box, Group, Image, Text, Title } from '@mantine/core'
import { getAllProjectSlugs, getProjectBySlug, assetUrlFrom } from '@/lib/projects'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    return (await getAllProjectSlugs()).map(slug => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let project
  try {
    project = await getProjectBySlug(slug)
  } catch {
    return { title: 'Project unavailable', robots: { index: false } }
  }
  if (!project) return { title: 'Project not found', robots: { index: false } }
  const cover = project.cover?.type !== 'video' ? assetUrlFrom(project.cover?.path) : null
  return {
    title: project.title,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: cover ? [cover] : [],
      type: 'article',
      url: `/projects/${slug}`,
    },
  }
}

const linkLabels = {
  website: 'Website',
  github: 'GitHub',
  playstore: 'Play Store',
  appstore: 'App Store',
  article: 'Article',
} as const

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()
  const coverUrl = assetUrlFrom(project.cover?.path)
  return (
    <Box className="page-section project-detail">
      <Anchor component={Link} href="/projects" className="back-link" underline="hover">
        ← Back to projects
      </Anchor>
      <Box component="article">
        <Text className="eyebrow">{project.tags[0] || 'PROJECT CASE STUDY'}</Text>
        <Title order={1} className="page-title">
          {project.title}
        </Title>
        {project.summary && <Text className="page-intro">{project.summary}</Text>}
        {project.tags.length > 0 && (
          <Group gap={6} mb={30}>
            {project.tags.map((tag, i) => (
              <Badge key={`${tag}-${i}`} variant="outline" radius={3}>
                {tag}
              </Badge>
            ))}
          </Group>
        )}
        {coverUrl &&
          (project.cover?.type === 'video' ? (
            <video
              className="detail-cover"
              src={coverUrl}
              controls
              preload="metadata"
              aria-label={`${project.title} preview`}
            />
          ) : (
            <Image
              className="detail-cover"
              src={coverUrl}
              alt={project.cover?.alt || `${project.title} project preview`}
            />
          ))}
        {/* Trusted owner-authored HTML only; see README.md for the content policy. */}
        {project.content && (
          <Box className="article-content" dangerouslySetInnerHTML={{ __html: project.content }} />
        )}
        {project.gallery.length > 0 && (
          <Box component="section" className="detail-section" aria-labelledby="gallery-title">
            <Title order={2} id="gallery-title">
              A closer look
            </Title>
            <Box className="gallery-grid">
              {project.gallery.map((asset, index) => {
                const url = assetUrlFrom(asset.path)
                if (!url) return null
                return asset.type === 'video' ? (
                  <video
                    key={index}
                    src={url}
                    controls
                    preload="metadata"
                    aria-label={asset.alt || `${project.title} video ${index + 1}`}
                  />
                ) : (
                  <Image
                    key={index}
                    src={url}
                    alt={asset.alt || `${project.title} image ${index + 1}`}
                    loading="lazy"
                  />
                )
              })}
            </Box>
          </Box>
        )}
        {Object.keys(project.links).length > 0 && (
          <Box component="section" className="detail-section" aria-labelledby="links-title">
            <Title order={2} id="links-title">
              Explore the project
            </Title>
            <Group gap={24}>
              {Object.entries(project.links).map(([key, url]) => (
                <Anchor key={key} href={url} target="_blank" rel="noreferrer" underline="hover">
                  {linkLabels[key as keyof typeof linkLabels]} ↗
                </Anchor>
              ))}
            </Group>
          </Box>
        )}
      </Box>
    </Box>
  )
}
