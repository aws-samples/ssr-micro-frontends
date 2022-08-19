const { LambdaClient, InvokeCommand, InvocationType } = require("@aws-sdk/client-lambda");
const { SFNClient, StartSyncExecutionCommand } = require("@aws-sdk/client-sfn");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const axios = require('axios');

// const localdev = {
//     credentials: {
//         accessKeyId: "xxx",
//         secretAccessKey: "xxx"
//     },
//     region: "eu-west-1"
// }

const loadFromURL = async (url, payload = {}) => {
    let res
    
    try {
        res = await axios.get(url, payload)
    } catch (error) {
        throw new Error(`Error loading ${url} ! details ${error}`)
    }
    
    return {
        statusCode: res.status,
        body: res.data
    }
}
const loadFromStepFunction = async (arn, payload = {}) => {
    try {
        // const client = new SFNClient(localdev);
        const client = new SFNClient();
        const command = new StartSyncExecutionCommand({
            stateMachineArn: arn,
            index: JSON.stringify(payload)
        });
        
        const sfnResponse = await client.send(command);
        
        if(sfnResponse.status === "SUCCEEDED"){
            const data = {
                statusCode: 200,
                body: JSON.parse(sfnResponse.output)
            }
            return data
        } else {
            throw new Error(`${arn} called but error ${sfnResponse.status}`); 
        }

    } catch (error) {
        throw new Error(`Error for ${arn} step function called! details ${error}`);
    }
}
const loadFromLambda = async (arn, payload = {}) => {
    try {
        // const lambdaClient = new LambdaClient(localdev);
        const lambdaClient = new LambdaClient();
        const invokeCommand = new InvokeCommand({
            FunctionName: arn,
            InvocationType: InvocationType.RequestResponse,
            Payload: JSON.stringify(payload),
        });
    
        const response = await lambdaClient.send(invokeCommand);
    
        if(response.StatusCode < 400){
            const payload = Buffer.from(response.Payload).toString();
            const data = {
                statusCode: response.StatusCode,
                body: JSON.parse(payload).body
            }
            return data;
        } else {
            throw new Error(`${arn} called but error ${response.StatusCode}`);
        } 
    } catch (error) {
        throw new Error(`Error for ${arn} function called! details ${error}`);
    }
}

const loadFromS3 = async (key, bucket) => {
    
    // const client = new S3Client(localdev);
    const client = new S3Client();
    
    try {
        const command = new GetObjectCommand({
            Key: key,
            Bucket: bucket
        });

        const response = await client.send(command);
        const stream = response.Body;

        return new Promise((resolve, reject) => {
            const chunks = []
            stream.on('data', chunk => chunks.push(chunk))
            stream.once('end', () => resolve(Buffer.concat(chunks).toString()))
            stream.once('error', reject)
        })
    } catch (error) {
        console.error(error)
    }
   
}

module.exports = {
    loadFromURL,
    loadFromStepFunction,
    loadFromLambda,
    loadFromS3
}