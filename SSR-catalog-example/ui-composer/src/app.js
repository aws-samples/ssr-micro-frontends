const fastify = require('fastify')({ logger: true })
const createError = require('@fastify/error');
const {transformTemplate} = require('./utils/html-transformer');
const init = require('./config');
const { notFoundPage, serverErrorPage } = require('./templates/staticPages');
const { loadFromS3 } = require("./utils/mfe-loader");

const PORT = process.env.PORT || 3000;
let MFElist, catalogTemplate

fastify.get('/home', async (request, reply) => {
  return reply
    .code(200)
    .header('content-type', 'text/html')
    .send("Welcome to the Micro-Frontends in AWS example")
})

fastify.setErrorHandler(function (error, request, reply) {
  return reply
    .code(500)
    .header('content-type', 'text/html')
    .send(serverErrorPage())
})

fastify.setNotFoundHandler({}, (request, reply) => {
  return reply
    .code(404)
    .header('content-type', 'text/html')
    .send(notFoundPage())
})

fastify.get('/health', async(request, reply) => {
  return reply
    .code(200)
    .send({healthy: true})
})

fastify.get('/productdetails', async(request, reply) => {
  try{
    const catalogDetailspage = await transformTemplate(catalogTemplate)
    return reply
      .code(200)
      .header('content-type', 'text/html')
      .send(catalogDetailspage)
  } catch(err){
    request.log.error(createError('500', err))
    throw new Error(err)
  }
})

const start = async () => {
  try {
    //load parameters
    MFElist = await init();
    //load catalog template
    catalogTemplate = await loadFromS3(MFElist.template, MFElist.templatesBucket)
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(createError('500', err))
    process.exit(1)
  }
}

start();