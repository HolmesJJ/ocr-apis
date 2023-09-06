# OCR APIS

## Quick Start

### Python

1. Install Anaconda following the [link](https://docs.anaconda.com/anaconda/install/index.html).

2. Create and activate environment using the following commands.
```
# Create Python environment
conda create --name ocr-apis python=3.10.10

# Check Python environment
conda info --envs

# Activate environment
conda activate ocr-apis

# Deactivate environment
conda deactivate

# Remove environment
conda remove -n ocr-apis --all
```

3. Install `requirements.txt`.
```
pip install -r /path/to/requirements.txt
```

### Google

#### Setup Authorization

* https://cloud.google.com/docs/authentication/provide-credentials-adc
* https://googleapis.dev/python/google-api-core/latest/auth.html

```
// for linux
source ~/.bashrc
// for macOS
source ~/.zshrc
```

#### Login Google Cloud

```
gcloud auth login
gcloud config set project <PROJECT-NAME>
gcloud auth application-default print-access-token
```

### AWS

* https://docs.aws.amazon.com/textract/latest/dg/what-is.html

### Azure

* https://learn.microsoft.com/en-us/azure/cognitive-services/computer-vision/overview-ocr

### BaiDu

* https://ai.baidu.com/tech/ocr

### PaddleOCR

* https://github.com/PaddlePaddle/PaddleOCR

### Tesseract

* https://github.com/tesseract-ocr/tesseract

#### Install Tesseract

```
brew install tesseract
```

### TypeScript

#### Create TypeScript Project

```
cd typescript

tsc --init
npm init
npm link typescript
```

#### Compile TypeScript Project
```
tsc -p .
```

#### Run TypeScript Project

```
npm i
node .
```
