/* eslint-env browser */
const mydiv = document.createElement('div');
mydiv.setAttribute('id', 'hello');
mydiv.innerText = `Initially`;
document.body.appendChild(mydiv);

setTimeout(async() => {
	const {mymodule} = await import('mymodule');
	mydiv.innerText = `Delayed ${mymodule(123)}`;
});
