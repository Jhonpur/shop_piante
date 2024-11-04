let listaCarrello = document.querySelector("#listaCarrello");

// Oggetto per il tracciamento della quantità dei prodotti
let carrello = {};

class Pagamento {
    constructor(nome, cognome, email, metodoPagamento, totale){
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;
        this.metodoPagamento = metodoPagamento;
        this.totale = totale;
    }
}

function svuotaCarrello() {
    console.log("Svuoto il carrello...");  // Aggiungi un log per verificare

    const URLCarrello = "http://localhost:3000/carrello"
    
    fetch(URLCarrello)
        .then(response => response.json())
        .then(items => {
            // Per ogni item nel carrello, fai una richiesta DELETE
            const deletePromises = items.map(item => 
                fetch(`${URLCarrello}/${item.id}`, {
                    method: 'DELETE'
                })
            );
            
            // Aspetta che tutte le eliminazioni siano completate
            return Promise.all(deletePromises);
        })
        .then(() => {
            // Dopo aver svuotato il database, aggiorna l'interfaccia
            carrello = {};  // Resetta l'oggetto carrello
            
            // Pulisci la lista nel DOM
            const listaCarrello = document.querySelector("#listaCarrello");
            if (listaCarrello) {
                listaCarrello.innerHTML = '';
            }
            
            // Resetta il totale nel DOM
            const totaleElement = document.getElementById('totale');
            if (totaleElement) {
                totaleElement.textContent = 'Totale: 0.00€';
            }
            
            console.log("Carrello svuotato con successo");
        })
        .catch(error => {
            console.error("Errore durante lo svuotamento del carrello:", error);
        });
}

function caricaCarrello(){

    const URLCarrello = "http://localhost:3000/carrello"
    let totale = 0;


    fetch(URLCarrello)
    .then(data=> {
        return data.json();
    }).then(response=>{

        response.forEach(prod => {
            totale += parseFloat(prod.prezzo);

            // Controlla se il prodotto esiste già nel carrello
            if (carrello[prod.id]) {
                carrello[prod.id].quantita += 1;  // Incrementa la quantità
            } else {
                carrello[prod.id] = {
                    nome: prod.nome,
                    prezzo: prod.prezzo,
                    quantita: 1
                };
            }
        });
        
        Object.values(carrello).forEach(item => {
            let subTotale = item.prezzo * item.quantita;
            listaCarrello.innerHTML += `<li class='list-group-item'>${item.nome} - ${item.prezzo}€ x ${item.quantita} (Subtotale: ${subTotale.toFixed(2)}€)</li>`;                
        });

        // Aggiorna il totale nel DOM
        document.getElementById(`totale`).textContent = `Totale: ${totale.toFixed(2)}€`;
    })
}

// Carica il carrello quando la pagina è pronta
document.addEventListener("DOMContentLoaded", caricaCarrello)

// Form di pagamento visibile/invisibile
document.getElementById('credit').addEventListener('change', function() {
    document.getElementById('cc-campi').style.display = 'block';
});

document.querySelectorAll('input[name="paymentMethod"]').forEach(function(input) {
    if (input.id !== 'credit') {
        input.addEventListener('change', function() {
            document.getElementById('cc-campi').style.display = 'none';
        });
    }
});

// Gestisco il form del pagamento
document.getElementById('btnPaga').addEventListener('click', function(e) {
    e.preventDefault();

    // Raccogli i dati dal form
    let nome = document.getElementById("nome").value.trim();
    let cognome = document.getElementById("cognome").value.trim();  // Corretto errore di battitura
    let email = document.getElementById("email").value.trim();
    let metodoPagamento = document.querySelector('input[name="paymentMethod"]:checked').value;
    let nomeSullaCarta = document.getElementById("nomeCard").value.trim();
    let totale = document.getElementById('totale').textContent.split(": ")[1];
    let termsAccettati = document.getElementById("termsCond").checked;
// --------------------------------------------------------------------------------------------------------------------------------
    // variabile per la convalida
    let valid = true;  
    let errorMess = "";  

    // Convalida i campi obbligatori
    if (!nome || !cognome || !email) {  // Nuova condizione per verificare se i campi sono vuoti
        valid = false;  
        errorMess += "Nome, cognome e email sono obbligatori.\n";
    }

    // Se il metodo di pagamento è carta di credito, controlla il numero della carta
    if (metodoPagamento === "Carta di credito") { 
        let numCard = document.getElementById("numCard").value.trim();  
        if (!numCard || !/^\d{16}$/.test(numCard)) {  // Nuova condizione per verificare la validità del numero della carta
            valid = false;
            errorMess += "Il numero della carta di credito deve contenere esattamente 16 numeri.\n";  
        }
        if (!nomeSullaCarta || nomeSullaCarta.split(" ").length < 2) {
            valid = false;
            errorMess += "Devi inserire sia il nome che il cognome nel campo 'Nome sulla carta'.\n";
        }
    }

    // Controlla se i termini sono accettati
    if (!termsAccettati) {  
        valid = false;
        errorMess += "Devi accettare i termini e le condizioni per procedere.\n";  
    }

    // Se ci sono errori, mostra un messaggio e interrompi l'invio
    if (!valid) {  
        alert(errorMess);
        return;  // Interrompe l'esecuzione se ci sono errori
    }
// ------------------ --------- - - - - -- - -  - - - - - - - - -- - - - -  - - -      - - -    --- - - - -  -  - -- -  -   - - -- -  -
    paga(nome, cognome, email, metodoPagamento, totale);
});

function paga(nome, cognome, email, metodoPagamento, totale) {
    // Crea l'oggetto Pagamento con i dati
    let pagamento = new Pagamento(nome, cognome, email, metodoPagamento, totale);

    const URLPagamento = "http://localhost:3000/acquisti";

    fetch(URLPagamento, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(pagamento)
    })
    .then(data => data.json())
    .then(response => {
        console.log("Pagamento salvato con successo:", response);
        return svuotaCarrello();
    }).then(() =>  {
        alert("Pagamento completato con successo!");
    })
    .catch(error => {
        console.error("Errore durante il pagamento:", error);
        alert("Si è verificato un errore durante il pagamento");
    });
}