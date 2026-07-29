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

    // ★ログイン状態の確認が終わってから服一覧を取得する
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadClothes();
        }
    });
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

// Firestoreからデータを読み込んで表示する非同期関数
async function loadClothes(){

    const closet = document.getElementById("closet");
    closet.innerHTML = "";

    // ★ログイン中のユーザーを取得
    const user = firebase.auth().currentUser;
    if (!user) return; // 未ログイン時は処理を中断（closet.html側でリダイレクトされます）

    try {
        // ★ Firestoreの users/{user.uid}/clothes コレクションからデータを取得
        const snapshot = await db.collection("users").doc(user.uid).collection("clothes").get();

        snapshot.forEach(doc => {
            const cloth = doc.data();
            const docId = doc.id; // 削除時に使用するドキュメントID

            // カテゴリでの絞り込み
            if (cloth.category !== currentCategory) {
                return; 
            }
            // 所持/未所持フィルターでの絞り込み
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

            // 編集モード時の削除ボタン処理
            if(editMode){

                const deleteBtn = document.createElement("button");

                deleteBtn.textContent = "×";
                deleteBtn.className = "delete-btn";

                deleteBtn.onclick = async () => {

                    if(confirm("削除しますか？")){
                        try {
                            // ★ Firestoreから該当ユーザーの服データを削除
                            await db.collection("users").doc(user.uid).collection("clothes").doc(docId).delete();
                            loadClothes(); // 画面再読み込み
                        } catch (error) {
                            console.error("削除エラー:", error);
                            alert("削除に失敗しました。");
                        }
                    }
                };

                item.appendChild(deleteBtn);
            }

            closet.appendChild(item);
        });

    } catch (error) {
        console.error("データ取得エラー:", error);
    }
}

function changeFilter() {

    currentFilter =
        document.getElementById("filterStatus").value;

    loadClothes();
}