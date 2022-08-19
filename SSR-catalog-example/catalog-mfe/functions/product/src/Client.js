import {h, hydrate} from 'preact';
import Buy from './Buy';

const bookData = JSON.parse(window.__BOOK__);

hydrate(<Buy data={bookData} />, document.getElementById('buycontainer'));