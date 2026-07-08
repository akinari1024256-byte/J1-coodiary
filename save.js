document.addEventListener("DOMContentLoaded", function(){


    // プレビュー表示

    const image =
    localStorage.getItem("coordinateImage");


    if(image){

        document.getElementById("previewArea").innerHTML =

        `
        <img src="${image}" width="300">
        `;

    }



    // 保存ボタン

    const finishSave =
    document.getElementById("finishSave");


    finishSave.addEventListener("click", function(){



        const outfit = {


            image:
            localStorage.getItem("coordinateImage"),


            date:
            document.getElementById("date").value,


            temp:
            document.getElementById("temp").value,


            weather:
            document.getElementById("weather").value,


            tag:
            document.getElementById("tag").value,


            memo:
            document.getElementById("memo").value


        };



        // 保存済みデータ取得

        let outfits =
        JSON.parse(
            localStorage.getItem("outfits")
        ) || [];



        // 追加

        outfits.push(outfit);



        // 保存

        localStorage.setItem(
            "outfits",
            JSON.stringify(outfits)
        );



        // outfitへ移動

        location.href="outfit.html";


    });



});