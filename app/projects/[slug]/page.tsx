import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Anchor, Badge, Box, Group, Paper, Stack, Text, Title } from '@mantine/core'
import { getAllProjectSlugs, getProjectBySlug, assetUrlFrom } from '@/lib/projects'
import { shouldExpandProjectDetails } from '@/lib/project-layout'
import { ProjectGallery } from '@/components/project-gallery'

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

function DetailsCard({ content }: { content: string }) {
  if (!content) return null
  return (
    <Paper
      component="section"
      className="detail-card details-card"
      withBorder
      aria-labelledby="details-title"
    >
      <Title order={2} id="details-title">
        Project details
      </Title>
      {/* Trusted owner-authored HTML only; see README.md for the content policy. */}
      <Box className="article-content" dangerouslySetInnerHTML={{ __html: content }} />
    </Paper>
  )
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()
  const expanded = shouldExpandProjectDetails(project.content)
  const date = project.date ? new Date(project.date) : null
  const year = date && !Number.isNaN(date.getTime()) ? date.getUTCFullYear() : null
  const hasInformation =
    year !== null || project.tags.length > 0 || Object.keys(project.links).length > 0
  const items = project.gallery.map(asset => ({ ...asset, path: assetUrlFrom(asset.path)! }))
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
        <Box className={`detail-layout${expanded ? ' expanded-details' : ''}`}>
          <ProjectGallery key={project.slug} title={project.title} items={items} />
          <Box className="project-sidebar">
            {!expanded && <DetailsCard content={project.content} />}
            {hasInformation && (
              <Paper
                component="section"
                className="detail-card information-card"
                withBorder
                aria-labelledby="information-title"
              >
                <Title order={2} id="information-title">
                  Project information
                </Title>
                {(year !== null || project.tags.length > 0) && (
                  <Box component="dl" className="project-facts">
                    {year !== null && (
                      <Box>
                        <dt>Year</dt>
                        <dd>{year}</dd>
                      </Box>
                    )}
                    {project.tags.length > 0 && (
                      <Box>
                        <dt>Topics</dt>
                        <dd>
                          <Group gap={6} className="project-tags">
                            {project.tags.map((tag, i) => (
                              <Badge key={`${tag}-${i}`} variant="outline" radius={3}>
                                {tag}
                              </Badge>
                            ))}
                          </Group>
                        </dd>
                      </Box>
                    )}
                  </Box>
                )}
                {Object.keys(project.links).length > 0 && (
                  <Stack gap={12} className="project-resource-links">
                    {Object.entries(project.links).map(([key, url]) => (
                      <Anchor
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                      >
                        {linkLabels[key as keyof typeof linkLabels]}{' '}
                        <span aria-hidden="true">↗</span>
                      </Anchor>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}
          </Box>
          {expanded && <DetailsCard content={project.content} />}
        </Box>
      </Box>
    </Box>
  )
}
