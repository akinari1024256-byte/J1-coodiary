// coordinate.js


document.addEventListener("DOMContentLoaded", function(){


    const closetItems =document.getElementById("closet-items");

    const dropArea =document.getElementById("drop-area");

    const clearBtn =document.getElementById("clearBtn");

    const saveBtn =document.getElementById("saveBtn");

    let currentStatus = "all";
    let currentCategory = "すべて";
    let dragTarget = null;

    // ==========================
    // クローゼット表示
    // ==========================

    function showClothes(){
        closetItems.innerHTML = "";
        let clothes =JSON.parse(localStorage.getItem("clothes")) || [];

        clothes.forEach(function(cloth){
            if(
                currentStatus !== "all" &&
                cloth.status !== currentStatus
            ){return;}
            if (
                currentCategory !== "すべて" &&
                cloth.category !== currentCategory
            ){return;}
            const img =document.createElement("img");

            img.src = cloth.image;
            img.className = "cloth-item";
            img.width = 50;
            img.height = 50;

            img.addEventListener(
                "click",
                function(){
                    addClothToArea(cloth.image);
                }
            );
            closetItems.appendChild(img);
        });
    }

    showClothes();

    window.changeStatusFilter = function(){
        currentStatus =
        document.getElementById(
            "filterStatus"
        ).value;
        showClothes();
    };

    window.changeCategory = function(category){
        currentCategory =
        category;
        showClothes();
    };
    // ==========================
    // コーデエリアへ服追加
    // ==========================
    function addClothToArea(image){
        const guide =
        dropArea.querySelector(".guide-text");


        if(guide){
            guide.remove();
        }
        const img =document.createElement("img");

        img.src = image;

        img.className ="placed-cloth";

        img.style.position ="absolute";

        img.style.width ="120px";
        img.style.left ="100px";
        img.style.top ="100px";

        img.draggable =true;

        addDragEvent(img);
        dropArea.appendChild(img);
    }

    function addDragEvent(img){

        img.addEventListener(
            "dragstart",
            function(e){
                dragTarget =img;
                e.dataTransfer.effectAllowed ="move";
            }
        );
    }
    // ==========================
    // 服を移動
    // ==========================
    dropArea.addEventListener(
        "drop",
        function(e){
            e.preventDefault();
            if(dragTarget){
                const rect =dropArea.getBoundingClientRect();

                const x =e.clientX - rect.left;
                const y =e.clientY - rect.top;

                dragTarget.style.left =(x - 60) + "px";
                dragTarget.style.top =(y - 60) + "px";

                dragTarget =null;
            }
        }
    );

    // ==========================
    // ドロップ可能にする
    // ==========================
    dropArea.addEventListener(
        "dragover",
        function(e){
            e.preventDefault();
        }
    );
    // ==========================
    // 破棄ボタン
    // ==========================
    clearBtn.addEventListener(
        "click",
        function(){
            const clothes =
            dropArea.querySelectorAll(
                ".placed-cloth"
            );
            clothes.forEach(
                function(cloth){
                    cloth.remove();
                }
            );
            if(!dropArea.querySelector(".guide-text")){

                const guide =document.createElement("p");
                guide.className ="guide-text";
                guide.textContent ="服を選択してください";
                dropArea.appendChild(guide);
            }
        }
    );
    // ==========================
    // 保存ボタン
    // ==========================
    saveBtn.addEventListener(
        "click",
        function(){
            html2canvas(
                dropArea,
                {
                    useCORS:true,
                    allowTaint:false,
                    backgroundColor:"#ffffff",
                    scale:2
                }
            )
            .then(
                function(canvas){
                    const imageData =
                    canvas.toDataURL("image/png");

                    localStorage.setItem(
                        "coordinateImage",
                        imageData
                    );
                    location.href ="save.html";
                }
            );
        }
    );
});
