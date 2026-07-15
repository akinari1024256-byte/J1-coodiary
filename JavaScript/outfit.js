let editMode = false;

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("editButton")
        .addEventListener("click", () => {

        editMode = !editMode;

        document.getElementById("editButton").textContent =
            editMode ? "完了" : "編集";

        loadOutfits();

    });

    loadOutfits();

});

document.addEventListener("DOMContentLoaded", loadOutfits);

function loadOutfits(){

    const outfits =
        JSON.parse(localStorage.getItem("outfits")) || [];

    const list =
        document.getElementById("outfit-list");

    list.innerHTML = "";

    outfits.forEach((outfit,index)=>{

        const item =
            document.createElement("div");

        item.className = "outfit-item";

        const img =
            document.createElement("img");

        img.src = outfit.image;

        img.onclick = () => {

            alert(
                "日付：" + outfit.date + "\n" +
                "気温：" + outfit.temp + "℃\n" +
                "天気：" + outfit.weather + "\n" +
                "タグ：" + outfit.tag + "\n" +
                "メモ：" + (outfit.memo || "なし")
            );

        };

        item.appendChild(img);

        if(editMode){

            const deleteBtn =
                document.createElement("button");

            deleteBtn.textContent = "×";

            deleteBtn.className = "delete-btn";

            deleteBtn.onclick = () => {

                if(confirm("削除しますか？")){

                    outfits.splice(index,1);

                    localStorage.setItem(
                        "outfits",
                        JSON.stringify(outfits)
                    );

                    loadOutfits();

                }

            };

            item.appendChild(deleteBtn);

        }

        list.appendChild(item);

    });

}