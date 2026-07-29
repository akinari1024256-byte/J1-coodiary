let imageData = "";
let croppedImageData = ""; // AI切り抜き後の画像保持用

document.getElementById("imageInput")
.addEventListener("change", function(e){

    const file = e.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(event){

        imageData = event.target.result;

        document.getElementById("previewImage").src = imageData;
    };

    reader.readAsDataURL(file);
});

// 保存ボタンクリック時：Pythonで画像解析し、確認モーダルを表示
async function saveClothes() {

    const fileInput = document.getElementById("imageInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("服の画像を選択してください。");
        return;
    }

    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    // Pythonサーバーへ送信するデータの作成
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    formData.append("status", status);
    formData.append("memo", memo);

    try {
        // Pythonへ画像送信・切り抜き＆解析のリクエスト
        const response = await fetch("http://127.0.0.1:5000/process_image", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("サーバー通信エラーが発生しました");
        }

        const result = await response.json();

        // 解析結果と入力値をモーダルへ反映
        croppedImageData = result.cropped_image || imageData; 

        document.getElementById("croppedPreviewImage").src = croppedImageData;
        document.getElementById("confirmCategory").textContent = category;
        document.getElementById("confirmStatus").textContent = status;
        document.getElementById("confirmMemo").textContent = memo;

        const aiInfoElement = document.getElementById("confirmAiInfo");
        if (aiInfoElement && result.analysis_result) {
            aiInfoElement.textContent = result.analysis_result;
        }

        // 確認モーダルを表示
        document.getElementById("confirmModal").style.display = "flex";

    } catch (error) {
        // 通信失敗時は元画像でモーダルを表示
        croppedImageData = imageData;
        document.getElementById("croppedPreviewImage").src = imageData;
        document.getElementById("confirmCategory").textContent = category;
        document.getElementById("confirmStatus").textContent = status;
        document.getElementById("confirmMemo").textContent = memo;
        document.getElementById("confirmModal").style.display = "flex";
    }
}

// モーダルのキャンセルボタンクリック時：モーダルを非表示
function closeModal() {
    document.getElementById("confirmModal").style.display = "none";
}

// モーダルの「この内容で登録」ボタンクリック時：Firebase (Firestore) へ保存
async function submitToFirebase() {
    console.log("submit開始");
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    // Firebase (Firestore) に送るデータの構造
    const clothes = {
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 登録日時
        image: croppedImageData || imageData,
        category: category,
        status: status,
        memo: memo,
        count: 0
    };

    try {
        // Firestore の "clothes" コレクションにデータを保存
        await db.collection("clothes").add(clothes);

        alert("Firebaseに保存しました！");
        location.href = "closet.html";

    } catch (error) {
        console.error("Firebase保存エラー:", error);
        alert("Firebaseへの保存に失敗しました。設定やルールを確認してください。");
    }
}