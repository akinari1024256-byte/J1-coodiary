document.addEventListener("DOMContentLoaded", function () {

    // プレビュー画像表示
    const image = sessionStorage.getItem("coordinateImage");

    if (image) {
        document.getElementById("outfitPreviewImage").src = image;
    }

});


async function saveOutfit() {
    // coordinate.js で保存した服の docId 一覧を取得
    const usedIds = JSON.parse(sessionStorage.getItem("usedClothes")) || [];
    
    try {
        // 使用された服のデータを Firestore から取得して「未所持服」が含まれているか判定 ＆ 着用回数(+1)を更新
        let hasUnowned = false;

        for (const docId of usedIds) {
            const clothRef = db.collection("clothes").doc(docId);
            const doc = await clothRef.get();

            if (doc.exists) {
                const clothData = doc.data();

                // 未所持服チェック
                if (clothData.status === "未所持服") {
                    hasUnowned = true;
                }

                // 着用回数 (count) を +1 して Firestore を更新
                const currentCount = clothData.count || 0;
                await clothRef.update({
                    count: currentCount + 1
                });
            }
        }

        // コーデオブジェクトの作成
        const outfit = {
            image: sessionStorage.getItem("coordinateImage"),
            date: document.getElementById("outfitDate").value,
            temp: document.getElementById("outfitTemp").value,
            weather: document.getElementById("outfitWeather").value,
            tag: document.getElementById("outfitTag").value,
            memo: document.getElementById("outfitMemo").value,
            hasUnowned: hasUnowned,
            createdAt: firebase.firestore.FieldValue.serverTimestamp() // 並び替え用タイムスタンプ
        };

        // Firestore の "outfits" コレクションへ保存
        await db.collection("outfits").add(outfit);

        // 一時保存データのクリーンアップ
        sessionStorage.removeItem("usedClothes");
        sessionStorage.removeItem("coordinateImage");

        alert("保存しました");

        location.href = "outfit.html";

    } catch (error) {
        console.error("コーデの保存エラー:", error);
        alert("保存に失敗しました。");
    }
}