import supertest = require('supertest')
import { app } from '../../../src/router'
import { sign } from 'jsonwebtoken'
import { User } from '../../../src/models'
import { resolve } from 'url'
import { readFileSync } from 'fs'

const route: string = '/users/thumbnails/:size'

describe(`GET ${route}`, () => {
    test('should reject with 401 when request was maded wihout Authorization token', () => {
        return supertest(app)
            .get(route.replace(':size', 'xs'))
            .send()
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when request was maded with wrong Authorization token (no bearer)', () => {
        const token: string = 'some-token'

        return supertest(app)
            .get(route.replace(':size', 'sm'))
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
            .get(route.replace(':size', 'md'))
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
            .get(route.replace(':size', 'lg'))
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
            .get(route.replace(':size', 'xs'))
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(401, {
                status: 401,
                message: 'Unauthorized',
            })
    })

    test('should reject with 401 when user profile doesnt contains thumbnail for that size', async () => {
        const token: string = sign({ userId: 0 }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        })

        const user: User = await User.findByIdOrFail(0)

        user.profile.thumbnails = {}

        user.save()

        return supertest(app)
            .get(route.replace(':size', 'sm'))
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(404, { status: 404, message: 'Thumbnail was not found' })
    })

    test('should resolve an thumbnails', async () => {
        const token: string = sign({ userId: 0 }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        })

        const user: User = await User.findByIdOrFail(0)
        const path: string = resolve(__dirname, '../mocks/mock-image.png')

        user.profile.thumbnails = { sm: path }

        user.save()

        return supertest(app)
            .get(route.replace(':size', 'sm'))
            .send()
            .set({ Authorization: `bearer ${token}` })
            .expect(200, readFileSync(path))
    })
})
