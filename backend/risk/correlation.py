from __future__ import annotations

import pandas as pd


def correlation_matrix(returns: pd.DataFrame) -> pd.DataFrame:
    if returns.empty:
        raise ValueError("Returns table is empty")
    corr = returns.corr(method="pearson")
    return corr.fillna(0.0)
