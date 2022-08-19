const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const init = async () => {
    //for local testing start: REGION=eu-west-1 node ./src/app.js
    const client = new SSMClient({ region: process.env.REGION });
    
    const paramCommand = new GetParameterCommand({
        Name: '/ssr-mfe/catalogpage'
    })

    try {
        const MFEList = await client.send(paramCommand);
        return JSON.parse(MFEList.Parameter.Value);
    } catch (err) {
        console.log("error to get params from SSM", err)  
        throw new Error(err);  
    }
}

module.exports = init;
