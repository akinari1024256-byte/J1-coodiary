// coordinate.js


document.addEventListener("DOMContentLoaded", function(){


    const closetItems =
    document.getElementById("closet-items");

    const dropArea =
    document.getElementById("drop-area");

    const clearBtn =
    document.getElementById("clearBtn");

    const saveBtn =
    document.getElementById("saveBtn");



    let currentFilter = "すべて";



    // ==========================
    // クローゼット表示
    // ==========================

    function showClothes(filter){


        currentFilter = filter;


        closetItems.innerHTML = "";


        let clothes =
        JSON.parse(localStorage.getItem("clothes")) || [];



        clothes.forEach(function(cloth){



            if(
                filter !== "すべて" &&
                cloth.status !== filter
            ){
                return;
            }



            const img =
            document.createElement("img");


            img.src = cloth.image;

            img.className = "cloth-item";

            img.draggable = true;



            // ドラッグ開始
            img.addEventListener(
                "dragstart",
                function(e){

                    e.dataTransfer.setData(
                        "image",
                        cloth.image
                    );

                }
            );



            closetItems.appendChild(img);



        });


    }



    // HTMLのonclickから呼ぶため
    window.showClothes = showClothes;



    // 初期表示

    showClothes("すべて");





    // ==========================
    // ドラッグ＆ドロップ
    // ==========================


    dropArea.addEventListener(
        "dragover",
        function(e){

            e.preventDefault();

        }
    );



    dropArea.addEventListener(
        "drop",
        function(e){


            e.preventDefault();



            const image =
            e.dataTransfer.getData("image");



            if(image){


                const img =
                document.createElement("img");


                img.src = image;


                img.className =
                "placed-cloth";



                // 配置位置
                img.style.left =
                (e.offsetX - 50) + "px";


                img.style.top =
                (e.offsetY - 50) + "px";



                dropArea.appendChild(img);



            }


        }
    );





    // ==========================
    // 破棄ボタン
    // ==========================


    clearBtn.addEventListener(
        "click",
        function(){


            const placed =
            dropArea.querySelectorAll(
                ".placed-cloth"
            );



            placed.forEach(function(item){

                item.remove();

            });



        }
    );





    // ==========================
    // 保存ボタン
    // ==========================


    saveBtn.addEventListener(
        "click",
        function(){



            html2canvas(dropArea)
            .then(function(canvas){



                const imageData =
                canvas.toDataURL(
                    "image/png"
                );



                localStorage.setItem(
                    "coordinateImage",
                    imageData
                );



                window.location.href =
                "save.html";



            });



        }
    );


});