import supertest = require('supertest')
import { app } from '../../../src/router'
import { sign } from 'jsonwebtoken'

const route: string = '/users/thumbnails'

describe(`GET ${route}`, () => {
    test('should reject with 401 when request was maded wihout Authorization token', () => {
        return supertest(app)
            .get(route)
            .send()
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when request was maded with wrong Authorization token (no bearer)', () => {
        const token: string = 'some-token'

        return supertest(app)
            .get(route)
            .send()
            .set({ Authorization: token })
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when request was maded with wrong Authorization token (not jwt)', () => {
        const token: string = 'some-token'

        return supertest(app)
            .get(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when request was maded with wrong Authorization token (not expected body)', () => {
        const token: string = sign(
            { token: 'some-token' },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE,
            }
        )

        return supertest(app)
            .get(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when request was maded with wrong Authorization token (user not found)', () => {
        const token: string = sign({ userId: -1 }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        })

        return supertest(app)
            .get(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should resolve a list of thumbnails', () => {
        const token: string = sign({ userId: 0 }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        })

        return supertest(app)
            .get(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(200, [])
    })
})
