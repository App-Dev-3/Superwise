import { describe, expect, test } from 'vitest'


describe('English', () => {
    test('does english', () => {
        expect('hi').toBe('hi')
    })

    test('does not meth', () => {
        expect('hi').not.toBe('bye')
    })
})
