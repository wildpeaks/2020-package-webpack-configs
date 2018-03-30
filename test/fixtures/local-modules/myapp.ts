/* eslint-env browser */
import {mymodule} from 'mymodule';

const mydiv = document.createElement('div');
mydiv.setAttribute('id', 'hello');
mydiv.innerText = `Hello ${mymodule(123)}`;
document.body.appendChild(mydiv);
