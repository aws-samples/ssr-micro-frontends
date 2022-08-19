const {render} = require('preact-render-to-string');
const { html } = require('htm/preact');
const { unmarshall } = require("@aws-sdk/util-dynamodb");
const Buy = require('./src/Buy');

exports.lambdaHandler = async (event, context) => {

    const book = unmarshall(event);

    const state = `<script>window.__BOOK__='${JSON.stringify({
      title: book.title,
      price: book.price,
      author: book.author
    })}'</script>`
  
    const catalogMFE = render(html`<div id="product">
                                   <script src="./static/buy.js" defer></script>
                                   <style>
                                      #product{
                                          border-style: dashed;
                                          border-color: green;
                                          border-width: thick;
                                          padding: 10px;
                                          margin: 10px;
                                      }                                  
                                   </style>  
                                   <h1>${book.title}</h1>
                                   <h4>Author: ${book.author}</h4>
                                      <img alt="${book.title} cover" width="250px" src=${book.cover} />
                                      <div id="buycontainer">
                                        <${Buy} data=${book}/>
                                      </div>
                                      ${book.description}
                                      <h3>Price: $${book.price}</h3>
                                  </div>`).concat(state).replace(/&lt;/g,"<").replace(/&gt;/g,">");

    return catalogMFE;

};