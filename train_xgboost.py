import pandas as pd
import joblib

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# 1. Load dataset
# ==========================================

DATA_PATH = "dataset/fertilizer_recommendation.csv"

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Shape:", df.shape)
print("\nColumns:")
print(df.columns.tolist())


# ==========================================
# 2. Target column
# ==========================================

TARGET = "Recommended_Fertilizer"

X = df.drop(columns=[TARGET])
y = df[TARGET]


# ==========================================
# 3. Handle categorical columns
# ==========================================

categorical_columns = X.select_dtypes(
    include=["object", "category"]
).columns

print("\nCategorical columns:")
print(categorical_columns.tolist())

# Convert categorical data into numerical columns
X = pd.get_dummies(X, columns=categorical_columns, drop_first=True)


# ==========================================
# 4. Encode target labels
# ==========================================

label_encoder = LabelEncoder()

y_encoded = label_encoder.fit_transform(y)

print("\nFertilizer classes:")
for i, label in enumerate(label_encoder.classes_):
    print(i, "=", label)


# ==========================================
# 5. Train/Test split
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# 6. Create XGBoost model
# ==========================================

model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    objective="multi:softprob",
    eval_metric="mlogloss",
    random_state=42
)


# ==========================================
# 7. Train model
# ==========================================

print("\nTraining XGBoost model...")

model.fit(X_train, y_train)

print("XGBoost training completed!")


# ==========================================
# 8. Evaluate
# ==========================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("\n================================")
print(f"XGBoost Test Accuracy: {accuracy * 100:.2f}%")
print("================================")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=label_encoder.classes_
    )
)


# ==========================================
# 9. Save model
# ==========================================

model_data = {
    "model": model,
    "label_encoder": label_encoder,
    "feature_columns": X.columns.tolist()
}

joblib.dump(
    model_data,
    "models/fertilizer_xgboost.pkl"
)

print("\nModel saved successfully!")
print("Location: models/fertilizer_xgboost.pkl")