// Add Vitest unit tests for UserService
import { describe, it, expect } from 'vitest'
import { UserService } from './user.service'
import { db } from '../../shared/database'

describe('UserService', () => {
    const service = new UserService()

    it('should return all users', () => {
        const users = service.getAll()
        expect(users).toBeDefined()
        expect(Array.isArray(users)).toBe(true)
        expect(users.length).toBeGreaterThan(0)
        // ensure it matches the in-memory db initial state
        expect(users).toEqual(db.users)
    })

    it('should return a user by id when found', () => {
        const user = service.getById('1')
        expect(user).toBeDefined()
        expect(user?.id).toBe('1')
        expect(user?.name).toBe('John Doe')
    })

    it('should return undefined when user not found', () => {
        const user = service.getById('non-existing-id')
        expect(user).toBeUndefined()
    })
})

