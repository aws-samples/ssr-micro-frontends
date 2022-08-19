const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const REGION = process.env.Region
const ddbClient = new DynamoDBClient({ region: REGION });
const ddbDocClient = DynamoDBDocument.from(ddbClient);

const TABLE = process.env.DatabaseTable
const headers = {
    "Access-Control-Allow-Headers" : "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*"
} 
let response, postReviewParams

exports.lambdaHandler = async (event, context) => {
    const review = JSON.parse(event.body);
    
    postReviewParams = {
        TableName: TABLE,
        Item:{
            ID: review.id,
            title: review.title,
            description: review.description,
            rate: review.rate
        }    
    };

    try {
        const res = await ddbDocClient.put(postReviewParams);
        console.log(res)
        response = {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(review)
        }
    } catch (error) {
        console.error("error adding reviews in DDB")
        response = {
            statusCode: 500,
            headers: headers,
            body: error
        }
    }

    return response
}
