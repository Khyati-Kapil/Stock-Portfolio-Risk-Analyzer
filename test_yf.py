import yfinance as yf
for ticker in ["BAJAJHFL.NS", "BAJAJFINANCE.NS", "BAJAJHFN.NS", "BAJAJHFNL.NS"]:
    try:
        t = yf.Ticker(ticker)
        print(ticker, len(t.history(period="1d")))
    except Exception as e:
        print(ticker, str(e))
