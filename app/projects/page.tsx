import type { Metadata } from 'next'
import Link from 'next/link'
import { Anchor, Box, Text, Title } from '@mantine/core'
import { ProjectCollection } from '@/components/project-collection'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of software, robotics, and side projects by Manuel Selch.',
}

export default function ProjectsIndexPage() {
  return (
    <Box className="page-section">
      <Anchor component={Link} href="/" className="back-link" underline="hover">
        ← Back to home
      </Anchor>
      <Text className="eyebrow">THE PROJECT COLLECTION</Text>
      <Title order={1} className="page-title">
        Things I&apos;ve built<span className="accent">.</span>
      </Title>
      <Text className="page-intro">
        Software, robotics, and the ideas that became something tangible.
      </Text>
      <ProjectCollection />
    </Box>
  )
}
