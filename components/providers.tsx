'use client'

import { createTheme, MantineProvider, type CSSVariablesResolver } from '@mantine/core'

const theme = createTheme({
  primaryColor: 'sage',
  colors: {
    sage: [
      '#f0f5f2',
      '#e1ebe4',
      '#c5d8cc',
      '#a5bfaf',
      '#86a692',
      '#6b8c79',
      '#587764',
      '#466553',
      '#395443',
      '#2e4437',
    ],
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: { fontFamily: 'Georgia, "Times New Roman", serif', fontWeight: '400' },
  defaultRadius: 5,
  focusRing: 'always',
  black: '#252d2a',
})

const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-body': '#f7f9f8',
    '--mantine-color-text': '#252d2a',
    '--mantine-color-dimmed': '#68746f',
  },
  dark: {},
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      forceColorScheme="light"
    >
      {children}
    </MantineProvider>
  )
}
