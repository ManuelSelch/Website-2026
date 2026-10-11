'use client'

import { useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Image,
  Modal,
  Paper,
  Text,
  UnstyledButton,
} from '@mantine/core'
import type { ProjectAsset } from '@/lib/projects'

export function ProjectGallery({ title, items }: { title: string; items: ProjectAsset[] }) {
  const [index, setIndex] = useState(0)
  const [opened, setOpened] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const current = items[index] || items[0]
  const select = (next: number) => {
    setIndex(next)
    setZoomed(false)
  }
  const move = (direction: number) => {
    if (items.length > 1) select((index + direction + items.length) % items.length)
  }
  const alt = current?.alt || `${title} image ${index + 1}`
  const counter = `${index + 1} / ${items.length}`
  return (
    <Box component="section" className="project-gallery" role="region" aria-label="Project gallery">
      {!current ? (
        <Paper className="gallery-empty" withBorder>
          <Text className="eyebrow">PROJECT GALLERY</Text>
          <Text>Photos will be added here soon.</Text>
        </Paper>
      ) : (
        <>
          <Paper className="gallery-main" withBorder>
            {current.type === 'video' ? (
              <video
                key={current.path}
                src={current.path}
                controls
                preload="metadata"
                aria-label={current.alt || `${title} video ${index + 1}`}
              />
            ) : (
              <UnstyledButton
                className="gallery-open"
                aria-label="Open image fullscreen"
                onClick={() => setOpened(true)}
              >
                <Image src={current.path} alt={alt} className="gallery-image" />
                <span className="gallery-enlarge" aria-hidden="true">
                  ↗
                </span>
              </UnstyledButton>
            )}
          </Paper>
          <Group className="gallery-controls" justify="space-between" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {current.type === 'video' ? 'Play at your own pace' : 'Click the image to enlarge'}
            </Text>
            <Group gap={12} wrap="nowrap">
              <ActionIcon
                variant="subtle"
                aria-label="Previous image"
                disabled={items.length < 2}
                onClick={() => move(-1)}
              >
                ←
              </ActionIcon>
              <Text size="xs" className="gallery-count" aria-live="polite" aria-atomic="true">
                {counter}
              </Text>
              <ActionIcon
                variant="subtle"
                aria-label="Next image"
                disabled={items.length < 2}
                onClick={() => move(1)}
              >
                →
              </ActionIcon>
            </Group>
          </Group>
          <Box className="gallery-thumbnails" role="group" aria-label="Choose a gallery item">
            {items.map((item, i) => (
              <UnstyledButton
                key={`${item.path}-${i}`}
                className="gallery-thumbnail"
                aria-label={`Show ${item.type === 'video' ? 'video' : 'image'} ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => select(i)}
              >
                {item.type === 'video' ? (
                  <span className="video-thumbnail">
                    ▶ <span>Video {i + 1}</span>
                  </span>
                ) : (
                  <Image src={item.path} alt="" loading="lazy" />
                )}
              </UnstyledButton>
            ))}
          </Box>
          {current.caption && <Text className="gallery-caption">{current.caption}</Text>}
          <Modal
            opened={opened}
            onClose={() => {
              setOpened(false)
              setZoomed(false)
            }}
            fullScreen
            title={`${title} — Gallery`}
            closeButtonProps={{ 'aria-label': 'Close gallery' }}
            transitionProps={{ duration: 0 }}
            classNames={{ body: 'gallery-modal-body', header: 'gallery-modal-header' }}
            onKeyDown={event => {
              if (event.target instanceof HTMLVideoElement) return
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault()
                move(event.key === 'ArrowRight' ? 1 : -1)
              }
            }}
          >
            <Box className="lightbox-viewport" data-zoomed={zoomed || undefined}>
              {current.type === 'video' ? (
                <video
                  key={current.path}
                  src={current.path}
                  controls
                  preload="metadata"
                  aria-label={current.alt || `${title} video ${index + 1}`}
                />
              ) : (
                <Image
                  className="lightbox-image"
                  src={current.path}
                  alt={alt}
                  data-zoomed={zoomed ? 'true' : 'false'}
                />
              )}
            </Box>
            <Group className="lightbox-toolbar" justify="space-between">
              <Group gap={12}>
                <ActionIcon
                  size="lg"
                  variant="subtle"
                  aria-label="Previous image"
                  disabled={items.length < 2}
                  onClick={() => move(-1)}
                >
                  ←
                </ActionIcon>
                <Text size="sm" aria-live="polite">
                  {counter}
                </Text>
                <ActionIcon
                  size="lg"
                  variant="subtle"
                  aria-label="Next image"
                  disabled={items.length < 2}
                  onClick={() => move(1)}
                >
                  →
                </ActionIcon>
              </Group>
              {current.type !== 'video' && (
                <Button
                  variant="outline"
                  size="xs"
                  aria-pressed={zoomed}
                  onClick={() => setZoomed(value => !value)}
                >
                  {zoomed ? 'Zoom out' : 'Zoom in'}
                </Button>
              )}
            </Group>
            <Text size="sm" c="dimmed" className="lightbox-caption">
              {current.caption || alt}
            </Text>
          </Modal>
        </>
      )}
    </Box>
  )
}
