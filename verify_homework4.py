import scipy.stats as st
import numpy as np

# --- 9.26 Longleaf Pine Trees (Goodness of Fit) ---
obs_26 = [18, 22, 39, 21]
exp_26 = [25, 25, 25, 25] # 100 total trees / 4 quadrants
chi2_26, pval_26 = st.chisquare(obs_26, f_exp=exp_26)

print("9.26 Goodness of Fit:")
print(f"  Chi-Square = {chi2_26:.4f}")
print(f"  P-value = {pval_26:.4f}\n")


# --- 9.29 DFW Rates (Chi-Square for Independence) ---
# Calculate expected counts based on the percentages given
# Year 1: 2408 * 0.423 = 1018.584 -> round to 1019 DFW, 1389 Pass
# Year 2: 2325 * 0.249 = 578.925 -> round to 579 DFW, 1746 Pass
# Year 3: 2126 * 0.199 = 423.074 -> round to 423 DFW, 1703 Pass

obs_29 = np.array([
    [1019, 579, 423],  # DFW counts
    [1389, 1746, 1703] # Pass counts
])

chi2_29, pval_29, dof_29, exp_29 = st.chi2_contingency(obs_29, correction=False)

print("9.29 DFW Rates Contingency:")
print(f"  Observed DFW: {obs_29[0]}")
print(f"  Observed Pass: {obs_29[1]}")
print(f"  Chi-Square = {chi2_29:.4f}")
print(f"  P-value = {pval_29:.4e}")
