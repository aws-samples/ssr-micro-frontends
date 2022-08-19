import {h, hydrate} from 'preact';
import ReviewForm from './ReviewForm';

hydrate(<ReviewForm />, document.getElementById('formcontainer'));