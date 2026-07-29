let imageData = "";
let croppedImageData = ""; // AI切り抜き後の画像保持用

// 画像選択時のプレビュー処理
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
        let processedImg = result.cropped_image || imageData;
        
        // base64ヘッダーが付いていない場合に自動補完する処理を追加
        if (processedImg && !processedImg.startsWith("data:image")) {
            processedImg = "data:image/png;base64," + processedImg;
        }

        croppedImageData = processedImg;

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
    console.log("★「この内容で登録」ボタンがクリックされました！");

    // ★ログイン中のユーザー情報を取得
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("ログインしていません。ログイン画面へ移動します。");
        location.href = "login.html";
        return;
    }

    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    // 透過（PNG）を維持したまま適切なサイズにリサイズする関数
    const resizeImage = (base64Str) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 500; // 横幅最大500pxに調整
                
                if (img.width <= MAX_WIDTH) {
                    resolve(base64Str);
                    return;
                }

                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // PNG形式のまま保存して透明背景を維持
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => resolve(base64Str);
        });
    };

    try {
        console.log("★画像の最適化処理を開始します...");
        const rawImage = croppedImageData || imageData;
        const finalImage = await resizeImage(rawImage);

        console.log("★Firebaseに送信するデータを作成しました");
        const clothes = {
            createdAt: firebase.firestore.FieldValue.serverTimestamp(), // 登録日時
            image: finalImage,
            category: category,
            status: status,
            memo: memo,
            count: 0
        };

        console.log("★Firestoreへデータの書き込みを実行中...");
        
        // ★ユーザー別のコレクション（users/ユーザーID/clothes）へ保存
        await db.collection("users").doc(user.uid).collection("clothes").add(clothes);

        console.log("★自分専用クローゼットへの保存が大成功しました！");
        alert("自分専用のクローゼットに保存しました！");
        location.href = "closet.html";

    } catch (error) {
        console.error("★Firebase保存エラー:", error);
        alert("Firebaseへの保存に失敗しました。コンソールのエラーを確認してください。");
    }
}