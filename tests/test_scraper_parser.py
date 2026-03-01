import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.data.scraper import build_portfolio_payload


def test_build_payload_uses_quantity_times_average_price():
    payload = build_portfolio_payload(
        [
            {"ticker": "reliance.ns", "quantity": 2, "average_price": 100},
            {"ticker": "tcs.ns", "quantity": 1, "average_price": 300},
        ]
    )

    assert payload["tickers"] == ["RELIANCE.NS", "TCS.NS"]
    assert payload["weights"] == [0.4, 0.6]


def test_build_payload_falls_back_to_total_value_when_price_missing():
    payload = build_portfolio_payload(
        [
            {"ticker": "INFY.NS", "total_value": 5000},
            {"ticker": "HDFCBANK.NS", "total_value": 5000},
        ]
    )

    assert payload["weights"] == [0.5, 0.5]


def test_build_payload_uses_equal_weights_when_values_missing():
    payload = build_portfolio_payload(
        [
            {"ticker": "SBIN.NS"},
            {"ticker": "AXISBANK.NS"},
        ]
    )

    assert payload["weights"] == [0.5, 0.5]


def test_build_payload_drops_zero_value_rows_when_any_positive_exists():
    payload = build_portfolio_payload(
        [
            {"ticker": "SBIN.NS", "quantity": 0, "average_price": 0},
            {"ticker": "AXISBANK.NS", "quantity": 2, "average_price": 100},
        ]
    )

    assert payload["tickers"] == ["AXISBANK.NS"]
    assert payload["weights"] == [1.0]


def test_build_payload_skips_empty_tickers():
    payload = build_portfolio_payload(
        [
            {"ticker": " "},
            {"ticker": "ITC.NS", "quantity": 1, "average_price": 10},
        ]
    )

    assert payload["tickers"] == ["ITC.NS"]
    assert payload["weights"] == [1.0]
