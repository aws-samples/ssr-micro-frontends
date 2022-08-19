const { html, Component } = require('htm/preact');
const ReviewForm = require('./ReviewForm');

const Stars = (props) => {
    const total = 5;
    let stars2display = props.rate;
    let ui = [];
    let i;

    for(i = 0; i < total; i++){
        if(i < stars2display){
            ui.push("fa-solid fa-star")
        } else {
            ui.push("fa-regular fa-star")
        }
    }
console.log(ui)
    return html`<div>${
        ui.map(element => {
            return html`<i class="fa ${element}"></i>`
        })}</div>`;

}

class Reviews extends Component {

    render(props) {
      return html`<div id="reviews">
                    <style>
                        #reviews{
                            border-style: dashed;
                            border-color: orange;
                            border-width: thick;
                            padding: 10px;
                            margin: 10px;
                        }
                        .fa {
                            font-size: 25px;
                            color: orange;
                        }
                        #formcontainer{
                            margin: 10px
                        }
                    </style>
                    <h3>Reviews</h3>
                    <div>
                        ${      
                            props.data.map(item => {
                                
                                return html`<div>
                                            <h4>${item.title}</h4>
                                            <p>${item.description}</p>
                                            <${Stars} rate=${item.rate} />
                                            </div>`
                                        })   
                        }
                    </div>
                    <div id="formcontainer">
                    <${ReviewForm} />
                    </div>
                </div>`
    }

}

module.exports = Reviews;