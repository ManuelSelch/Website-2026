'use client'

import Link from 'next/link'
import {
  Anchor,
  Badge,
  Box,
  Button,
  Group,
  Image,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import type { Project } from '@/lib/projects'

export function SiteHeader() {
  return (
    <Box component="header" className="site-header">
      <Anchor component={Link} href="/" className="wordmark" underline="never">
        manuel selch<span className="accent">.</span>
      </Anchor>
      <Group component="nav" aria-label="Main navigation" className="main-navigation" gap={32}>
        <Anchor component={Link} href="/projects" underline="never">
          Projects
        </Anchor>
        <Anchor href="/#about" underline="never">
          About
        </Anchor>
        <Anchor href="/#contact" underline="never">
          Contact <span aria-hidden="true">↗</span>
        </Anchor>
      </Group>
    </Box>
  )
}

export function SiteFooter() {
  return (
    <Box component="footer" className="site-footer">
      <Text span>© {new Date().getFullYear()} Manuel Selch</Text>
      <Text span className="footer-note">
        Always a work in progress.
      </Text>
      <Anchor
        href="https://manuelselch.de/2023/"
        target="_blank"
        rel="noreferrer"
        underline="hover"
      >
        2023 website <span aria-hidden="true">↗</span>
      </Anchor>
    </Box>
  )
}

export function Hero() {
  return (
    <Box component="section" className="hero" aria-labelledby="hero-title">
      <Text className="eyebrow">
        <span className="small-line" aria-hidden="true" /> SOFTWARE · ROBOTICS · SIDE PROJECTS
      </Text>
      <Title order={1} id="hero-title" className="hero-title">
        Curiosity, turned
        <br />
        into <em>things that work.</em>
      </Title>
      <Box className="hero-bottom">
        <Text>
          I&apos;m Manuel. I build software, explore robotics, and enjoy figuring out how things fit
          together. This is a collection of my projects.
        </Text>
        <Anchor href="#work" className="text-link" underline="never">
          Explore my work <span aria-hidden="true">↓</span>
        </Anchor>
      </Box>
      <Text className="hero-margin" aria-hidden="true">
        IDEA → BUILD → LEARN → REPEAT
      </Text>
    </Box>
  )
}

export function About() {
  return (
    <Box component="section" id="about" className="about" aria-labelledby="about-title">
      <Box className="about-label">
        <Text className="eyebrow">A LITTLE ABOUT ME</Text>
        <Text className="about-mark" aria-hidden="true">
          m.
        </Text>
      </Box>
      <Box className="about-copy">
        <Title order={2} id="about-title">
          I like understanding things.
          <br />
          <em>And then building them.</em>
        </Title>
        <Text>
          From a browser interface to a robot moving through the world, I enjoy projects that
          connect an idea with something tangible.
        </Text>
        <Text>
          This space is for the things I make, the problems I work through, and what I learn along
          the way.
        </Text>
        <Group gap={26} mt={27}>
          <Anchor
            href="https://github.com/ManuelSelch"
            target="_blank"
            rel="noreferrer"
            underline="hover"
          >
            GitHub ↗
          </Anchor>
          <Anchor
            href="https://de.linkedin.com/in/manuel-selch"
            target="_blank"
            rel="noreferrer"
            underline="hover"
          >
            LinkedIn ↗
          </Anchor>
        </Group>
      </Box>
    </Box>
  )
}

export function Contact() {
  return (
    <Box component="section" id="contact" className="contact" aria-labelledby="contact-title">
      <Text className="eyebrow">HAVE AN IDEA, OR JUST WANT TO SAY HI?</Text>
      <Box className="contact-row">
        <Title order={2} id="contact-title">
          Let&apos;s talk<span className="accent">.</span>
        </Title>
        <Anchor href="mailto:manuel@selch.de" className="email-link" underline="never">
          manuel@selch.de <span aria-hidden="true">↗</span>
        </Anchor>
      </Box>
    </Box>
  )
}

export function ProjectCard({
  project,
  index,
  featured = false,
}: {
  project: Project
  index: number
  featured?: boolean
}) {
  // Resolved on the server, so the CMS base URL stays out of the client module.
  const cover = project.cover
  const href = `/projects/${project.slug}`
  return (
    <Paper
      component="article"
      className={`project-card${featured ? ' featured-project' : ''}`}
      withBorder
    >
      <Box className="project-visual">
        {cover && cover.type !== 'video' ? (
          <Image
            src={cover.path}
            alt={cover.alt || `${project.title} project preview`}
            className="project-cover"
            loading="lazy"
          />
        ) : (
          <Box className="project-cover-placeholder" aria-hidden="true">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span>{project.title}</span>
          </Box>
        )}
      </Box>
      <Box className="project-info">
        <Text className="project-number">
          {String(index + 1).padStart(2, '0')} <span>/ {project.tags[0] || 'PROJECT'}</span>
        </Text>
        <Title order={3}>
          <Anchor component={Link} href={href} underline="never">
            {project.title}
          </Anchor>
        </Title>
        {project.summary && <Text className="project-summary">{project.summary}</Text>}
        {project.tags.length > 0 && (
          <Group gap={6} className="project-tags">
            {project.tags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="outline" radius={3}>
                {tag}
              </Badge>
            ))}
          </Group>
        )}
        <Anchor
          component={Link}
          href={href}
          className="project-link"
          underline="never"
          aria-label={`Details for ${project.title}`}
        >
          Details <span aria-hidden="true">↗</span>
        </Anchor>
      </Box>
    </Paper>
  )
}

export function ProjectState({ error = false }: { error?: boolean }) {
  return (
    <Paper className="project-state" withBorder role={error ? 'status' : undefined}>
      <Text className="eyebrow">{error ? 'TEMPORARILY UNAVAILABLE' : 'A WORK IN PROGRESS'}</Text>
      <Title order={3}>
        {error ? 'The project collection is taking a moment.' : 'Project stories are on their way.'}
      </Title>
      <Text>
        {error
          ? 'Please try again shortly. You can still explore my work on GitHub or get in touch.'
          : 'I’m putting together the stories behind my work. In the meantime, you can explore my projects on GitHub.'}
      </Text>
      <Anchor
        href="https://github.com/ManuelSelch"
        target="_blank"
        rel="noreferrer"
        underline="hover"
      >
        Explore GitHub ↗
      </Anchor>
    </Paper>
  )
}

export function ProjectLoading({ detail = false }: { detail?: boolean }) {
  return (
    <Stack className="page-section" role="status" aria-label="Loading projects" gap={24}>
      <span className="visually-hidden">Loading projects…</span>
      <Skeleton height={18} width={100} />
      <Skeleton height={56} width="60%" />
      <Box className={detail ? undefined : 'project-grid'}>
        {Array.from({ length: detail ? 1 : 4 }, (_, i) => (
          <Skeleton key={i} height={detail ? 380 : 320} />
        ))}
      </Box>
    </Stack>
  )
}

export function RetryProjectError({ reset }: { reset: () => void }) {
  return (
    <Stack className="page-section" align="flex-start" gap={24}>
      <Title order={1} className="page-title">
        Projects are temporarily unavailable.
      </Title>
      <Text>Please try again, or get in touch at manuel@selch.de.</Text>
      <Group>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
        <Anchor component={Link} href="/projects">
          Back to projects
        </Anchor>
      </Group>
    </Stack>
  )
}
