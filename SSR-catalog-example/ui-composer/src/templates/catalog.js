const behaviour = require('../errorBehaviours');
const MFEloader = require('../utils/mfe-loader'); 
const template = require("es6-dynamic-template");

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

const catalog = async (list, pageTemplate) => {
    const [review, catalog] = await Promise.allSettled([MFEloader.loadFromLambda(list.reviewURL), MFEloader.loadFromStepFunction(list.catalogURL)])

    const page = template(pageTemplate, {
      catalog: analyseMFEresponse(catalog, behaviour.ERROR),
      review: analyseMFEresponse(review, behaviour.HIDE)
    });

    return page
}

module.exports = catalog