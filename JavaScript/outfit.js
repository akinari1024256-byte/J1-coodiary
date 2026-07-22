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

function loadOutfits(){

    const outfits = JSON.parse(localStorage.getItem("outfits")) || [];

    const list = document.getElementById("outfit-list");

    list.innerHTML = "";

    const keyword = document.getElementById("tagSearch").value.toLowerCase();
    const sort = document.getElementById("sort").value;
    const filter = document.getElementById("filter").value;
    let filtered = outfits
        .map((outfit, index) => ({ outfit, index }))
        .filter(item => {
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
    filtered.forEach((data)=>{
        const outfit = data.outfit;
        const outfitItem = document.createElement("div");

        outfitItem.className = "outfit-item";

        const img = document.createElement("img");

        img.src = outfit.image;

        outfitItem.appendChild(img);

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
            deleteBtn.onclick = () => {

                if(confirm("削除しますか？")){
                    outfits.splice(data.index,1);
                    localStorage.setItem(
                        "outfits",
                        JSON.stringify(outfits)
                    );

                    loadOutfits();

                }

            };

            outfitItem.appendChild(deleteBtn);

        }

        list.appendChild(outfitItem);

    });

}