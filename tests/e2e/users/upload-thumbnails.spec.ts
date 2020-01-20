import supertest = require('supertest')
import { app } from '../../../src/router'
import { sign } from 'jsonwebtoken'
import { response } from 'express'

const route: string = '/users/thumbnails'

describe(`POST ${route}`, () => {
    test('should reject with 401 when request was maded wihout Authorization token', () => {
        return supertest(app)
            .post(route)
            .send()
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when request was maded with wrong Authorization token (no bearer)', () => {
        const token: string = 'some-token'

        return supertest(app)
            .post(route)
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
            .post(route)
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
            .post(route)
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
            .post(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 400 when request was maded with wrong body file field', () => {
        const token: string = sign({ userId: 0 }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        })

        return supertest(app)
            .post(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .attach('some-file', 'tests/mocks/mock-image.png')
            .expect(400, {
                status: 400,
                message: 'File missing',
            })
    })

    test('should resolve with user details and new thumbnails', async () => {
        const token: string = sign({ userId: 0 }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        })

        const thumbnails: {
            [key: string]: string
        } = process.env.ALLOWED_THUMBNAIL_SIZES.split(',')
            .filter(
                (key: string | undefined): boolean => key && key in process.env
            )
            .map((key: string): string =>
                key.replace(/^thumbnail_(xs|sm|md|lg)$/i, '$1').toLowerCase()
            )
            .map((name): [string, RegExp] => [
                name,
                new RegExp(
                    `/retently\/public\/thumbnails\/[a-z0-9\-]+_${name}.png/`
                ),
            ])
            .reduce((all, [key, value]) => ({ ...all, [key]: value }), {})

        const response = await supertest(app)
            .post(route)
            .send()
            .set({ Authorization: `bearer ${token}` })
            .attach('thumbnail', 'tests/mocks/mock-image.png')
            .expect(200)

        expect(response.body).toMatchObject({
            login: 'arsdu24',
            profile: {
                name: 'Arsenii Dumitru',
                age: 25,
                email: 'arsdu24@gmail.com',
                thumbnails,
            },
        })
    })
})
