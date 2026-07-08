let imageData = "";

document.getElementById("imageInput")
.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        imageData = event.target.result;

        document.getElementById("previewImage").src =
            imageData;
    };

    reader.readAsDataURL(file);
});

//保存
function saveClothes() {

    const category =
        document.getElementById("category").value;

    const status =
        document.getElementById("status").value;

    const memo =
        document.getElementById("memo").value;

    const clothes = {
        image: imageData,
        category: category,
        status: status,
        memo: memo
    };

    let closetData = localStorage.getItem("clothes");
    let closet = [];

    try {
        closet = JSON.parse(closetData);
        // 読み込んだデータが「配列」じゃなかったら、強制的に空の配列にする
        if (!Array.isArray(closet)) {
            closet = [];
        }
    } catch (e) {
        closet = [];
    }

    // 配列に新データを追加
    closet.push(clothes);

    // 保存
    localStorage.setItem("clothes", JSON.stringify(closet));

    alert("保存しました");
    location.href = "closet.html";
}
