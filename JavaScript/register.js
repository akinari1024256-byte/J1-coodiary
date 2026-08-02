let imageData = "";
let croppedImageData = ""; // AI切り抜き後の画像保持用
let selectedFile = null;  // ★選択または撮影されたファイルを保持

// 共通のファイル読み込み処理関数
function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file; // ファイルを保持

    const reader = new FileReader();
    reader.onload = function(event) {
        imageData = event.target.result;
        document.getElementById("previewImage").src = imageData;
    };
    reader.readAsDataURL(file);
}

// 画面ロード時にイベントリスナーをセット
document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("imageInput");
    const cameraInput = document.getElementById("cameraInput");

    // ① アルバムから画像が選択されたとき
    if (imageInput) {
        imageInput.addEventListener("change", (e) => {
            // カメラ側の選択をリセットしてファイル更新
            if (cameraInput) cameraInput.value = "";
            handleFileChange(e);
        });
    }

    // ② カメラで撮影されたとき
    if (cameraInput) {
        cameraInput.addEventListener("change", (e) => {
            // アルバム側の選択をリセットしてファイル更新
            if (imageInput) imageInput.value = "";
            handleFileChange(e);
        });
    }
});

// 送信前にスマホの巨大画像を画質を保ったまま最適化（軽量化）する関数
function resizeImageBeforeUpload(file, maxWidth = 1000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result;
        };

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // 長辺が1000pxを超える場合はアスペクト比を維持して最適化
            if (width > maxWidth || height > maxWidth) {
                if (width > height) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else {
                    width = Math.round((width * maxWidth) / height);
                    height = maxWidth;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            // 高解像度を維持したBlob形式で生成
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("画像の軽量化に失敗しました"));
                }
            }, "image/jpeg", 0.85);
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

// 保存ボタンクリック時：Pythonで画像解析し、確認モーダルを表示
async function saveClothes() {

    // ★ アルバムかカメラのどちらかでファイルが選ばれているか確認
    const file = selectedFile;

    if (!file) {
        alert("服の画像を選択するか、カメラで撮影してください。");
        return;
    }

    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    try {
        // スマホの巨大画像を画面表示・AI解析に最適なサイズへ調整
        const resizedBlob = await resizeImageBeforeUpload(file, 1000);

        // Pythonサーバーへ送信するデータの作成
        const formData = new FormData();
        formData.append("image", resizedBlob, "upload.jpg");
        formData.append("category", category);
        formData.append("status", status);
        formData.append("memo", memo);

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
        
        // base64ヘッダーが付いていない場合に自動補完する処理
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
        console.warn("Pythonサーバーとの通信に失敗したため、元画像を使用します:", error);
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