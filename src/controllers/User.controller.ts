import { Router, Request, Response } from 'express'
import { User } from '../models'
import uuid = require('uuid')
import { resolve } from 'url'
import sharp = require('sharp')
import * as BusBoy from 'busboy'
import { createWriteStream, ReadStream, WriteStream } from 'fs'

interface IUploadFile {
    uuid: string
    path: string
    type: string
}

interface IThumnbailSize {
    name: string
    x: number
    y: number
}

const allowedThumbnailsSizes: IThumnbailSize[] = process.env.ALLOWED_THUMBNAIL_SIZES.split(
    ','
)
    .filter((key: string | undefined): boolean => key && key in process.env)
    .map((key: string): string[] => [
        key.replace(/^thumbnail_(xs|sm|md|lg)$/i, '$1').toLowerCase(),
        process.env[key],
    ])
    .map(
        ([name, size]: string[]): IThumnbailSize => ({
            name,
            x: Number(size.replace(/^(\d+)x.+$/i, '$1')),
            y: Number(size.replace(/^.+x(\d+)$/i, '$1')),
        })
    )

export const UserControllerRouter: Router = Router()

UserControllerRouter.post(
    '/thumbnails',
    async (request: Request, response: Response) => {
        const user: User = request.user!
        const thumbnailDir: string = resolve(__dirname, `../public/thumbnails`)
        const busboy = new BusBoy({ headers: request.headers })
        let file: IUploadFile | undefined

        busboy.on('file', function(
            fieldname: string,
            fileStream: ReadStream,
            _filename,
            _encoding,
            mimetype: string
        ) {
            if ('thumbnail' === fieldname) {
                const thumbnailUuid: string = uuid()
                const type: string = mimetype.replace(/^.+\/(\w+)$/, '$1')
                const path: string = resolve(
                    `${thumbnailDir}/`,
                    `./${thumbnailUuid}_original.${type}`
                )

                file = {
                    uuid: thumbnailUuid,
                    path,
                    type,
                }

                fileStream.pipe(createWriteStream(path))
            } else {
                fileStream.on('data', () => {})
                fileStream.on('end', () => {})
            }
        })

        busboy.on('finish', async () => {
            if (file) {
                const thumbnailsEntries: string[][] = await Promise.all(
                    allowedThumbnailsSizes.map(
                        async ({
                            name,
                            x,
                            y,
                        }: IThumnbailSize): Promise<string[]> => {
                            const thumbnailPath: string = resolve(
                                `${thumbnailDir}/`,
                                `./${file.uuid}_${name}.${file.type}`
                            )

                            await sharp(file.path)
                                .resize(x, y)
                                .toFile(thumbnailPath)

                            return [name, thumbnailPath]
                        }
                    )
                )

                user.profile.thumbnails = thumbnailsEntries.reduce(
                    (all, [key, value]) => ({ ...all, [key]: value }),
                    {}
                )

                await user.save()

                return void response.status(200).json({
                    ...user,
                    password: undefined,
                    _id: undefined,
                })
            }

            return void response.status(400).json({
                status: 400,
                message: 'File missing',
            })
        })

        return request.pipe(busboy)
    }
)

UserControllerRouter.get(
    '/thumbnails',
    (request: Request, response: Response) => {
        const user: User = request.user!

        response.status(200).json(Object.values(user.profile.thumbnails))
    }
)

UserControllerRouter.get<{ size: string }>(
    '/thumbnails/:size',
    (request: Request, response: Response) => {
        const user: User = request.user!
        const { size } = request.params

        if (size in user.profile.thumbnails) {
            return void response
                .status(200)
                .sendFile(user.profile.thumbnails[size])
        }

        return void response.status(404).json({
            status: 404,
            message: 'Thumbnail was not found',
        })
    }
)
