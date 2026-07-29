// coordinate.js

document.addEventListener("DOMContentLoaded", function(){

    const closetItems = document.getElementById("closet-items");
    const dropArea = document.getElementById("drop-area");
    const clearBtn = document.getElementById("clearBtn");
    const saveBtn = document.getElementById("saveBtn");

    let currentStatus = "all";
    let currentCategory = "すべて";
    let dragTarget = null;

    // ==========================
    // クローゼット表示（ユーザー別Firestore対応）
    // ==========================
    async function showClothes(){
        closetItems.innerHTML = "";

        // ★ ログイン中のユーザーを取得
        const user = firebase.auth().currentUser;
        if (!user) return; // 未ログイン時は処理を中断（coordinate.html側でリダイレクトされます）

        try {
            // ★ ログインユーザー配下の "clothes" コレクションから服データを取得
            const snapshot = await db.collection("users").doc(user.uid).collection("clothes").get();

            snapshot.forEach(function(doc){
                const cloth = doc.data();
                const docId = doc.id; // ドキュメントID

                if(
                    currentStatus !== "all" &&
                    cloth.status !== currentStatus
                ){return;}

                if (
                    currentCategory !== "すべて" &&
                    cloth.category !== currentCategory
                ){return;}

                const img = document.createElement("img");

                img.src = cloth.image;
                img.className = "cloth-item";
                img.width = 50;
                img.height = 50;

                img.addEventListener(
                    "click",
                    function(){
                        addClothToArea(cloth, docId);
                    }
                );
                closetItems.appendChild(img);
            });
        } catch (error) {
            console.error("服データの取得に失敗しました:", error);
        }
    }

    // ★ ログイン状態の確認が終わってから服一覧を取得する
    firebase.auth().onAuthStateChanged(function(user){
        if (user) {
            showClothes();
        }
    });

    window.changeStatusFilter = function(){
        currentStatus =
        document.getElementById("filterStatus").value;
        showClothes();
    };

    window.changeCategory = function(){
        currentCategory =
        document.getElementById("filterCategory").value;
        showClothes();
    };

    // ==========================
    // コーデエリアへ服追加
    // ==========================
    function addClothToArea(cloth, id){
        const guide = dropArea.querySelector(".guide-text");

        if(guide){
            guide.remove();
        }
        const img = document.createElement("img");

        img.src = cloth.image;
        img.dataset.id = id; // docIdを格納

        img.className = "placed-cloth";
        img.style.position = "absolute";
        img.style.width = "120px";
        img.style.left = "100px";
        img.style.top = "100px";

        img.draggable = true;

        addDragEvent(img);
        dropArea.appendChild(img);
    }

    function addDragEvent(img){

        img.addEventListener(
            "dragstart",
            function(e){
                dragTarget = img;
                e.dataTransfer.effectAllowed = "move";
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
                const rect = dropArea.getBoundingClientRect();

                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                dragTarget.style.left = (x - 60) + "px";
                dragTarget.style.top = (y - 60) + "px";

                dragTarget = null;
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

                const guide = document.createElement("p");
                guide.className = "guide-text";
                guide.textContent = "服を選択してください";
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
            const placedClothes = dropArea.querySelectorAll(".placed-cloth");
            const usedIds = Array.from(placedClothes).map(img => img.dataset.id);
            // 服がない場合
            if(placedClothes.length === 0){
                alert("服を配置してください");
                return;
            }
            let minX = Infinity;
            let minY = Infinity;
            let maxX = 0;
            let maxY = 0;
            placedClothes.forEach(img => {
                const x = img.offsetLeft;
                const y = img.offsetTop;
                const width = img.offsetWidth;
                const height = img.offsetHeight;
                minX = Math.min(minX, x);
                minY = Math.min(minY, y);
                maxX = Math.max(maxX, x + width);
                maxY = Math.max(maxY, y + height);
            });
            const padding = 20;
            html2canvas(
                dropArea,
                {
                    backgroundColor:"#ffffff",
                    scale:2,
                    x: minX - padding,
                    y: minY - padding,
                    width:(maxX - minX) + padding * 2,
                    height:(maxY - minY) + padding * 2
                }
            )
            .then(async function(canvas){
                const image = canvas.toDataURL("image/png");
                sessionStorage.setItem("coordinateImage", image);
                sessionStorage.setItem("usedClothes", JSON.stringify(usedIds));
                location.href = "save.html";
            });
        }
    )
});