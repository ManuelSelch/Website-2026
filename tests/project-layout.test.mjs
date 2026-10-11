import assert from 'node:assert/strict'
import { test } from 'node:test'
import { shouldExpandProjectDetails } from '../lib/project-layout.ts'

test('short and absent descriptions stay beside the gallery', () => {
  assert.equal(shouldExpandProjectDetails(''), false)
  assert.equal(shouldExpandProjectDetails('<p>A short project description.</p>'), false)
  assert.equal(shouldExpandProjectDetails('<p>' + 'word '.repeat(180) + '</p>'), false)
})
test('long descriptions move below the gallery for a comfortable reading width', () => {
  assert.equal(shouldExpandProjectDetails('<p>' + 'word '.repeat(181) + '</p>'), true)
})
test('HTML tags and extra whitespace do not count as description words', () => {
  assert.equal(shouldExpandProjectDetails('<div><p>  First </p><p> second </p></div>'), false)
})
