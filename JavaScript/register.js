let imageData = "";
let imageSegmenter;

async function initMediaPipe() {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
        );
        
        imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
                runningMode: "IMAGE"
            },
            outputCategoryMask: true,
            outputConfidenceMasks: false
        });
        console.log("MediaPipeの初期化が完了しました");
    } catch (error) {
        console.error("MediaPipeの初期化に失敗しました:", error);
    }
}
initMediaPipe();

document.getElementById("imageInput").addEventListener("change", handleImageSelect);
document.getElementById("cameraInput").addEventListener("change", handleImageSelect);

// 共通の画像読み込み処理
function handleImageSelect(e) {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();
    reader.onload = function(event){
        const img = new Image();
        img.onload = function() {
            // AIモデルの読み込みが完了しているか確認
            if (!imageSegmenter) {
                alert("AIが起動準備中です。1〜2秒ほど待ってから再度画像を選んでください。");
                return;
            }
            // 自動背景切り抜きを実行
            removeBackground(img);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// 背景を自動で透過する処理
function removeBackground(originalImage) {
    const canvas = document.getElementById("processingCanvas");
    const ctx = canvas.getContext("2d");

    // キャンバスのサイズを元の画像に合わせる
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // AIで画像内の人物・服の領域を解析
    const result = imageSegmenter.segment(originalImage);
    const categoryMask = result.categoryMask;

    // 一度元の画像をキャンバスに描く
    ctx.drawImage(originalImage, 0, 0);
    const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageDataObj.data;
    const maskData = categoryMask.getAsUint8Array();

    // マスクデータを元に、背景（値が0の部分）を完全に透過（Alpha=0）にする
    for (let i = 0; i < maskData.length; i++) {
        if (maskData[i] === 0) { 
            data[i * 4 + 3] = 0; // 4番目のデータ(Alpha)を0にして透明にする
        }
    }

    // 透過処理したデータをキャンバスに書き戻す
    ctx.putImageData(imageDataObj, 0, 0);

    // 透過PNGとしてデータを保存し、プレビューを更新
    imageData = canvas.toDataURL("image/png");
    document.getElementById("previewImage").src = imageData;
}

//保存
function saveClothes() {
    const category = document.getElementById("category").value;
    const status = document.getElementById("status").value;
    const memo = document.getElementById("memo").value;

    // 画像がまだ処理されていない場合のガード
    if (!imageData) {
        alert("画像が選択されていないか、背景の切り抜き処理中です。");
        return;
    }

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
        if (!Array.isArray(closet)) {
            closet = [];
        }
    } catch (e) {
        closet = [];
    }

    closet.push(clothes);
    localStorage.setItem("clothes", JSON.stringify(closet));

    alert("保存しました");
    location.href = "closet.html";
}
