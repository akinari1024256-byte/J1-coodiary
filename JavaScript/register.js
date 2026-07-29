// モーダルの「この内容で登録」ボタンクリック時：Firebase (Firestore) へ保存
async function submitToFirebase() {
    console.log("★「この内容で登録」ボタンがクリックされました！");

    // ★ログインユーザー情報の取得
    const user = firebase.auth().currentUser;
    if (!user) {
        alert("ログインしていません。ログイン画面へ移動します。");
        location.href = "login.html";
        return;
    }

    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    const resizeImage = (base64Str) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 500;
                
                if (img.width <= MAX_WIDTH) {
                    resolve(base64Str);
                    return;
                }

                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            image: finalImage,
            category: category,
            status: status,
            memo: memo,
            count: 0
        };

        console.log("★Firestoreへデータの書き込みを実行中...");
        
        // ★【重要】 ユーザーIDごとのサブコレクションに保存するように変更
        await db.collection("users").doc(user.uid).collection("clothes").add(clothes);

        console.log("★Firebaseへの保存が大成功しました！");
        alert("自分専用のクローゼットに保存しました！");
        location.href = "closet.html";

    } catch (error) {
        console.error("★Firebase保存エラー:", error);
        alert("Firebaseへの保存に失敗しました。コンソールのエラーを確認してください。");
    }
}