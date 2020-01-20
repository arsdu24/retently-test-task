import { User } from '../../../src/models'

describe('User Module', () => {
    describe('static', () => {
        describe('#findByLoginAndPasswordOrFail', () => {
            test('should throw error when no user found by passed login and password', async () => {
                await expect(
                    User.findByLoginAndPasswordOrFail(
                        'some login',
                        'some password'
                    )
                ).rejects.toBeInstanceOf(Error)
            })

            test('should resolve user when there is an user matching passed login and password', async () => {
                const login: string = 'some login'
                const password: string = 'some password'
                const user: User = new User({
                    _id: -1,
                    login,
                    password,
                    profile: {
                        age: 25,
                        email: 'arsdu24@gmail.com',
                        name: 'Arsenii Dumitru',
                        thumbnails: {},
                    },
                })

                user.save()

                await expect(
                    User.findByLoginAndPasswordOrFail(login, password)
                ).resolves.toBe(user)
            })
        })
        describe('#findByIdOrFail', () => {
            test('should throw error when no user found by passed id', async () => {
                await expect(User.findByIdOrFail(-2)).rejects.toBeInstanceOf(
                    Error
                )
            })

            test('should resolve user when there is an user matching id', async () => {
                const user: User = new User({
                    _id: -2,
                    login: 'some login',
                    password: 'some password',
                    profile: {
                        age: 25,
                        email: 'arsdu24@gmail.com',
                        name: 'Arsenii Dumitru',
                        thumbnails: {},
                    },
                })

                user.save()

                await expect(User.findByIdOrFail(-2)).resolves.toBe(user)
            })
        })
    })

    describe('save', () => {
        test('should add the new created user to the collection and ensure search by id', async () => {
            await expect(User.findByIdOrFail(-3)).rejects.toBeInstanceOf(Error)

            const user: User = new User({
                _id: -3,
                login: 'some login',
                password: 'some password',
                profile: {
                    age: 25,
                    email: 'arsdu24@gmail.com',
                    name: 'Arsenii Dumitru',
                    thumbnails: {},
                },
            })

            await expect(User.findByIdOrFail(-3)).rejects.toBeInstanceOf(Error)

            user.save()

            await expect(User.findByIdOrFail(-3)).resolves.toBe(user)
        })
    })

    describe('delete', () => {
        test('should remove the deleted user from the collection and ensure search by id without them', async () => {
            await expect(User.findByIdOrFail(-4)).rejects.toBeInstanceOf(Error)

            const user: User = new User({
                _id: -4,
                login: 'some login',
                password: 'some password',
                profile: {
                    age: 25,
                    email: 'arsdu24@gmail.com',
                    name: 'Arsenii Dumitru',
                    thumbnails: {},
                },
            })

            await expect(User.findByIdOrFail(-4)).rejects.toBeInstanceOf(Error)

            user.save()

            await expect(User.findByIdOrFail(-4)).resolves.toBe(user)

            user.detele()

            await expect(User.findByIdOrFail(-4)).rejects.toBeInstanceOf(Error)
        })
    })
})
