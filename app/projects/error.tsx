'use client'

import { RetryProjectError } from '@/components/portfolio'

export default function ProjectError({ reset }: { reset: () => void }) {
  return <RetryProjectError reset={reset} />
}
