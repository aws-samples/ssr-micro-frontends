const fs = require('fs/promises');
const {transformTemplate} = require('./src/utils/html-transformer');

const loadHTML = async () => {
    try {
      const data = await fs.readFile(__dirname + '/static/catalog.template', { encoding: 'utf8' });
      transformTemplate(data);

    } catch (err) {
      console.log(err);
    }
  }

loadHTML();
