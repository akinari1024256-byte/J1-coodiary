let editMode = false;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("sort")
        .addEventListener("change", loadOutfits);
    document.getElementById("filter")
        .addEventListener("change", loadOutfits);
    document.getElementById("tagSearch")
        .addEventListener("input", loadOutfits);
    document.getElementById("editButton")
        .addEventListener("click", () => {

        editMode = !editMode;

        document.getElementById("editButton").textContent =
            editMode ? "完了" : "編集";

        loadOutfits();

    });

    loadOutfits();

});

async function loadOutfits(){

    const list = document.getElementById("outfit-list");
    list.innerHTML = "";

    try {
        // Firestoreの "outfits" コレクションからデータを取得
        const snapshot = await db.collection("outfits").get();
        const outfits = [];

        snapshot.forEach(doc => {
            outfits.push({
                docId: doc.id,
                outfit: doc.data()
            });
        });

        const keyword = document.getElementById("tagSearch").value.toLowerCase();
        const sort = document.getElementById("sort").value;
        const filter = document.getElementById("filter").value;

        let filtered = outfits.filter(item => {
            if(keyword !== "" &&
               !(item.outfit.tag || "")
                .toLowerCase()
                .includes(keyword)){
                return false;
            }

            if(filter === "owned"){
                return item.outfit.hasUnowned === false;
            }

            if(filter === "unowned"){
                return item.outfit.hasUnowned === true;
            }

            return true;
        });

        if(sort === "new"){
            filtered.sort((a,b)=>
                new Date(b.outfit.date) -
                new Date(a.outfit.date)
            );
        }else{
            filtered.sort((a,b)=>
                new Date(a.outfit.date) -
                new Date(b.outfit.date)
            );
        }

        filtered.forEach((item)=>{
            const outfit = item.outfit;
            const docId = item.docId;
            const outfitItem = document.createElement("div");

            outfitItem.className = "outfit-item";

            const img = document.createElement("img");
            img.src = outfit.image;

            img.onclick = () => {
                if(!editMode){
                    alert(
                        "日付：" + outfit.date + "\n" +
                        "気温：" + outfit.temp + "℃\n" +
                        "天気：" + outfit.weather + "\n" +
                        "タグ：" + outfit.tag + "\n" +
                        "メモ：" + (outfit.memo || "なし")
                    );
                }
            };

            outfitItem.appendChild(img);

            if(editMode){
                const deleteBtn = document.createElement("button");

                deleteBtn.textContent = "×";
                deleteBtn.className = "delete-btn";
                deleteBtn.onclick = async () => {

                    if(confirm("削除しますか？")){
                        try {
                            // Firestoreから該当のコーデデータを削除
                            await db.collection("outfits").doc(docId).delete();
                            loadOutfits(); // 画面を再読み込み
                        } catch (error) {
                            console.error("コーデの削除エラー:", error);
                            alert("削除に失敗しました。");
                        }
                    }

                };

                outfitItem.appendChild(deleteBtn);
            }

            list.appendChild(outfitItem);

        });

    } catch (error) {
        console.error("コーデデータの取得に失敗しました:", error);
    }

}