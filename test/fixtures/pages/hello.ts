/* eslint-env browser */
const mydiv = document.createElement('div');
mydiv.setAttribute('id', 'hello');
mydiv.innerText = 'TITLE IS ' + document.title;
document.body.appendChild(mydiv);
