import scipy.stats as st
import math

# --- 8.35 & 8.37 & 8.39: Tipping and Shirts ---
n1_tip, x1_tip = 69, 40
n2_tip, x2_tip = 349, 130
p1_tip = x1_tip / n1_tip
p2_tip = x2_tip / n2_tip
diff_tip = p1_tip - p2_tip

# 8.37a CI
se_tip = math.sqrt((p1_tip * (1 - p1_tip) / n1_tip) + (p2_tip * (1 - p2_tip) / n2_tip))
me_tip = 1.96 * se_tip
ci_tip = (diff_tip - me_tip, diff_tip + me_tip)

# 8.39a Sig Test
p_pool_tip = (x1_tip + x2_tip) / (n1_tip + n2_tip)
se_pool_tip = math.sqrt(p_pool_tip * (1 - p_pool_tip) * ((1 / n1_tip) + (1 / n2_tip)))
z_tip = diff_tip / se_pool_tip
pval_tip = 2 * (1 - st.norm.cdf(abs(z_tip)))

print(f"8.35a/8.37a/8.39a (Tipping):")
print(f"  Diff = {diff_tip:.4f}, SE = {se_tip:.4f}, CI = ({ci_tip[0]:.4f}, {ci_tip[1]:.4f})")
print(f"  Pooled p = {p_pool_tip:.4f}, Z = {z_tip:.4f}, P-value = {pval_tip:.4f}\n")


# --- 8.35 & 8.37 & 8.39: Stretching ---
n1_str, x1_str = 20, 11
n2_str, x2_str = 20, 14
p1_str = x1_str / n1_str
p2_str = x2_str / n2_str
diff_str = p1_str - p2_str

# 8.37b CI
se_str = math.sqrt((p1_str * (1 - p1_str) / n1_str) + (p2_str * (1 - p2_str) / n2_str))
me_str = 1.96 * se_str
ci_str = (diff_str - me_str, diff_str + me_str)

# 8.39b Sig Test
p_pool_str = (x1_str + x2_str) / (n1_str + n2_str)
se_pool_str = math.sqrt(p_pool_str * (1 - p_pool_str) * ((1 / n1_str) + (1 / n2_str)))
z_str = diff_str / se_pool_str
pval_str = 2 * (1 - st.norm.cdf(abs(z_str)))

print(f"8.35b/8.37b/8.39b (Stretching):")
print(f"  Diff = {diff_str:.4f}, SE = {se_str:.4f}, CI = ({ci_str[0]:.4f}, {ci_str[1]:.4f})")
print(f"  Pooled p = {p_pool_str:.4f}, Z = {z_str:.4f}, P-value = {pval_str:.4f}\n")


# --- 8.42 & 8.43 & 8.44: Exergaming ---
n1_ex = 358
p1_ex = 0.299
x1_ex = round(n1_ex * p1_ex) # 107

n2_ex = 851
p2_ex = 0.208
x2_ex = round(n2_ex * p2_ex) # 177
diff_ex = p1_ex - p2_ex

# 8.43 CI
se_ex = math.sqrt((p1_ex * (1 - p1_ex) / n1_ex) + (p2_ex * (1 - p2_ex) / n2_ex))
me_ex = 1.96 * se_ex
ci_ex = (diff_ex - me_ex, diff_ex + me_ex)

# 8.44 Sig Test
p_pool_ex = (x1_ex + x2_ex) / (n1_ex + n2_ex)
se_pool_ex = math.sqrt(p_pool_ex * (1 - p_pool_ex) * ((1 / n1_ex) + (1 / n2_ex)))
z_ex = diff_ex / se_pool_ex
pval_ex = 2 * (1 - st.norm.cdf(abs(z_ex)))

print(f"8.42/8.43/8.44 (Exergaming):")
print(f"  Counts: x1 = {x1_ex}, x2 = {x2_ex}")
print(f"  Diff = {diff_ex:.4f}, SE = {se_ex:.4f}, CI = ({ci_ex[0]:.4f}, {ci_ex[1]:.4f})")
print(f"  Pooled p = {p_pool_ex:.4f}, Z = {z_ex:.4f}, P-value = {pval_ex:.4f}")
