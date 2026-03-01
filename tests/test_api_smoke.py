import sys
from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import backend.main as main

client = TestClient(main.app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_rejects_unsupported_file_type():
    response = client.post(
        "/api/upload",
        files={"file": ("payload.txt", BytesIO(b"not-an-image"), "text/plain")},
    )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]


def test_upload_rejects_file_too_large(monkeypatch):
    monkeypatch.setattr(main, "MAX_UPLOAD_BYTES", 8)
    response = client.post(
        "/api/upload",
        files={"file": ("big.jpg", BytesIO(b"0123456789"), "image/jpeg")},
    )
    assert response.status_code == 413
    assert response.json()["detail"] == "Image too large."


def test_upload_happy_path(monkeypatch):
    monkeypatch.setattr(
        main, "extract_text_from_image", lambda *_args, **_kwargs: "demo ocr text"
    )
    monkeypatch.setattr(
        main,
        "parse_ocr_text_to_portfolio",
        lambda text: {
            "tickers": ["TCS.NS"],
            "weights": [1.0],
            "raw_parsed": [{"source": text}],
        },
    )

    response = client.post(
        "/api/upload",
        files={"file": ("ok.png", BytesIO(b"fake"), "image/png")},
    )
    assert response.status_code == 200
    assert response.json()["tickers"] == ["TCS.NS"]
