function displayProducts(){
    let productsArea = $("#products-area").find("div");
    productsArea.empty();

    fetch('data/products.json')
    .then((response) => response.json())
    .then(function(json){
        console.log(json);
    });

    let row = "<div class='col-3 my-3'>"
        + "<div> <img class='img-fluid rounded img-thumbnail p-2 border-0 shadow-sm' src='https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96804.jpg' alt='Image not Available'> </div>"
        + "<div class='row mt-4 mb-2 mx-2'> <b>AirPods Max</b> <b class='ml-auto'>$550.49</b> </div>"
        + "<div class='row mx-2'> Wired Stereo headset with mic </div>"
        + "<div class='row mx-2 my-2 align-items-baseline'> <i class='fa fa-star'></i> <i class='fa fa-star'></i> <i class='fa fa-star'></i> <i class='fa fa-star-o'></i> <i class='fa fa-star-o'></i> <span class='ml-1'>(121)</span> </div>"
        + "<button class='border btn btn-outline-secondary btn-sm mx-2 my-1 px-4 py-2 rounded-pill'>Add to cart</button>"
        + "</div>";
    
    for(let i = 0 ; i < 15; i++) { 
        productsArea.append(row);
    }
}

function init(){
	displayProducts();
}

$(document).ready(init);