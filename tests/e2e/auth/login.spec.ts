import supertest = require('supertest')
import { app } from '../../../src/router'
import { sign } from 'jsonwebtoken'

const route: string = '/auth/login'

describe(`POST ${route}`, () => {
    test('should reject with 400 when passed body doesnt contains credentials', () => {
        return supertest(app)
            .post(route)
            .send()
            .expect(400, {
                status: 400,
                message: 'The fields login and password must be filled',
            })
    })

    test('should reject with 400 when passed body doesnt contains login', () => {
        return supertest(app)
            .post(route)
            .send({
                password: 'some password',
            })
            .expect(400, {
                status: 400,
                message: 'The fields login and password must be filled',
            })
    })

    test('should reject with 400 when passed body doesnt contains password', () => {
        return supertest(app)
            .post(route)
            .send({
                login: 'some login',
            })
            .expect(400, {
                status: 400,
                message: 'The fields login and password must be filled',
            })
    })

    test('should reject with 401 when passed login and password are invalid', () => {
        return supertest(app)
            .post(route)
            .send({
                login: 'some login',
                password: 'some password',
            })
            .expect(401, {
                status: 401,
                message: 'You have entered an invalid username or password',
            })
    })

    test('should resolve with token', () => {
        return supertest(app)
            .post(route)
            .send({
                login: 'arsdu24',
                password: 'arsdu24',
            })
            .expect(200, {
                status: 200,
                token: sign({ userId: 0 }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRE,
                }),
                user: {
                    login: 'arsdu24',
                    profile: {
                        name: 'Arsenii Dumitru',
                        age: 25,
                        email: 'arsdu24@gmail.com',
                        thumbnails: {},
                    },
                },
            })
    })
})
