#!/usr/bin/env python3
"""
Preprocessing Pipeline — MediSense AI
MIMIC-IV Demo → Feature Matrix untuk Multi-label Triage Classification

Output: ml/data/processed/
  - X_train.npy, y_train.npy
  - X_val.npy, y_val.npy  
  - X_test.npy, y_test.npy
  - feature_names.npy
  - label_names.npy
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from imblearn.over_sampling import SMOTE
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DATA_DIR = os.path.join(PROJECT_ROOT, 'dataset')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'ml/data/processed')
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("=" * 60)
print("MediSense AI — Preprocessing Pipeline")
print("=" * 60)

# ─── 1. Load Data ───────────────────────────────────────────
print("\n[1/6] Loading MIMIC-IV demo tables...")

patients = pd.read_csv(os.path.join(DATA_DIR, 'hosp/patients.csv'))
admissions = pd.read_csv(os.path.join(DATA_DIR, 'hosp/admissions.csv'))
diagnoses = pd.read_csv(os.path.join(DATA_DIR, 'hosp/diagnoses_icd.csv'))
d_icd = pd.read_csv(os.path.join(DATA_DIR, 'hosp/d_icd_diagnoses.csv'))
demo_ids = pd.read_csv(os.path.join(DATA_DIR, 'demo_subject_id.csv'))

print(f"  Patients: {len(patients)}")
print(f"  Admissions: {len(admissions)}")
print(f"  Diagnoses: {len(diagnoses)}")
print(f"  Unique ICD codes: {diagnoses['icd_code'].nunique()}")

# ─── 2. ICD Code Mapping ────────────────────────────────────
print("\n[2/6] Mapping ICD codes to 5 target conditions...")

# ICD Code mapping for 5 priority conditions (ICD-9 only for MIMIC-IV demo)
CONDITION_MAP = {
    'sepsis': {
        'codes': ['038', '99591', '99592', '78552'],
        'icd_version': 9,
        'description': 'Sepsis'
    },
    'stroke_iskemik': {
        'codes': ['433', '434', '436'],  
        'icd_version': 9,
        'description': 'Stroke Iskemik'
    },
    'pre_eklampsia': {
        'codes': ['6424', '6425', '6426'],
        'icd_version': 9,
        'description': 'Pre-Eklampsia'
    },
    'dbd': {
        'codes': ['061', '0654'],
        'icd_version': 9,
        'description': 'Demam Berdarah Dengue'
    },
    'pneumonia_balita': {
        'codes': ['480', '481', '482', '483', '484', '485', '486'],
        'icd_version': 9,
        'description': 'Pneumonia'
    }
}

def match_icd_code(icd_code, condition_codes):
    """Match ICD code against list of prefixes/exact codes."""
    icd_str = str(icd_code).replace('.', '').strip()
    for cc in condition_codes:
        if icd_str.startswith(cc):
            return True
    return False

def create_labels(diagnoses_df):
    """Create multi-label matrix per admission."""
    # Group diagnoses by admission
    grouped = diagnoses_df.groupby('hadm_id')
    label_names = list(CONDITION_MAP.keys())
    
    records = []
    for hadm_id, group in grouped:
        labels = []
        codes = group['icd_code'].tolist()
        versions = group['icd_version'].tolist()
        
        for condition_name, config in CONDITION_MAP.items():
            matched = False
            for code, ver in zip(codes, versions):
                if ver == config['icd_version'] and match_icd_code(code, config['codes']):
                    matched = True
                    break
            labels.append(1 if matched else 0)
        records.append({'hadm_id': hadm_id, 'labels': labels})
    
    return records, label_names

label_records, label_names = create_labels(diagnoses)
print(f"  Admissions with labels: {len(label_records)}")

# Count prevalence
label_df = pd.DataFrame([r['labels'] for r in label_records], columns=label_names)
print("\n  Condition prevalence:")
for col in label_names:
    count = label_df[col].sum()
    print(f"    {col}: {int(count)} cases ({count/len(label_df)*100:.1f}%)")

# ─── 3. Feature Engineering ─────────────────────────────────
print("\n[3/6] Engineering features...")

# Join admissions with patients
adm = admissions.merge(patients[['subject_id', 'anchor_age', 'gender', 'anchor_year_group']], 
                       on='subject_id', how='left')

# Convert gender to binary
adm['gender_male'] = (adm['gender'] == 'M').astype(int)

# Encode admission type
adm['is_emergency'] = (adm['admission_type'] == 'EMERGENCY').astype(int)
adm['is_urgent'] = (adm['admission_type'] == 'URGENT').astype(int)

# Encode insurance
adm['insurance_medicaid'] = (adm['insurance'] == 'Medicaid').astype(int)
adm['insurance_medicare'] = (adm['insurance'] == 'Medicare').astype(int)
adm['insurance_other'] = (~adm['insurance'].isin(['Medicaid', 'Medicare'])).astype(int)

# Age features
adm['age'] = pd.to_numeric(adm['anchor_age'], errors='coerce')
adm['age'] = adm['age'].fillna(adm['age'].median())
adm['age_squared'] = adm['age'] ** 2 / 100  # scaled
adm['is_elderly'] = (adm['age'] >= 65).astype(int)

# Anchor year group encoding
anchor_groups = pd.get_dummies(adm['anchor_year_group'], prefix='era')
adm = pd.concat([adm, anchor_groups], axis=1)

# LOS features (if available)
if 'admittime' in adm.columns and 'dischtime' in adm.columns:
    adm['admittime'] = pd.to_datetime(adm['admittime'], errors='coerce')
    adm['dischtime'] = pd.to_datetime(adm['dischtime'], errors='coerce')
    adm['los_days'] = (adm['dischtime'] - adm['admittime']).dt.total_seconds() / (24*3600)
    adm['los_days'] = adm['los_days'].fillna(adm['los_days'].median())
    adm['los_days'] = adm['los_days'].clip(0, 365)
else:
    adm['los_days'] = 0

# Hospital expire flag
adm['expired'] = adm['hospital_expire_flag'].fillna(0).astype(int)

# Select feature columns
feature_cols = [
    'age', 'age_squared', 'is_elderly',
    'gender_male',
    'is_emergency', 'is_urgent',
    'insurance_medicaid', 'insurance_medicare', 'insurance_other',
    'los_days', 'expired'
] + [c for c in adm.columns if c.startswith('era_')]

print(f"  Initial features: {len(feature_cols)}")

# Merge labels
label_map = {r['hadm_id']: r['labels'] for r in label_records}
adm['labels'] = adm['hadm_id'].map(label_map)

# Drop admissions without labels
adm = adm.dropna(subset=['labels'])
print(f"  Admissions after label merge: {len(adm)}")

# Create feature matrix
X = adm[feature_cols].fillna(0).values.astype(np.float32)
y = np.array(adm['labels'].tolist(), dtype=np.float32)

print(f"  X shape: {X.shape}")
print(f"  y shape: {y.shape}")

# ─── 4. Augment with Vital Signs ────────────────────────────
print("\n[4/6] Attempting vital signs augmentation...")

# Try to load chartevents for symptom features
chart_path = os.path.join(DATA_DIR, 'icu/chartevents.csv')
if os.path.exists(chart_path):
    print("  Loading chartevents (vital signs)...")
    # Sample chartevents to keep memory manageable
    chart_cols = ['subject_id', 'hadm_id', 'itemid', 'valuenum', 'charttime']
    try:
        chart = pd.read_csv(chart_path, usecols=chart_cols, nrows=100000)
        
        # Map itemid to symptom categories
        # Common vital sign itemids in MIMIC-IV
        VITAL_MAP = {
            'temperature': [223761, 223762],  # Fahrenheit/Celsius
            'heart_rate': [220045, 220210],
            'respiratory_rate': [220210, 224689],
            'sbp': [220050, 220179],  # Systolic BP
            'dbp': [220051, 220180],  # Diastolic BP
            'spo2': [220277, 223835],
            'gcs': [220739],  # Glasgow Coma Scale
        }
        
        vital_features = {}
        for adm_id in adm['hadm_id'].unique():
            adm_chart = chart[chart['hadm_id'] == adm_id]
            if len(adm_chart) == 0:
                continue
            
            features = []
            for vit_name, vit_ids in VITAL_MAP.items():
                vit_vals = adm_chart[adm_chart['itemid'].isin(vit_ids)]['valuenum'].dropna()
                if len(vit_vals) > 0:
                    features.extend([vit_vals.mean(), vit_vals.max()])
                else:
                    features.extend([np.nan, np.nan])
            vital_features[adm_id] = features
        
        # Add vital sign features to X matrix
        vital_df = pd.DataFrame.from_dict(vital_features, orient='index')
        vital_df.index.name = 'hadm_id'
        vital_df = vital_df.reset_index()
        
        adm_with_vitals = adm.merge(vital_df, on='hadm_id', how='left')
        vital_cols = [c for c in adm_with_vitals.columns if c not in adm.columns and c != 'hadm_id']
        
        if len(vital_cols) > 0:
            X_vitals = adm_with_vitals[vital_cols].fillna(0).values.astype(np.float32)
            X = np.hstack([X, X_vitals])
            feature_cols.extend(vital_cols)
            print(f"  Added {len(vital_cols)} vital sign features")
        else:
            print("  No vital signs data merged")
            
    except Exception as e:
        print(f"  Warning: Could not process chartevents: {e}")
else:
    print("  No chartevents file found, skipping vital signs")

print(f"  Final X shape: {X.shape}")

# ─── 5. Train/Val/Test Split + SMOTE ────────────────────────
print("\n[5/6] Train/val/test split with SMOTE augmentation...")

# First split: train vs temp (val + test)
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.30, random_state=42, stratify=y.sum(axis=1).clip(0, 1)
)

# Second split: val vs test
X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.50, random_state=42, 
    stratify=y_temp.sum(axis=1).clip(0, 1)
)

print(f"  Train: {X_train.shape[0]} samples")
print(f"  Val:   {X_val.shape[0]} samples")
print(f"  Test:  {X_test.shape[0]} samples")

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)

# ─── 6. Save Preprocessed Data ──────────────────────────────
print(f"\n[6/6] Saving to {OUTPUT_DIR}...")

np.save(os.path.join(OUTPUT_DIR, 'X_train.npy'), X_train_scaled)
np.save(os.path.join(OUTPUT_DIR, 'y_train.npy'), y_train)
np.save(os.path.join(OUTPUT_DIR, 'X_val.npy'), X_val_scaled)
np.save(os.path.join(OUTPUT_DIR, 'y_val.npy'), y_val)
np.save(os.path.join(OUTPUT_DIR, 'X_test.npy'), X_test_scaled)
np.save(os.path.join(OUTPUT_DIR, 'y_test.npy'), y_test)
np.save(os.path.join(OUTPUT_DIR, 'feature_names.npy'), np.array(feature_cols))
np.save(os.path.join(OUTPUT_DIR, 'label_names.npy'), np.array(label_names))

# Also save scaler for inference pipeline
import joblib
joblib.dump(scaler, os.path.join(OUTPUT_DIR, 'scaler.pkl'))

print(f"\n✅ Preprocessing complete!")
print(f"   Features: {X_train_scaled.shape[1]}")
print(f"   Labels: {y_train.shape[1]}")
print(f"   Train: {X_train_scaled.shape[0]}, Val: {X_val_scaled.shape[0]}, Test: {X_test_scaled.shape[0]}")

# Print class balance
print("\n   Label distribution (train):")
for i, name in enumerate(label_names):
    count = y_train[:, i].sum()
    print(f"     {name}: {int(count)} ({count/len(y_train)*100:.1f}%)")
