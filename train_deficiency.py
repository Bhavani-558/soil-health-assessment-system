import os
import pandas as pd
import joblib

from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


# ============================================================
# 1. Load dataset
# ============================================================

DATA_PATH = "dataset/fertilizer_recommendation.csv"

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"Dataset not found: {DATA_PATH}\n"
        "Make sure fertilizer_recommendation.csv is inside the dataset folder."
    )

df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)

print("\nAvailable columns:")
print(df.columns.tolist())


# ============================================================
# 2. Detect required columns
# ============================================================

def find_column(possible_names):
    """
    Find a column using exact or partial matching.
    """

    # Exact match
    for name in possible_names:
        if name in df.columns:
            return name

    # Partial match
    for column in df.columns:
        column_lower = column.lower()

        for name in possible_names:
            if name.lower() in column_lower:
                return column

    return None


nitrogen_col = find_column([
    "Nitrogen_L",
    "Nitrogen",
    "nitrogen_p"
])

phosphorus_col = find_column([
    "Phosphoru",
    "Phosphorus",
    "phosphorus"
])

potassium_col = find_column([
    "Potassium",
    "potassium"
])

ph_col = find_column([
    "Soil_pH",
    "soil_ph",
    "pH",
    "ph"
])

moisture_col = find_column([
    "Soil_Moist",
    "soil_moisture",
    "moisture"
])

organic_col = find_column([
    "Organic_C",
    "organic_matter",
    "organic"
])

electrical_col = find_column([
    "Electrical_",
    "electrical_conductivity",
    "EC"
])

temperature_col = find_column([
    "Temperatu",
    "Temperature",
    "soil_temp"
])

humidity_col = find_column([
    "Humidity",
    "humidity"
])

rainfall_col = find_column([
    "Rainfall",
    "rainfall"
])


# ============================================================
# 3. Check required columns
# ============================================================

required_columns = {
    "Nitrogen": nitrogen_col,
    "Phosphorus": phosphorus_col,
    "Potassium": potassium_col,
    "pH": ph_col,
    "Moisture": moisture_col,
    "Organic Carbon": organic_col,
    "Electrical Conductivity": electrical_col,
    "Temperature": temperature_col,
    "Humidity": humidity_col,
    "Rainfall": rainfall_col
}

print("\nDetected columns:")

for name, column in required_columns.items():
    print(f"{name}: {column}")

missing = [
    name
    for name, column in required_columns.items()
    if column is None
]

if missing:
    raise ValueError(
        "\nCould not find these required columns: "
        + ", ".join(missing)
    )


# ============================================================
# 4. Convert required columns to numeric
# ============================================================

numeric_columns = [
    nitrogen_col,
    phosphorus_col,
    potassium_col,
    ph_col,
    moisture_col,
    organic_col,
    electrical_col,
    temperature_col,
    humidity_col,
    rainfall_col
]

for column in numeric_columns:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# Remove rows with missing values

df = df.dropna(
    subset=numeric_columns
).copy()

print("\nDataset after cleaning:", df.shape)


# ============================================================
# 5. Nutrient deficiency thresholds
# ============================================================

N_THRESHOLD = 54
P_THRESHOLD = 29
K_THRESHOLD = 37


# ============================================================
# 6. Create nutrient deficiency label
# ============================================================

def get_deficiency(row):

    deficiencies = []

    # Nitrogen
    if row[nitrogen_col] < N_THRESHOLD:
        deficiencies.append("Nitrogen deficiency")

    # Phosphorus
    if row[phosphorus_col] < P_THRESHOLD:
        deficiencies.append("Phosphorus deficiency")

    # Potassium
    if row[potassium_col] < K_THRESHOLD:
        deficiencies.append("Potassium deficiency")

    # No deficiency
    if len(deficiencies) == 0:
        return "No deficiency"

    # Multiple deficiencies
    return " + ".join(deficiencies)


df["Nutrient_Deficiency"] = df.apply(
    get_deficiency,
    axis=1
)


# ============================================================
# 7. Display deficiency distribution
# ============================================================

print("\n========================================")
print("Nutrient Deficiency Distribution")
print("========================================")

print(
    df["Nutrient_Deficiency"].value_counts()
)


# ============================================================
# 8. Select features
# ============================================================

features = [
    nitrogen_col,
    phosphorus_col,
    potassium_col,
    ph_col,
    moisture_col,
    organic_col,
    electrical_col,
    temperature_col,
    humidity_col,
    rainfall_col
]

X = df[features]

y = df["Nutrient_Deficiency"]


# ============================================================
# 9. Encode labels
# ============================================================

labels = sorted(
    y.unique()
)

label_map = {
    label: index
    for index, label in enumerate(labels)
}

y_encoded = y.map(label_map)


print("\n========================================")
print("Deficiency Classes")
print("========================================")

for label, number in label_map.items():
    print(f"{number} = {label}")


# ============================================================
# 10. Train/Test split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.20,
    random_state=42,
    stratify=y_encoded
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================================
# 11. Create XGBoost model
# ============================================================

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


# ============================================================
# 12. Train model
# ============================================================

print("\n========================================")
print("Training Nutrient-Deficiency XGBoost")
print("========================================")

model.fit(
    X_train,
    y_train
)

print("Training completed successfully!")


# ============================================================
# 13. Evaluate model
# ============================================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    y_pred
)

print("\n========================================")
print(f"Nutrient Deficiency Accuracy: {accuracy * 100:.2f}%")
print("========================================")

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred,
        labels=list(range(len(labels))),
        target_names=labels,
        zero_division=0
    )
)


# ============================================================
# 14. Save model
# ============================================================

os.makedirs(
    "models",
    exist_ok=True
)

model_data = {
    "model": model,
    "label_map": label_map,
    "features": features,
    "thresholds": {
        "Nitrogen": N_THRESHOLD,
        "Phosphorus": P_THRESHOLD,
        "Potassium": K_THRESHOLD
    }
}

MODEL_PATH = (
    "models/nutrient_deficiency_xgboost.pkl"
)

joblib.dump(
    model_data,
    MODEL_PATH
)


# ============================================================
# 15. Final confirmation
# ============================================================

print("\n========================================")
print("MODEL SAVED SUCCESSFULLY!")
print("========================================")

print(
    f"Location: {MODEL_PATH}"
)

print("\nThresholds used:")

print(f"Nitrogen < {N_THRESHOLD}")
print(f"Phosphorus < {P_THRESHOLD}")
print(f"Potassium < {K_THRESHOLD}")