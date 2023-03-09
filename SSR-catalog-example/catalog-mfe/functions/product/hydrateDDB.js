const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");
const axios = require('axios');

const REGION = process.env.Region;
const TABLE = process.env.DatabaseTable;
const ddbClient = new DynamoDBClient({ region: REGION});
const ddbDocClient = DynamoDBDocument.from(ddbClient);

const buildResponse = (event, context, status) => {
    const { RequestId, LogicalResourceId, StackId } = event;
    const { logStreamName } = context; 

    const response = {
        Status: status,
        Reason: "Check CloudWatch Log Stream: " + logStreamName,
        PhysicalResourceId: logStreamName,
        Data: {},
        RequestId: RequestId,
        LogicalResourceId: LogicalResourceId,
        StackId: StackId
    }

    return JSON.stringify(response);
}

exports.lambdaHandler = async (event, context) => {
    
    const { RequestType, ResponseURL } = event;
    let response;
    
    // if (RequestType.toLowerCase() === 'create') {
    if (RequestType.toLowerCase() !== 'delete') {
        postBookParams = {
            TableName: TABLE,
            Item:{
                ID: "book-0001",
                title: "Building Micro-Frontends",
                price: "39.99",
                author: "Luca Mezzalira",
                cover: "./static/book.jpg",
                description: `<p>What's the answer to today's increasingly complex web applications? Micro-frontends. Inspired by the microservices model, this approach lets you break interfaces into separate features managed by different teams of developers. With this practical guide, Luca Mezzalira shows software architects, tech leads, and software developers how to build and deliver artifacts atomically rather than use a big bang deployment.

                You'll learn how micro-frontends enable your team to choose any library or framework. This gives your organization technical flexibility and allows you to hire and retain a broad spectrum of talent. Micro-frontends also support distributed or colocated teams more efficiently. Pick up this book and learn how to get started with this technological breakthrough right away.</p>      
                <ul>
                    <li>Explore available frontend development architectures</li>
                    <li>Learn how microservice principles apply to frontend development</li>
                    <li>Understand the four pillars for creating a successful micro-frontend architecture</li>
                    <li>Examine the benefits and pitfalls of existing micro-frontend architectures</li>
                    <li>Learn principles and best practices for creating successful automation strategies</li>
                    <li>Discover patterns for integrating micro-frontend architectures using microservices or a monolith API layer</li>
                </ul>`
            }    
        };

        try {
            const res = await ddbDocClient.put(postBookParams);
            response = await axios.put(ResponseURL, buildResponse(event, context, "SUCCESS"))
            
        } catch (error) {
            console.error("error adding product details in DDB from custom resource", error);
            response = await axios.put(ResponseURL, buildResponse(event, context, "FAILED"))
        }
    } else {

        response = await axios.put(ResponseURL, buildResponse(event, context, "SUCCESS"))
        
    }

    return response

}