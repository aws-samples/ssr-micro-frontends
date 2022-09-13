const serverError = () => {
    return `<html>
            <head>
                <title>Error page MFE SSR</title>
            </head>
            <body>
                <h1>Error page, something went wrong...</h1>
            </body>
        </html>`
}

const notFound = () => {
        return `<html>
            <head>
                <title>404 MFE SSR</title>
            </head>
            <body>
                <h1>404 | Page not found</h1>
            </body>
        </html>`

}

module.exports = {
    notFoundPage: notFound,
    serverErrorPage: serverError,
}