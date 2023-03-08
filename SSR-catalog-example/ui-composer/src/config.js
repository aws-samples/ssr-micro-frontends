const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

const init = async () => {

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
