//  creo una funzione per caricare le informazioni delle piante sulla index
class Pianta{
    constructor(id, name, price, descalt, image){
        this.id = id
        this.name = name
        this.price = price
        this. descalt = descalt
        this.image = image
    }
}

class ObjCarrello {
    constructor(id, prezzo, nome){
        this.id = id;
        this.prezzo = prezzo;
        this.nome = nome;
    }
}

function caricaPiante() {
    
    const URL = "http://localhost:3000/plants";

    fetch(URL)
    .then(data =>{
        return data.json();
    }).then(response =>{
        console.log(response);
        response.forEach(pianta => {
            let miaPianta = new Pianta(pianta.id, pianta.name, pianta.price, pianta.descAlt, pianta.image)
            rigaProd.appendChild(creaCard(miaPianta));
        });
    })
}

document.addEventListener("DOMContentLoaded", caricaPiante);

let rigaProd = document.querySelector("#rigaProd");

function creaCard(pianta) {
    // let card = `<div class="col-4 mb-3">
    //                 <div class="card">
    //                 <img class="card-img-top" src=${pianta.image} alt=${pianta.descalt} />
    //                     <div class="card-body">
    //                         <h3 class="card-title">${pianta.name}</h3>
    //                         <p class="card-text">${pianta.id}<p>
    //                         <button id='mioBtn${pianta.id}' class="btn btn-primary">Compra a ${pianta.price} €</button>
    //                     </div>
    //                 </div>
    //             </div>`;
    
    let cardCol = document.createElement("div");
    cardCol.setAttribute("class", "col-md-4 mb-3");

    let card = document.createElement("div");
    card.setAttribute("class", "card");

    card.innerHTML =  `<img class="card-img-top d-flex" src=${pianta.image} alt=${pianta.descalt}' />
                        <div class="card-body">
                            <h3 class="card-title">${pianta.name}</h3>
                            <p class="card-text">ID: ${pianta.id}</p>
                        </div>`;

    let buttonCompra = document.createElement("button");
    buttonCompra.setAttribute("class", "btn btn-primary");
    buttonCompra.textContent = `Compra ${pianta.price} €`;

    buttonCompra.addEventListener("click", function(){
        addCarrello(pianta.id, pianta.price, pianta.name)
    });

    card.appendChild(buttonCompra);
    cardCol.appendChild(card);

    return cardCol;
}


    function addCarrello (id, prezzo, name){
        // fetch method POST
        console.log(id, prezzo, name);
        let objCarrello = new ObjCarrello (id, prezzo, name);

        const URLCarrello = "http://localhost:3000/carrello"

        fetch(URLCarrello, {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(objCarrello)
        }).then(data =>{
            return data.json();
        })
    }

    



