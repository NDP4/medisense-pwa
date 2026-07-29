#!/usr/bin/env python3
"""
Generate synthetic clinical dataset for MediSense AI demo.
WARNING: This is SYNTHETIC/FICTIONAL data for DEMO purposes only.
Not for clinical use.
"""
import numpy as np
import pandas as pd
import os, json

np.random.seed(42)
OUTPUT_DIR = 'ml/data/synthetic'
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("="*60)
print("MediSense AI — Synthetic Dataset Generator")
print("="*60)

N = 5000

# ─── Generate base demographics ───
age = np.zeros(N)
gender = np.random.choice([0, 1], size=N)  # 0=F, 1=M
bmi = np.random.normal(24, 5, N).clip(12, 50)

# ─── Assign conditions first ───
# We'll allocate: 1500 sepsis, 1500 pneumonia, 500 both, 1500 control
condition = np.zeros((N, 2), dtype=int)  # [sepsis, pneumonia]
indices = np.arange(N)
np.random.shuffle(indices)

# Sepsis only
n_sepsis = 1500
sepsis_idx = indices[:n_sepsis]
condition[sepsis_idx, 0] = 1

# Pneumonia only
n_pneumonia = 1500
pneumonia_idx = indices[n_sepsis:n_sepsis+n_pneumonia]
condition[pneumonia_idx, 1] = 1

# Both
n_both = 500
both_idx = indices[n_sepsis+n_pneumonia:n_sepsis+n_pneumonia+n_both]
condition[both_idx, 0] = 1
condition[both_idx, 1] = 1

# Rest = control (already 0,0)

# ─── Age by condition ───
age[condition[:,0]==1] = np.random.normal(58, 18, (condition[:,0]==1).sum()).clip(18, 95)  # sepsis: older
age[condition[:,1]==1] = np.random.normal(2.5, 1.5, (condition[:,1]==1).sum()).clip(0, 5)   # pneumonia balita
# Adjust overlap: sepsis + pneumonia = infants can also have sepsis
both_age_idx = (condition[:,0]==1) & (condition[:,1]==1)
age[both_age_idx] = np.random.normal(1.5, 1.2, both_age_idx.sum()).clip(0, 5)
# Control: broad
ctrl = (condition.sum(axis=1)==0)
age[ctrl] = np.random.normal(35, 15, ctrl.sum()).clip(5, 80)

print(f"\nCondition distribution:")
print(f"  Sepsis only: {condition[:,0].sum() - n_both}")
print(f"  Pneumonia only: {condition[:,1].sum() - n_both}")
print(f"  Both: {n_both}")
print(f"  Control: {ctrl.sum()}")
print(f"  Total: {N}")

# ─── Vital signs ───
HR = np.zeros(N)
RR = np.zeros(N)
SBP = np.zeros(N)
DBP = np.zeros(N)
TEMP = np.zeros(N)
SPO2 = np.zeros(N)

# Control — normal
n_ctrl = ctrl.sum()
HR[ctrl] = np.random.normal(75, 10, n_ctrl).clip(60, 100)
RR[ctrl] = np.random.normal(16, 3, n_ctrl).clip(12, 24)
SBP[ctrl] = np.random.normal(120, 10, n_ctrl).clip(100, 140)
DBP[ctrl] = np.random.normal(80, 8, n_ctrl).clip(60, 90)
TEMP[ctrl] = np.random.normal(36.8, 0.3, n_ctrl).clip(36.2, 37.5)
SPO2[ctrl] = np.random.normal(98, 1, n_ctrl).clip(95, 100)

# Sepsis — tachycardia, tachypnea, hypotension, fever
s_idx = condition[:,0]==1
n_s = s_idx.sum()
HR[s_idx] = np.random.normal(110, 15, n_s).clip(90, 160)
RR[s_idx] = np.random.normal(24, 6, n_s).clip(18, 40)
SBP[s_idx] = np.random.normal(90, 15, n_s).clip(60, 130)
DBP[s_idx] = np.random.normal(55, 10, n_s).clip(40, 80)
TEMP[s_idx] = np.random.normal(39.0, 0.8, n_s).clip(37.5, 41.5)
SPO2[s_idx] = np.random.normal(94, 4, n_s).clip(85, 99)

