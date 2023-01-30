const fastify = require('fastify')({ logger: true })
const { Readable } = require('stream');
const catalog = require("./templates/catalog");
const init = require('./config');
const { notFoundPage, serverErrorPage } = require('./templates/staticPages');
const { loadFromS3 } = require("./utils/mfe-loader");

const PORT = process.env.PORT || 3000;
let MFElist, catalogTemplate

const responseStream = (str, code, reply) => {
  
  reply.header('Content-Type', 'application/octet-stream');
  reply.raw.writeHead(code, { 'Content-Type': 'text/html' });

  const stream = Readable.from([str]);
 
  stream.on('data', chunk => {
    reply.raw.write(chunk.toString());
  })

  stream.on('end', () => {
    reply.raw.end();
  })
}

fastify.get('/', async (request, reply) => {
    reply.code(200).send({
      message: "Welcome to the Micro-Frontends in AWS example"  
    })
})

fastify.setErrorHandler(function (error, request, reply) {
    responseStream(serverErrorPage(), 500, reply)
})

fastify.setNotFoundHandler({}, (request, reply) => {
    responseStream(notFoundPage(), 404, reply)
})

fastify.get('/error', async (request, reply) => {
  throw new Error('Error')
})

fastify.get('/health', async(request, reply) => {
  reply.code(200).send({healthy: true})
})

fastify.get('/home', async(request, reply) => {
  try{
    const catalogpage = await catalog(MFElist, catalogTemplate)
    responseStream(catalogpage, 200, reply)
  } catch(err){
    console.log(err)
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
    fastify.log.error(err)
    process.exit(1)
  }
}
start();