const { html, Component } = require('htm/preact');
const fetch = require('cross-fetch');
const {v4: uuidv4} = require("uuid");

class Form extends Component {
    state = {}

    componentDidMount = () => {
        this.setState({id: uuidv4()})
    }

    submitReview = async (e) => {
        e.preventDefault();
        const form = this.state;
        const body = {
            id: form.id,
            title: form.title,
            description: form.review,
            rate: form.rate
        }

        const res = await fetch(
            'https://aq621ipn63.execute-api.eu-west-1.amazonaws.com/Prod/review',
            {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    
        if (res.status >= 400) {
            throw new Error("Bad response from server");
        }
        
        const data = await res.json();

        location.reload();
    }

    cancelReview = (e) => {
        e.preventDefault();
        this.setState({});
    }

    updateState = (e) => {
        this.setState({ [e.target.id]: e.target.value });
    }

    render(){
        return html`<div>
            <style>
                .reviewForm {
                    width: 100%;
                    margin: 10px;
                }
                select {
                    width:100px;
                }
            </style>
            <form class="reviewForm">
                    <label for="title">Title:</label><br />
                    <input type="text" id="title" name="title" onfocusout=${this.updateState} />
                <br />
                    <label for="review">Review:</label><br />
                    <input type="text" id="review" name="review" onfocusout=${this.updateState} />
                <br />
                    <label for="rate">Rate:</label><br />
                    <select id="rate" name="rate" onchange=${this.updateState}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                <br /><br />
                    <input type="submit" value="Submit" onclick=${this.submitReview}/>
                    <input type="button" value="Cancel" onclick=${this.cancelReview} />
            </form>
        </div>`
    }
}

class ReviewForm extends Component {

    state = { showForm: false };

    onClick = () => {
        this.setState({ showForm: true });
    }

    render(props){
        return html`<div>
                        <button onClick=${this.onClick}>Review this product</button>
                        ${this.state.showForm ? html`<${Form} />`: ""}
                        <script src="./static/reviews.js" defer></script>
                    </div>`
    }
}

module.exports = ReviewForm;