document.addEventListener("DOMContentLoaded", function(){


    const list =
    document.getElementById("outfit-list");



    let outfits =
    JSON.parse(
        localStorage.getItem("outfits")
    ) || [];



    outfits.forEach(function(outfit){



        const card =
        document.createElement("div");


        card.className="outfit-card";



        card.innerHTML =

        `

        <img src="${outfit.image}" width="250">


        <p>
        日付：${outfit.date}
        </p>


        <p>
        気温：${outfit.temp}℃
        </p>


        <p>
        天気：${outfit.weather}
        </p>


        <p>
        タグ：${outfit.tag}
        </p>


        <p>
        メモ：${outfit.memo}
        </p>


        `;



        list.appendChild(card);



    });



});