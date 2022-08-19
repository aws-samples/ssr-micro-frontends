import {h, render} from 'preact';
import { useState } from 'preact/hooks';
import { styled, setup } from 'goober';

setup(h);

const Background = styled("div")(props => `
	background: orange;
	width: 100%;
	height: 80px;
	color: white;
	padding: 5px;
	text-align: center;
	position: absolute;
	display: ${props.visible};
`)

export default function Notification() {
	const [isVisible, setVisibility] = useState("none")
	const [book, setBookData] = useState({})
	
	const emitter = window.emitter;
	let timeout;

	emitter.on("AddToCartEvent", (book) => {
		setBookData(book)
		setVisibility("block")
		timeout = setTimeout(() => {
			clearInterval(timeout)
			setVisibility("none");
			setBookData({})
		}, 8000);
	})

	return (
		<Background visible={isVisible}>
			<h3>You have just added {book.title} in your cart</h3>
			<p>This book costs <b>${book.price}</b></p>
		</Background>
	);
}

render(<Notification />, document.getElementById('noitificationscontainer'));