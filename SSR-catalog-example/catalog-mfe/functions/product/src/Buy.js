const { html, Component } = require('htm/preact');

class Buy extends Component {

    state = {}

    componentDidMount = () => {
        this.setState({book: this.props.data})
    }

    addToCart = (e) =>{
        e.preventDefault();
        
        window.emitter.emit("AddToCartEvent", {
            id: this.state.book.id,
            title: this.state.book.title,
            qty: this.state.book.qty,
            price: this.state.book.price
        })
    }

    render(props) {
      return html`<a href="#" onclick=${this.addToCart}>
                    <h3><i class="fa-solid fa-cart-plus"></i> BUY NOW</h3>
                  </a>`
    }

}

module.exports = Buy;