/* eslint-env browser */
import {myclass} from './app3.css';

const mydiv = document.createElement('div');
mydiv.setAttribute('id', 'hello');
mydiv.className = myclass;
mydiv.innerText = 'APP 3';
document.body.appendChild(mydiv);
