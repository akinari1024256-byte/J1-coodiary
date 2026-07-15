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

        list.appendChild(item);

    });

}