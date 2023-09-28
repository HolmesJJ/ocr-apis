import io
import os
import csv
import time
import boto3
import base64
import requests
import pytesseract

from PIL import Image
from tqdm import tqdm
from google.cloud import vision
from paddleocr import PaddleOCR


GOOGLE = "google"
AWS = "aws"
AZURE = "azure"
BAIDU = "baidu"
PADDLE_OCR = "paddleocr"
TESSERACT = "tesseract"

AWS_REGION_NAME = "ap-southeast-1"
AWS_ACCESS_KEY_ID = ""
AWS_SECRET_ACCESS_KEY = ""

AZURE_OCR_URL = "https://{endpoint}/computervision/imageanalysis:analyze?" \
                "features=caption,read&model-version=latest&language=en&api-version=2023-02-01-preview"
AZURE_OCR_KEY = ""

BAIDU_TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token"
BAIDU_OCR_CLIENT_ID = ""
BAIDU_OCR_CLIENT_SECRET = ""
BAIDU_OCR_URL = "https://aip.baidubce.com/rest/2.0/ocr/v1/webimage"

IMAGES_DIR = "images1/"

OUTPUTS_PATH = "outputs1/{0}_outputs.csv"


def get_baidu_token():
    token_url = "{0}?grant_type=client_credentials&client_id={1}&client_secret={2}".format(
        BAIDU_TOKEN_URL, BAIDU_OCR_CLIENT_ID, BAIDU_OCR_CLIENT_SECRET)
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    response = requests.request("POST", token_url, headers=headers, data="")
    return response.json()


def detect_texts(path, api, model=None):
    predictions = []
    if api == GOOGLE:
        with io.open(path, "rb") as image_file:
            content = image_file.read()
        image = vision.Image(content=content)
        response = model.text_detection(image=image)
        texts = response.text_annotations
        for text in texts:
            predictions.append(text.description)
        if response.error.message:
            print("error image:", path)
    elif api == AWS:
        with io.open(path, "rb") as image_file:
            content = image_file.read()
        response = model.detect_document_text(Document={"Bytes": content})
        texts = response["Blocks"]
        for text in texts:
            if text["BlockType"] == "LINE":  # WORD
                predictions.append(text["Text"])
    elif api == AZURE:
        with io.open(path, "rb") as image_file:
            content = image_file.read()
        headers = {
            "Content-Type": "application/octet-stream",
            "Ocp-Apim-Subscription-Key": AZURE_OCR_KEY
        }
        response = requests.request("POST", AZURE_OCR_URL, headers=headers, data=content)
        texts = response.json()["readResult"]["pages"][0]["lines"]  # words
        for text in texts:
            predictions.append(text["content"])
    elif api == BAIDU:
        with io.open(path, "rb") as image_file:
            content = image_file.read()
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {
            "image": base64.b64encode(content)
        }
        ocr_url = "{0}?access_token={1}".format(BAIDU_OCR_URL, model)
        response = requests.request("POST", ocr_url, headers=headers, data=data)
        texts = response.json()["words_result"]
        for text in texts:
            predictions.append(text["words"])
    elif api == PADDLE_OCR:
        texts = model.ocr(path)[0]
        for text in texts:
            predictions.append(text[1][0])
    elif api == TESSERACT:
        text = pytesseract.image_to_string(Image.open(path))
        predictions.append(text)
    return predictions


def predict(apis, interval=0, debug=False):
    for api in apis:
        if os.path.exists(OUTPUTS_PATH.format(api)):
            os.remove(OUTPUTS_PATH.format(api))
        with open(OUTPUTS_PATH.format(api), mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(["image", "predictions"])

    models = {}
    for api in apis:
        if api == GOOGLE:
            models[GOOGLE] = vision.ImageAnnotatorClient()
        elif api == AWS:
            models[AWS] = boto3.client("textract", region_name=AWS_REGION_NAME, aws_access_key_id=AWS_ACCESS_KEY_ID,
                                       aws_secret_access_key=AWS_SECRET_ACCESS_KEY)
        elif api == BAIDU:
            models[BAIDU] = get_baidu_token()["access_token"]
        elif api == PADDLE_OCR:
            models[PADDLE_OCR] = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        else:
            models[api] = None

    for api in apis:
        if debug:
            print(("=" * 30 + " ") + api + (" " + "=" * 30))
        with tqdm(total=len(os.listdir(IMAGES_DIR))) as pbar:
            for i, filename in enumerate(sorted(os.listdir(IMAGES_DIR))):
                file_path = os.path.join(IMAGES_DIR, filename)
                predictions = detect_texts(file_path, api, models[api])
                if debug:
                    print("\n")
                    print(f"{filename}: {', '.join(predictions)}")
                with open(OUTPUTS_PATH.format(api), mode="a", newline="", encoding="utf-8") as file:
                    writer = csv.writer(file)
                    writer.writerow([filename, ", ".join(predictions)])
                pbar.set_postfix({"api": api, "image": filename})
                pbar.update(1)
                time.sleep(interval)
        if debug:
            print(("=" * 30 + " ") + api + (" " + "=" * 30))


if __name__ == "__main__":
    predict([AZURE], interval=5, debug=True)
