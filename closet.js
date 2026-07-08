console.log(
    JSON.parse(localStorage.getItem("clothes"))
);
let editMode = false;
let currentCategory = "トップス";

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("editButton")
        .addEventListener("click", () => {

        editMode = !editMode;

        document.getElementById("editButton").textContent =
            editMode ? "完了" : "編集";

        loadClothes();
    });

    loadClothes();
});

// カテゴリを切り替えるための関数
function changeCategory(categoryName) {
    currentCategory = categoryName;

    // メニューの「アクティブ（赤文字）」の見た目を切り替える
    const items = document.querySelectorAll(".category-item");
    items.forEach(item => {
        if (item.textContent === categoryName || (categoryName === "アクセサリー" && item.textContent === "アクセ")) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // 服一覧を再描画
    loadClothes();
}

function loadClothes(){

    const clothes =
        JSON.parse(localStorage.getItem("clothes")) || [];

    const closet =
        document.getElementById("closet");

    closet.innerHTML = "";

    clothes.forEach((cloth,index) => {

        if (cloth.category !== currentCategory) {
            return; 
        }

        const item = document.createElement("div");
        item.className = "cloth-item";

        const img = document.createElement("img");
        img.src = cloth.image;

        img.onclick = () => {
            if (!editMode) {
                alert (
                    "状態: " + (cloth.status || "未設定") + "\n" +
                    "メモ: " + (cloth.memo || "なし")
                );
            }
        };

        item.appendChild(img);

        if(editMode){

            const deleteBtn =
                document.createElement("button");

            deleteBtn.textContent = "×";
            deleteBtn.className = "delete-btn";

            deleteBtn.onclick = () => {

                if(confirm("削除しますか？")){

                    clothes.splice(index,1);

                    localStorage.setItem(
                        "clothes",
                        JSON.stringify(clothes)
                    );

                    loadClothes();
                }
            };

            item.appendChild(deleteBtn);
        }

        closet.appendChild(item);
    });
}

