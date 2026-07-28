#!/usr/bin/env python3
"""
Training Pipeline — MediSense AI
Dense NN + Attention for Multi-label Triage Classification

Input: ml/data/processed/
Output: ml/models/mediSense_model.h5
"""

import os
import sys
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, regularizers
from sklearn.metrics import (accuracy_score, precision_score, recall_score, 
                             f1_score, roc_auc_score, confusion_matrix,
                             classification_report)
import json
import warnings
warnings.filterwarnings('ignore')

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
DATA_DIR = os.path.join(PROJECT_ROOT, 'ml/data/processed')
MODEL_DIR = os.path.join(PROJECT_ROOT, 'ml/models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("MediSense AI — Model Training")
print("=" * 60)

# ─── 1. Load Preprocessed Data ──────────────────────────────
print("\n[1/5] Loading preprocessed data...")

X_train = np.load(os.path.join(DATA_DIR, 'X_train.npy'))
y_train = np.load(os.path.join(DATA_DIR, 'y_train.npy'))
X_val = np.load(os.path.join(DATA_DIR, 'X_val.npy'))
y_val = np.load(os.path.join(DATA_DIR, 'y_val.npy'))
X_test = np.load(os.path.join(DATA_DIR, 'X_test.npy'))
y_test = np.load(os.path.join(DATA_DIR, 'y_test.npy'))
label_names = np.load(os.path.join(DATA_DIR, 'label_names.npy'))

print(f"  X_train: {X_train.shape}")
print(f"  y_train: {y_train.shape}")
print(f"  X_val:   {X_val.shape}")
print(f"  X_test:  {X_test.shape}")
print(f"  Labels:  {label_names}")

n_features = X_train.shape[1]
n_labels = y_train.shape[1]

# ─── 2. Build Model ─────────────────────────────────────────
print("\n[2/5] Building Dense NN + Attention...")

def build_model(input_dim, output_dim):
    """Dense Neural Network with Lightweight Self-Attention."""
    inputs = keras.Input(shape=(input_dim,), name='symptom_input')
    
    # Hidden Layer 1
    x = layers.Dense(256, kernel_regularizer=regularizers.l2(1e-4))(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.3)(x)
    
    # Hidden Layer 2
    x = layers.Dense(128, kernel_regularizer=regularizers.l2(1e-4))(x)
    x = layers.BatchNormalization()(x)
    x = layers.Activation('relu')(x)
    x = layers.Dropout(0.2)(x)
    
    # Lightweight Self-Attention
    # Reshape untuk attention (sequence length = 1, feature dim = 128)
    attention_input = layers.Reshape((1, 128))(x)
    attention = layers.MultiHeadAttention(
        num_heads=4, key_dim=32, dropout=0.1
    )(attention_input, attention_input)
    attention = layers.Flatten()(attention)
    
    # Skip connection
    x = layers.Concatenate()([x, attention])
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dropout(0.1)(x)
    
    # Output layer: multi-label classification
    outputs = layers.Dense(output_dim, activation='sigmoid', name='triage_output')(x)
    
    model = keras.Model(inputs=inputs, outputs=outputs)
    return model

model = build_model(n_features, n_labels)
model.summary()

# ─── 3. Compile & Train ─────────────────────────────────────
print("\n[3/5] Compiling and training...")

# Class weights untuk handle imbalance
pos_counts = y_train.sum(axis=0)
neg_counts = len(y_train) - pos_counts
total = len(y_train)

class_weights = {}
for i in range(n_labels):
    # Weighted loss: beri bobot lebih pada kelas positif (minoritas)
    weight_pos = total / (2 * pos_counts[i]) if pos_counts[i] > 0 else 1.0
    weight_neg = total / (2 * neg_counts[i]) if neg_counts[i] > 0 else 1.0
    class_weights[i] = {0: weight_neg, 1: weight_pos}
    print(f"  {label_names[i]}: weight_pos={weight_pos:.2f}, weight_neg={weight_neg:.2f}")

# Sample weights array
sample_weights = np.ones(len(y_train))
for i in range(n_labels):
    for j in range(len(y_train)):
        if y_train[j, i] == 1:
            sample_weights[j] *= class_weights[i][1]

# Compile
optimizer = keras.optimizers.AdamW(learning_rate=1e-3, weight_decay=1e-4)
model.compile(
    optimizer=optimizer,
    loss='binary_crossentropy',
    metrics=['accuracy', keras.metrics.AUC(name='auc', multi_label=True)]
)

# Callbacks
callbacks = [
    keras.callbacks.EarlyStopping(
        monitor='val_auc', patience=30, mode='max', 
        restore_best_weights=True, verbose=1
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss', factor=0.5, patience=10, 
        min_lr=1e-6, verbose=1
    ),
    keras.callbacks.ModelCheckpoint(
        os.path.join(MODEL_DIR, 'best_model.h5'),
        monitor='val_auc', mode='max', save_best_only=True, verbose=1
    )
]

# Train
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=200,
    batch_size=16,
    callbacks=callbacks,
    sample_weight=sample_weights,
    verbose=1
)

