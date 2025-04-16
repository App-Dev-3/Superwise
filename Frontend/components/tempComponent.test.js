import { describe, expect, test } from 'vitest'


describe('tempComponent', () => {
    test('does meth', () => {
        expect(1+1).toBe(2)
    })

    test('does not meth', () => {
        expect(1+2).not.toBe(2)
    })
})
