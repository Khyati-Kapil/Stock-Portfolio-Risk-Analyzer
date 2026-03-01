from __future__ import annotations

from typing import Iterable, List, Tuple

import pandas as pd

try:
    import yfinance as yf
except ImportError as exc:
    raise RuntimeError(
        "yfinance is required. Install with: pip install yfinance"
    ) from exc


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


def _download_raw(
    symbol: str, period: str, interval: str, start: str | None, end: str | None
) -> pd.DataFrame:
    kwargs = {
        "tickers": [symbol],
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
    return yf.download(**kwargs)


def _candidate_symbols(base: str, add_ns_suffix: bool) -> List[str]:
    ticker = base.strip().upper()
    if not ticker:
        return []
    candidates: List[str] = []

    def push(symbol: str) -> None:
        if symbol and symbol not in candidates:
            candidates.append(symbol)

    if ticker.startswith("^") or "." in ticker:
        push(ticker)
        if ticker.endswith(".NS"):
            root = ticker[:-3]
            if root and not root.endswith("L"):
                push(f"{root}L.NS")
        return candidates
    if add_ns_suffix:
        push(f"{ticker}.NS")
        if not ticker.endswith("L"):
            push(f"{ticker}L.NS")
        push(ticker)
        return candidates

    push(ticker)
    push(f"{ticker}.NS")
    if not ticker.endswith("L"):
        push(f"{ticker}L.NS")
    return candidates


def _resolve_symbol_with_fallback(
    base_ticker: str,
    period: str,
    interval: str,
    start: str | None,
    end: str | None,
    add_ns_suffix: bool,
) -> Tuple[str, pd.Series]:
    candidates = _candidate_symbols(base_ticker, add_ns_suffix)
    last_error: Exception | None = None

    for symbol in candidates:
        try:
            raw = _download_raw(symbol, period, interval, start, end)
            if raw is None or raw.empty:
                raise ValueError(f"No data for {symbol}")
            series = _extract_close_column(raw, symbol)
            if series.dropna().empty:
                raise ValueError(f"Close prices unavailable for {symbol}")
            series.name = symbol
            return symbol, series
        except Exception as exc:
            last_error = exc

    raise ValueError(
        f"Could not fetch data for ticker '{base_ticker}'. Last error: {last_error}"
    )


def fetch_price_history(
    tickers: Iterable[str],
    period: str = "2y",
    interval: str = "1d",
    start: str | None = None,
    end: str | None = None,
    add_ns_suffix: bool = True,
) -> pd.DataFrame:
    requested = normalize_tickers(tickers, add_ns_suffix=False)
    series_list: List[pd.Series] = []
    failed: List[str] = []

    for base in requested:
        try:
            _, series = _resolve_symbol_with_fallback(
                base_ticker=base,
                period=period,
                interval=interval,
                start=start,
                end=end,
                add_ns_suffix=add_ns_suffix,
            )
            series_list.append(series)
        except ValueError:
            failed.append(base)

    if not series_list:
        raise ValueError("No price data fetched. Check symbols/date range/network")
    if failed:
        failed_str = ", ".join(failed)
        raise ValueError(f"Could not fetch market data for: {failed_str}")

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
