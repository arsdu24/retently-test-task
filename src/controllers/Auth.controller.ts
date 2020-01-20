import { Router, Request, Response } from 'express'
import { User } from '../models'
import { sign } from 'jsonwebtoken'

const { JWT_SECRET, JWT_EXPIRE } = process.env

interface ILoginRequestBody {
    login?: string
    password?: string
}

export const AuthControllerRouter: Router = Router()

AuthControllerRouter.post<{}, {}, ILoginRequestBody>(
    '/login',
    async ({ body: { login, password } }: Request, response: Response) => {
        let responseStatus: number = 200
        let responseBody: object = {}

        if (login && password) {
            try {
                const user: User = await User.findByLoginAndPasswordOrFail(
                    login,
                    password
                )
                const token: string = sign({ userId: user._id }, JWT_SECRET, {
                    expiresIn: JWT_EXPIRE,
                })

                responseBody = {
                    status: responseStatus,
                    token,
                    user: {
                        ...user,
                        password: undefined,
                        _id: undefined,
                    },
                }
            } catch (error) {
                responseStatus = 401
                responseBody = {
                    status: 401,
                    message: 'You have entered an invalid username or password',
                }
            }
        } else {
            responseStatus = 400
            responseBody = {
                status: 400,
                message: 'The fields login and password must be filled',
            }
        }

        response.status(responseStatus).json(responseBody)
    }
)
