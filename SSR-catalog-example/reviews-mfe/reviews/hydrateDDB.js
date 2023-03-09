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
    
    if (RequestType.toLowerCase() === 'create') {
        postBookParams = {
            TableName: TABLE,
            Item:{
                ID: "1234",
                title: "Wonderful book",
                description: "Probably the best book on this topic!",
                rate: 5
            }    
        };

        try {
            const res = await ddbDocClient.put(postBookParams);
            response = await axios.put(ResponseURL, buildResponse(event, context, "SUCCESS"))
            
        } catch (error) {
            console.error("error adding reviews in DDB from custom resource", error);
            response = await axios.put(ResponseURL, buildResponse(event, context, "FAILED"))
        }
    } else {

        response = await axios.put(ResponseURL, buildResponse(event, context, "SUCCESS"))
        
    }

    return response

}