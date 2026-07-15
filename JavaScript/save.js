document.addEventListener("DOMContentLoaded", function () {

    // プレビュー画像表示
    const image = localStorage.getItem("coordinateImage");

    if (image) {
        document.getElementById("outfitPreviewImage").src = image;
    }

});

// 保存
function saveOutfit() {

    const outfit = {

        image: localStorage.getItem("coordinateImage"),

        date: document.getElementById("outfitDate").value,

        temp: document.getElementById("outfitTemp").value,

        weather: document.getElementById("outfitWeather").value,

        tag: document.getElementById("outfitTag").value,

        memo: document.getElementById("outfitMemo").value

    };

    let outfits =
        JSON.parse(localStorage.getItem("outfits")) || [];

    outfits.push(outfit);

    localStorage.setItem(
        "outfits",
        JSON.stringify(outfits)
    );

    alert("保存しました");

    location.href = "outfit.html";
}