# Pneumonia balita — tachypnea (faster RR for children), fever, low SpO2
p_idx = condition[:,1]==1
n_p = p_idx.sum()
# RR reference: <1yr: 30-60, 1-5yr: 20-40
age_p = age[p_idx]
RR[p_idx] = np.where(age_p < 1, 
                     np.random.normal(50, 8, n_p).clip(35, 70),
                     np.random.normal(38, 8, n_p).clip(25, 55))
HR[p_idx] = np.where(age_p < 1,
                     np.random.normal(150, 15, n_p).clip(120, 180),
                     np.random.normal(130, 15, n_p).clip(100, 160))
SBP[p_idx] = np.random.normal(85, 12, n_p).clip(60, 110)
DBP[p_idx] = np.random.normal(55, 10, n_p).clip(40, 75)
TEMP[p_idx] = np.random.normal(38.8, 0.7, n_p).clip(37.5, 41.0)
SPO2[p_idx] = np.random.normal(93, 4, n_p).clip(82, 99)

# ─── Lab values ───
WBC = np.zeros(N)
HGB = np.zeros(N)
PLT = np.zeros(N)
CREAT = np.zeros(N)
GLU = np.zeros(N)
NA = np.zeros(N)
HCO3 = np.zeros(N)

# Control — normal
WBC[ctrl] = np.random.normal(7.5, 2, n_ctrl).clip(4, 11)
HGB[ctrl] = np.random.normal(14, 1.5, n_ctrl).clip(11, 17)
PLT[ctrl] = np.random.normal(250, 50, n_ctrl).clip(150, 400)
CREAT[ctrl] = np.random.normal(0.9, 0.2, n_ctrl).clip(0.5, 1.3)
GLU[ctrl] = np.random.normal(95, 15, n_ctrl).clip(70, 130)
NA[ctrl] = np.random.normal(140, 3, n_ctrl).clip(135, 145)
HCO3[ctrl] = np.random.normal(24, 2, n_ctrl).clip(20, 28)

# Sepsis — elevated WBC, creatinine, low plt, acidosis
WBC[s_idx] = np.where(np.random.random(n_s) < 0.2,  # 20% leukopenia
                      np.random.normal(2.5, 1, n_s).clip(0.5, 4),
                      np.random.normal(18, 6, n_s).clip(12, 35))
HGB[s_idx] = np.random.normal(12, 2, n_s).clip(8, 16)
PLT[s_idx] = np.random.normal(180, 60, n_s).clip(50, 350)
CREAT[s_idx] = np.random.normal(1.8, 0.8, n_s).clip(0.7, 4.0)
GLU[s_idx] = np.random.normal(130, 30, n_s).clip(80, 200)
NA[s_idx] = np.random.normal(137, 4, n_s).clip(130, 145)
HCO3[s_idx] = np.random.normal(20, 3, n_s).clip(14, 26)

# Pneumonia — elevated WBC, normal creatinine
WBC[p_idx] = np.random.normal(15, 5, n_p).clip(8, 30)
HGB[p_idx] = np.random.normal(12.5, 1.5, n_p).clip(9, 16)
PLT[p_idx] = np.random.normal(300, 60, n_p).clip(180, 450)
CREAT[p_idx] = np.random.normal(0.5, 0.15, n_p).clip(0.2, 0.9)  # children have lower creatinine
GLU[p_idx] = np.random.normal(100, 20, n_p).clip(70, 160)
NA[p_idx] = np.random.normal(139, 3, n_p).clip(133, 145)
HCO3[p_idx] = np.random.normal(22, 2.5, n_p).clip(17, 27)

# ─── Symptoms (binary) ───
n_features = N
fever = np.zeros(N, dtype=int)
cough = np.zeros(N, dtype=int)
dyspnea = np.zeros(N, dtype=int)
confusion = np.zeros(N, dtype=int)
chest_pain = np.zeros(N, dtype=int)
diarrhea = np.zeros(N, dtype=int)
cyanosis = np.zeros(N, dtype=int)