# ─── 4. Evaluate ────────────────────────────────────────────
print("\n[4/5] Evaluating model on test set...")

# Load best model
model = keras.models.load_model(os.path.join(MODEL_DIR, 'best_model.h5'))

# Predict
y_pred_prob = model.predict(X_test, verbose=0)
y_pred = (y_pred_prob > 0.5).astype(int)

# Per-label metrics
print("\n  Per-label performance:")
results = []
for i in range(n_labels):
    acc = accuracy_score(y_test[:, i], y_pred[:, i])
    prec = precision_score(y_test[:, i], y_pred[:, i], zero_division=0)
    rec = recall_score(y_test[:, i], y_pred[:, i], zero_division=0)
    f1 = f1_score(y_test[:, i], y_pred[:, i], zero_division=0)
    try:
        auc = roc_auc_score(y_test[:, i], y_pred_prob[:, i])
    except:
        auc = 0.0
    
    results.append({
        'condition': label_names[i],
        'accuracy': float(acc),
        'precision': float(prec),
        'recall': float(rec),
        'f1': float(f1),
        'auc': float(auc)
    })
    print(f"  {label_names[i]}: AUC={auc:.4f}, Sens={rec:.4f}, Prec={prec:.4f}, F1={f1:.4f}")

# Overall metrics
overall_acc = accuracy_score(y_test.flatten(), y_pred.flatten())
overall_prec = precision_score(y_test, y_pred, average='macro', zero_division=0)
overall_rec = recall_score(y_test, y_pred, average='macro', zero_division=0)
overall_f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)
try:
    overall_auc = roc_auc_score(y_test, y_pred_prob, multi_class='ovo')
except:
    overall_auc = 0.0

print(f"\n  Overall:")
print(f"    Accuracy:  {overall_acc:.4f}")
print(f"   Precision:  {overall_prec:.4f}")
print(f"      Recall:  {overall_rec:.4f}")
print(f"          F1:  {overall_f1:.4f}")
print(f"   ROC-AUC:    {overall_auc:.4f}")

# ─── 5. Save Final Model ────────────────────────────────────
print("\n[5/5] Saving model...")

# Save full model
model.save(os.path.join(MODEL_DIR, 'medisense_model.h5'))
print(f"  Saved: ml/models/medisense_model.h5")

# Save evaluation results
eval_results = {
    'overall': {
        'accuracy': float(overall_acc),
        'precision': float(overall_prec),
        'recall': float(overall_rec),
        'f1': float(overall_f1),
        'auc': float(overall_auc)
    },
    'per_condition': results,
    'model_params': {
        'input_dim': n_features,
        'output_dim': n_labels,
        'architecture': 'DenseNN+Attention'
    }
}

with open(os.path.join(MODEL_DIR, 'eval_results.json'), 'w') as f:
    json.dump(eval_results, f, indent=2)

print(f"\n✅ Training complete!")
print(f"   Model: ml/models/medisense_model.h5")
print(f"   Eval:  ml/models/eval_results.json")
