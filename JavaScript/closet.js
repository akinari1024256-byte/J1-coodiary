console.log(
    JSON.parse(localStorage.getItem("clothes"))
);
let editMode = false;
let currentCategory = "トップス";
let currentFilter = "all";

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

        const itemText = item.textContent.trim();

        if (item.textContent === categoryName || (categoryName === "アクセサリー" && item.textContent === "アクセ")) {
            item.classList.add("active");
        }
        else if (itemText === categoryName) {
            item.classList.add("active");
        }
        else {
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
        if (
            currentFilter !== "all" &&
            cloth.status !== currentFilter
        ){
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
                    "着用回数: " + (cloth.count || 0) + "回\n" +
                    "メモ: " + (cloth.memo || "なし")
                );
            }
        };

        item.appendChild(img);

        const countBadge = document.createElement("span");
        countBadge.className = "count-badge";
        countBadge.textContent = (cloth.count || 0) + "回";
        
        item.appendChild(countBadge);

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

function changeFilter() {

    currentFilter =
        document.getElementById("filterStatus").value;

    loadClothes();
}