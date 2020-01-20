const usersFixtures: IUser[] = require('./fixtures/user.fixtures.json')
let usersCollection: User[] = []

export interface IUser {
    _id: number
    password: string
    login: string
    profile: IUserProfile
}

export interface IUserProfile {
    name: string
    age: number
    email: string
    thumbnails: { [k: string]: string }
}

export class User {
    private password: string

    readonly _id: number

    login: string
    profile: IUserProfile

    constructor(user: IUser) {
        this._id = user._id
        this.login = user.login
        this.password = user.password
        this.profile = user.profile
    }

    matchCredentials(login: string, password: string): boolean {
        return login === this.login && password === this.password
    }

    async save(): Promise<User> {
        const userIndex: number = usersCollection.findIndex(
            user => user === this
        )

        if (-1 === userIndex) {
            usersCollection.push(this)
        }

        return this
    }

    async detele(): Promise<boolean> {
        const usersLenght: number = usersCollection.length

        usersCollection = usersCollection.filter(user => user !== this)

        return usersLenght !== usersCollection.length
    }

    static async findByLoginAndPasswordOrFail(
        login: string,
        password: string
    ): Promise<User> {
        const user: User | undefined = usersCollection.find(user =>
            user.matchCredentials(login, password)
        )

        if (!user) {
            throw new Error('User Not Found')
        }

        return user
    }

    static async findByIdOrFail(id: number): Promise<User> {
        const user: User | undefined = usersCollection.find(
            user => user._id === id
        )

        if (!user) {
            throw new Error('User Not Found')
        }

        return user
    }
}

usersCollection = usersFixtures.map(user => new User(user))
