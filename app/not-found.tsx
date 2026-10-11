import Link from 'next/link'
import { Anchor, Box, Text, Title } from '@mantine/core'

export default function NotFound() {
  return (
    <Box className="page-section">
      <Text className="eyebrow">404 / PAGE</Text>
      <Title order={1} className="page-title">
        Nothing here, just yet<span className="accent">.</span>
      </Title>
      <Text className="page-intro">The page you’re looking for couldn’t be found.</Text>
      <Anchor component={Link} href="/">
        ← Back to home
      </Anchor>
    </Box>
  )
}
