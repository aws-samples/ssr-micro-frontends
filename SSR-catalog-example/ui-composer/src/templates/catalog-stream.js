const fetch = require('cross-fetch');
const Ordered = require('ordered-read-streams');
const { Readable } = require('stream');

const getMFEStream = async (url) => {
  const stream = new Readable({
    read(size) {
      return true
    }
  }
  );
  
  fetch(url).then(res => {
    console.log(".....", res.value.text())
    stream.push(res.value.text())
    // stream.push(null)
  }).catch(err => {
    // stream.push(null)
  })

  return stream
}

const catalog = (list) => {
    
    const header = `<!DOCTYPE html>
    <html>
    <head>
      <title>AWS micro-frontends</title>
      <script src="https://cdn.jsdelivr.net/npm/preact@10.10.0/dist/preact.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.min.js"></script>
      <script async src="https://kit.fontawesome.com/09fc766a8c.js" crossorigin="anonymous"></script>
      <style>
        body{
          font-family: Helvetica, sans-serif;
        }  
        .logo {
          color: white;
          display: inline-block;
          font-size: 25px;
          margin: 5px
        }
        header {
          width: 100%;
          height: 40px;
          background-color: grey
        } 
      </style>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="Server-Side Rendering Example using Micro-Frontends in AWS">
    </head>
    <body>
      <header>
        <i class="logo fa-brands fa-aws"></i>
      </header>`
    const footer = `</body></html>`

    const headerStream = Readable.from([header])
    const footerStream =  Readable.from([footer])
    
    const catalogStream = getMFEStream(list.catalogURL)
    const reviewsStream = getMFEStream(list.reviewURL)
    
    const readOrderedStream = new Ordered([headerStream, catalogStream, reviewsStream, footerStream]);
    return readOrderedStream
}

module.exports = catalog