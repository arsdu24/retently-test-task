import { Router, Response, Request, NextFunction } from 'express'
import { UserControllerRouter, AuthControllerRouter } from './controllers'
import { json } from 'body-parser'
import { authMiddleware } from './middlewares'
import { JsonWebTokenError } from 'jsonwebtoken'
import * as E from 'express'

const { JWT_SECRET } = process.env

export const app: E.Application = E()

app.use(json())
app.use(authMiddleware({ secret: JWT_SECRET, excludedPath: ['/auth/login'] }))

app.use('/auth', AuthControllerRouter)
app.use('/users', UserControllerRouter)

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof JsonWebTokenError) {
        return res.status(401).json({ status: 401, message: 'Unauthorized' })
    }

    return res.status(500).json({ status: 500, message: err.message })
})
