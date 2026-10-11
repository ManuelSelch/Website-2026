import Link from 'next/link'
import { Anchor, Box, Text, Title } from '@mantine/core'

export default function ProjectNotFound() {
  return (
    <Box className="page-section">
      <Text className="eyebrow">404 / PROJECT</Text>
      <Title order={1} className="page-title">
        Project not found<span className="accent">.</span>
      </Title>
      <Text className="page-intro">This project may have moved or hasn’t been published yet.</Text>
      <Anchor component={Link} href="/projects">
        ← Back to projects
      </Anchor>
    </Box>
  )
}
