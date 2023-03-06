const {render} = require('preact-render-to-string');
const { html } = require('htm/preact');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const Reviews = require("./src/Reviews")

const REGION = process.env.Region
const ddbClient = new DynamoDBClient({ region: REGION});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

const readAllParams = {
  TableName: process.env.DatabaseTable
};

let reviews, response

exports.lambdaHandler = async (event, context) => {
  try {
    reviews = await ddbDocClient.scan(readAllParams)

    const reviewsMFE = render(html`<${Reviews} data="${reviews.Items}" />`)
    response = {
        statusCode: 200,
        headers: {"content-type": "text/html"},
        body: reviewsMFE
    }
  } catch (error) {
    console.error("error creating the DOM");
    return error;
  }

  return response
};