# Sepsis symptoms
fever[s_idx] = np.random.random(n_s) < 0.85  # 85% fever
cough[s_idx] = np.random.random(n_s) < 0.30
dyspnea[s_idx] = np.random.random(n_s) < 0.60
confusion[s_idx] = np.random.random(n_s) < 0.55
chest_pain[s_idx] = np.random.random(n_s) < 0.15
diarrhea[s_idx] = np.random.random(n_s) < 0.20
cyanosis[s_idx] = np.random.random(n_s) < 0.10

# Pneumonia symptoms
fever[p_idx] = np.random.random(n_p) < 0.90
cough[p_idx] = np.random.random(n_p) < 0.85
dyspnea[p_idx] = np.random.random(n_p) < 0.75
confusion[p_idx] = np.random.random(n_p) < 0.10  # rare in kids
chest_pain[p_idx] = np.random.random(n_p) < 0.25
diarrhea[p_idx] = np.random.random(n_p) < 0.20
cyanosis[p_idx] = np.random.random(n_p) < 0.15

# Control — very low symptom rates
fever[ctrl] = np.random.random(n_ctrl) < 0.02
cough[ctrl] = np.random.random(n_ctrl) < 0.03
dyspnea[ctrl] = np.random.random(n_ctrl) < 0.01
confusion[ctrl] = np.random.random(n_ctrl) < 0.005
chest_pain[ctrl] = np.random.random(n_ctrl) < 0.01
diarrhea[ctrl] = np.random.random(n_ctrl) < 0.015
cyanosis[ctrl] = np.random.random(n_ctrl) < 0.002

# ─── Build DataFrame ───
df = pd.DataFrame({
    'age': age.round(1),
    'gender': gender,
    'bmi': bmi.round(1),
    'heart_rate': HR.round(0).astype(int),
    'respiratory_rate': RR.round(0).astype(int),
    'systolic_bp': SBP.round(0).astype(int),
    'diastolic_bp': DBP.round(0).astype(int),
    'temperature': TEMP.round(1),
    'spo2': SPO2.round(0).astype(int),
    'wbc': WBC.round(1),
    'hemoglobin': HGB.round(1),
    'platelet': PLT.round(0).astype(int),
    'creatinine': CREAT.round(2),
    'glucose': GLU.round(0).astype(int),
    'sodium': NA.round(0).astype(int),
    'bicarbonate': HCO3.round(1),
    'fever': fever,
    'cough': cough,
    'dyspnea': dyspnea,
    'confusion': confusion,
    'chest_pain': chest_pain,
    'diarrhea': diarrhea,
    'cyanosis': cyanosis,
})

y = condition  # [sepsis, pneumonia]

# ─── Save ───
df.to_csv(f'{OUTPUT_DIR}/synthetic_data.csv', index=False)
np.save(f'{OUTPUT_DIR}/synthetic_labels.npy', y)
np.save(f'{OUTPUT_DIR}/feature_names.npy', np.array(df.columns.tolist()))
np.save(f'{OUTPUT_DIR}/label_names.npy', np.array(['sepsis', 'pneumonia_balita']))

print(f"\n✅ Dataset saved to {OUTPUT_DIR}/")
print(f"   synthetic_data.csv — {df.shape}")
print(f"   synthetic_labels.npy — {y.shape}")

# ─── Summary stats ───
print(f"\n{'='*60}")
print("Per-condition statistics (mean ± std for key features):")
print(f"{'='*60}")

for cond_name, cond_idx in [('Sepsis', condition[:,0]==1), 
                              ('Pneumonia', condition[:,1]==1),
                              ('Control', ctrl)]:
    print(f"\n--- {cond_name} ({cond_idx.sum()} samples) ---")
    for feat in ['age', 'heart_rate', 'respiratory_rate', 'temperature', 'spo2',
                 'wbc', 'creatinine', 'fever', 'cough', 'dyspnea', 'confusion']:
        if feat in ['fever', 'cough', 'dyspnea', 'confusion', 'cyanosis', 'chest_pain', 'diarrhea']:
            val = df.loc[cond_idx, feat].mean() * 100
            print(f"   {feat:20s}: {val:.0f}% positive")
        else:
            val = df.loc[cond_idx, feat].mean()
            std = df.loc[cond_idx, feat].std()
            print(f"   {feat:20s}: {val:.1f} ± {std:.1f}")