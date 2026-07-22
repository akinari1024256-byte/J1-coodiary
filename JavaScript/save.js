document.addEventListener("DOMContentLoaded", function () {

    // プレビュー画像表示
    const image = localStorage.getItem("coordinateImage");

    if (image) {
        document.getElementById("outfitPreviewImage").src = image;
    }

});


function saveOutfit() {
    const usedIds = JSON.parse(localStorage.getItem("usedClothes")) || [];
    
    let clothes = JSON.parse(localStorage.getItem("clothes")) || [];
    const hasUnowned = usedIds.some(id => {
        return clothes[id] && clothes[id].status === "未所持服";
    });

    const outfit = {
        image: localStorage.getItem("coordinateImage"),
        date: document.getElementById("outfitDate").value,
        temp: document.getElementById("outfitTemp").value,
        weather: document.getElementById("outfitWeather").value,
        tag: document.getElementById("outfitTag").value,
        memo: document.getElementById("outfitMemo").value,
        hasUnowned: hasUnowned
    };

    let outfits = JSON.parse(localStorage.getItem("outfits")) || [];

    outfits.push(outfit);



    clothes.forEach((cloth, index )=> {
        if(usedIds.includes(index)){
            cloth.count = (cloth.count || 0) + 1;
        }
    });
    
    localStorage.setItem(
        "clothes",
        JSON.stringify(clothes)
    );

localStorage.removeItem("usedClothes");

    localStorage.setItem(
        "outfits",
        JSON.stringify(outfits)
    );

    alert("保存しました");

    location.href = "outfit.html";
}