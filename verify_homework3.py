import numpy as np
from scipy.stats import chi2_contingency

# --- 9.10 Titanic Survival by Class ---
# Set up the observed counts matrix
# Rows: Survived, Died
# Columns: 1st, 2nd, 3rd
# 1st: 323 total, 200 survived -> 123 died
# 2nd: 277 total, 119 survived -> 158 died
# 3rd: 709 total, 181 survived -> 528 died

obs = np.array([
    [200, 119, 181],
    [123, 158, 528]
])

chi2, p, dof, ex = chi2_contingency(obs, correction=False)

print("9.10 Titanic Expected Counts:")
print(ex.round(2))
print(f"\nChi-Square Statistic: {chi2:.2f}")
print(f"P-value: {p:.4e}")
