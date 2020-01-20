import { Request, Response, NextFunction } from 'express'
import { verify, VerifyOptions, JsonWebTokenError } from 'jsonwebtoken'
import { User } from '../models'

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export interface AuthMiddlewareOptions {
    secret: string
    excludedPath: string[]
}

export function authMiddleware({
    secret,
    excludedPath,
}: AuthMiddlewareOptions) {
    return async (
        request: Request,
        _res: Response,
        next: NextFunction
    ): Promise<void> => {
        if (excludedPath.includes(request.url)) {
            return void next()
        }

        if (!request.headers.authorization) {
            return void next(
                new JsonWebTokenError('Missing Authorization Header')
            )
        }

        const [bearer, jwt] = request.headers.authorization.split(' ')

        if (!bearer.trim().match(/^bearer$/)) {
            return void next(
                new JsonWebTokenError('Wrong Scheme of Authorization Header')
            )
        }

        try {
            const decoded: { userId?: number } | string = verify(jwt, secret)

            if (typeof decoded === 'object' && 'userId' in decoded) {
                const userId: number = decoded.userId

                request.user = await User.findByIdOrFail(userId)

                return void next()
            }

            return void next(
                new JsonWebTokenError('Missing required auth data')
            )
        } catch (err) {
            return void next(new JsonWebTokenError(err.message))
        }
    }
}
