import os
import sys

env_path = ".env"
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

sys.path.append(os.path.abspath("."))
from backend.data.scraper import extract_text_from_image, parse_ocr_text_to_portfolio

if __name__ == "__main__":
    image_path = "temp/dummy.jpg"
    os.makedirs("temp", exist_ok=True)
    with open(image_path, "wb") as f:
        f.write(b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xd2\x8f\xff\xd9')
    try:
        raw_text = extract_text_from_image(image_path)
        print("RAW TEXT:")
        print(raw_text)
        print("------")
        parsed = parse_ocr_text_to_portfolio(raw_text)
        print("PARSED:")
        print(parsed)
    except Exception as e:
        print("EXCEPTION:", e)
