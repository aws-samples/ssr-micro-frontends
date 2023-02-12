const { parse } = require('node-html-parser');
const { SSMClient, GetParametersCommand } = require("@aws-sdk/client-ssm");
const behaviour = require('../errorBehaviours');
const {loadFromURL, loadFromStepFunction, loadFromLambda} = require("./mfe-loader");

const APP = "ssr-mfe";
const ARN = "ARN";

const STEP_FUNCTION = "stepfunction";
const LAMBDA = "lambda";
const URL = "url";

const getMfeVO = (id, errorBehaviour, loader) => {

    if(!id || !loader)
        throw new Error("MFE tag not configured correctly, ID and loader must be defined")

    if(!errorBehaviour)
        errorBehaviour = behaviour.HIDE;

    const ssmKey = `/${APP}/${id}${ARN}`;
    let chosenLoader;

    switch(loader.toLowerCase()){
        case STEP_FUNCTION:
            chosenLoader = loadFromStepFunction
            break;
        case LAMBDA:
            chosenLoader = loadFromLambda
            break;
        case URL:
            chosenLoader = loadFromURL
            break;
        default:
            throw new Error("loader not recognised")
    }

    return {
        id:id,
        ssmKey: ssmKey,
        errorBehaviour: errorBehaviour,
        loader: chosenLoader,
        service: "",
    }
}

const getMfeElements = (root) => {
    return root.querySelectorAll("micro-frontend") || [];
}

const analyseMFEresponse = (response, behaviour) => {
    let html = "";
  
    if(response.status !== "fulfilled"){
      switch (behaviour) {
        case behaviour.ERROR:
          throw new Error()
        case behaviour.HIDE:
        default:
          html = ""
        break;
      }
    } else {
      html = response.value.body
    }
    
    return html;
  }

const getServices = async (mfeList) => {
    const list = mfeList

    const ssmKeys = list.map(element => element.ssmKey)

    const client = new SSMClient({ region: process.env.REGION });
    
    const paramCommand = new GetParametersCommand({
        Names: ssmKeys
    })

    try {
        const servicesList = await client.send(paramCommand);
        servicesList.Parameters.forEach((element, index) => list[index].service = element.Value);
        return list;
    } catch (err) {
        console.log("error to get params from SSM", err)  
        throw new Error(err);  
    }
    
}

const transformTemplate = async (html) => {
    try{
        const root = parse(html);
        const mfeElements = getMfeElements(root);
        let mfeList = [];

        // generate VOs for MFEs available in a template

        if(mfeElements.length > 0) {
            mfeElements.forEach(element => {
                mfeList.push(
                    getMfeVO(
                        element.getAttribute("id"),
                        element.getAttribute("errorbehaviour"),
                        element.getAttribute("loader")
                    )
                )
            });
        } else {
            return ""
        }

        // retrieve service to call in Parameter Store

        mfeList = await getServices(mfeList);

        // retrieve HTML fragments

        const fragmentsResponses = await Promise.allSettled(mfeList.map(element => element.loader(element.service)))

        // analyse responses

        const mfeToRender = fragmentsResponses.map((element, index) => analyseMFEresponse(element, mfeList[index].errorBehaviour))

        // transclusion in the template

        mfeElements.forEach((element, index) => element.replaceWith(mfeToRender[index]))

        return root.toString();

    } catch(error) {
        console.error("page generation failed", error)
    }

}

module.exports = {
    transformTemplate
}