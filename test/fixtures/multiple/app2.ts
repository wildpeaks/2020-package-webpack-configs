/* eslint-env browser */
import {myclass} from './app2.css';

const mydiv = document.createElement('div');
mydiv.setAttribute('id', 'hello');
mydiv.className = myclass;
mydiv.innerText = 'APP 2';
document.body.appendChild(mydiv);
