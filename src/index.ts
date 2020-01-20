import { app } from './router'

const { SERVER_HOST, SERVER_PORT } = process.env

app.listen(+SERVER_PORT, SERVER_HOST, () => {
    console.log(
        `\n\n\nExpress Server started at http://${SERVER_HOST}:${SERVER_PORT}\n\n\n`
    )
})
