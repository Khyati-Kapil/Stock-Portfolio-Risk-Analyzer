from __future__ import annotations

from typing import Iterable, List

import pandas as pd


try:
    import yfinance as yf
except ImportError as exc:  
    raise RuntimeError("yfinance is required. Install with: pip install yfinance") from exc


def normalize_tickers(tickers: Iterable[str], add_ns_suffix: bool = True) -> List[str]:
    normalized: List[str] = []
    for ticker in tickers:
        tk = ticker.strip().upper()
        if not tk:
            continue
        if add_ns_suffix and "." not in tk and not tk.startswith("^"):
            tk = f"{tk}.NS"
        normalized.append(tk)
    if not normalized:
        raise ValueError("No valid tickers provided")
    return normalized


def _extract_close_column(raw: pd.DataFrame, ticker: str) -> pd.Series:
    if isinstance(raw.columns, pd.MultiIndex):
        if ticker not in raw.columns.levels[0]:
            raise ValueError(f"Ticker {ticker} not found in fetched data")
        frame = raw[ticker]
    else:
        frame = raw

    close_col = "Adj Close" if "Adj Close" in frame.columns else "Close"
    if close_col not in frame.columns:
        raise ValueError(f"Close prices unavailable for {ticker}")
    series = frame[close_col].astype(float)
    series.name = ticker
    return series


def fetch_price_history(
    tickers: Iterable[str],
    period: str = "2y",
    interval: str = "1d",
    start: str | None = None,
    end: str | None = None,
    add_ns_suffix: bool = True,
) -> pd.DataFrame:
    symbols = normalize_tickers(tickers, add_ns_suffix=add_ns_suffix)

    kwargs = {
        "tickers": symbols,
        "interval": interval,
        "group_by": "ticker",
        "auto_adjust": False,
        "actions": False,
        "progress": False,
        "threads": True,
    }
    if start or end:
        kwargs["start"] = start
        kwargs["end"] = end
    else:
        kwargs["period"] = period

    raw = yf.download(**kwargs)
    if raw is None or raw.empty:
        raise ValueError("No price data fetched. Check symbols/date range/network")

    series_list = [_extract_close_column(raw, symbol) for symbol in symbols]
    prices = pd.concat(series_list, axis=1)
    prices = prices.sort_index().replace([pd.NA], float("nan"))
    prices = prices.ffill().dropna(how="all")

    if prices.empty:
        raise ValueError("Fetched data could not be converted into a valid price table")

    return prices


def fetch_single_price_series(
    ticker: str,
    period: str = "2y",
    interval: str = "1d",
    start: str | None = None,
    end: str | None = None,
    add_ns_suffix: bool = False,
) -> pd.Series:
    prices = fetch_price_history(
        [ticker],
        period=period,
        interval=interval,
        start=start,
        end=end,
        add_ns_suffix=add_ns_suffix,
    )
    return prices.iloc[:, 0]
