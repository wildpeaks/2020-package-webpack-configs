/* eslint-env browser */
import {myclass} from './myapp.css';

const mydiv = document.createElement('div');
mydiv.setAttribute('id', 'hello');
mydiv.className = myclass;
mydiv.innerText = 'Hello World';
document.body.appendChild(mydiv);
