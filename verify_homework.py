import scipy.stats as st
import math

# 8.11 Inuits Country Food
p_hat_11 = 3274 / 5000
se_11 = math.sqrt(p_hat_11 * (1 - p_hat_11) / 5000)
me_11 = 1.96 * se_11
ci_11 = (p_hat_11 - me_11, p_hat_11 + me_11)
print(f"8.11: p_hat={p_hat_11:.4f}, CI=({ci_11[0]:.4f}, {ci_11[1]:.4f})")

# 8.18 Student Credit Cards
p_hat_18 = 1087 / 1430
se_18 = math.sqrt(p_hat_18 * (1 - p_hat_18) / 1430)
me_18 = 1.96 * se_18
ci_18 = (p_hat_18 - me_18, p_hat_18 + me_18)
print(f"8.18: p_hat={p_hat_18:.4f}, CI=({ci_18[0]:.4f}, {ci_18[1]:.4f})")

# 8.19 Four or more cards
p_hat_19 = 0.43
se_19 = math.sqrt(p_hat_19 * (1 - p_hat_19) / 1430)
me_19 = 1.96 * se_19
ci_19 = (p_hat_19 - me_19, p_hat_19 + me_19)
print(f"8.19: p_hat={p_hat_19:.4f}, CI=({ci_19[0]:.4f}, {ci_19[1]:.4f})")

# 8.20 Changing Confidence Intervals
z_90 = st.norm.ppf(0.95) # 1.645
me_20a = z_90 * se_19
ci_20a = (p_hat_19 - me_20a, p_hat_19 + me_20a)

z_97 = st.norm.ppf(0.985) # 2.17
me_20b = z_97 * se_19
ci_20b = (p_hat_19 - me_20b, p_hat_19 + me_20b)
print(f"8.20a (90%): CI=({ci_20a[0]:.4f}, {ci_20a[1]:.4f})")
print(f"8.20b (97%): CI=({ci_20b[0]:.4f}, {ci_20b[1]:.4f})")

# 8.24 Instant vs Fresh
p_hat_24 = 32 / 50
z_24 = (p_hat_24 - 0.5) / math.sqrt(0.5 * 0.5 / 50)
p_val_24 = 1 - st.norm.cdf(z_24)
print(f"8.24: z={z_24:.4f}, p-value={p_val_24:.4f}")

# 8.25 Kerrich's Coin
p_hat_25 = 5067 / 10000
z_25 = (p_hat_25 - 0.5) / math.sqrt(0.5 * 0.5 / 10000)
p_val_25 = 2 * (1 - st.norm.cdf(z_25))
se_25 = math.sqrt(p_hat_25 * (1 - p_hat_25) / 10000)
ci_25 = (p_hat_25 - (1.96 * se_25), p_hat_25 + (1.96 * se_25))
print(f"8.25: z={z_25:.4f}, p-value={p_val_25:.4f}, CI=({ci_25[0]:.4f}, {ci_25[1]:.4f})")
