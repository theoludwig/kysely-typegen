import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { fn } from "../index.ts"

describe("index", () => {
  it('should return "Hello, tsdown!"', () => {
    // Arrange - Given
    const input = "tsdown"

    // Act - When
    const output = fn(input)

    // Assert - Then
    const expected = "Hello, tsdown!"
    assert.strictEqual(output, expected)
  })
})
