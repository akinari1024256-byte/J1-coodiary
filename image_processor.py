import base64
import io
import numpy as np
import cv2
from PIL import Image, ImageOps
from flask import Flask, request, jsonify
from flask_cors import CORS
from rembg import remove
import mediapipe as mp

app = Flask(__name__)
CORS(app)

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)

@app.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': '画像が送信されていません'}), 400

    file = request.files['image']
    image_bytes = file.read()
    
    # PILで画像を読み込み
    input_img = Image.open(io.BytesIO(image_bytes))

    # ★スマホで撮影した画像の自動回転（Exif情報）を補正
    input_img = ImageOps.exif_transpose(input_img)

    # MediaPipe用にRGB配列へ変換（透過PNGなどのアルファチャンネル対策）
    if input_img.mode != 'RGB':
        img_rgb = np.array(input_img.convert('RGB'))
    else:
        img_rgb = np.array(input_img)

    # MediaPipe での骨格検出
    results = pose.process(img_rgb)
    analysis_result = ""

    if results.pose_landmarks:
        analysis_result = "人物を検出しました（切り抜き完了）"
    else:
        analysis_result = "服単体画像として背景を切り抜きました"

    # rembg で背景切り抜き
    output_img = remove(input_img)

    # Base64文字列へ変換して送信
    buffered = io.BytesIO()
    output_img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    cropped_data_url = f"data:image/png;base64,{img_base64}"

    return jsonify({
        'cropped_image': cropped_data_url,
        'analysis_result': analysis_result
    })

if __name__ == '__main__':
    print("🚀 服の画像処理サーバーを起動中...")
    # ★ host='0.0.0.0' に変更してスマホからのアクセスを許可！
    app.run(host='0.0.0.0', port=5000, debug=True)