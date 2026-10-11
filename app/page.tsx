import Link from 'next/link'
import { Suspense } from 'react'
import { Anchor, Box, Text, Title } from '@mantine/core'
import { About, Contact, Hero, ProjectLoading } from '@/components/portfolio'
import { ProjectCollection } from '@/components/project-collection'

export const revalidate = 60

export default function HomePage() {
  return (
    <>
      <Hero />
      <Box component="section" id="work" className="work-section" aria-labelledby="work-title">
        <Box className="section-heading">
          <Title order={2} id="work-title">
            Selected work
          </Title>
          <Text className="section-note">DIFFERENT PROJECTS. DIFFERENT KINDS OF PROBLEMS.</Text>
        </Box>
        <Suspense fallback={<ProjectLoading />}>
          <ProjectCollection featured />
        </Suspense>
        <Anchor component={Link} href="/projects" className="all-projects-link" underline="hover">
          All projects <span aria-hidden="true">↗</span>
        </Anchor>
      </Box>
      <About />
      <Contact />
    </>
  )
}
