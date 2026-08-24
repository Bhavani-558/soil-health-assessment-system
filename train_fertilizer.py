import pandas as pd

# Load dataset
data = pd.read_csv("dataset/fertilizer_recommendation.csv")

# Display dataset information
print("Dataset shape:", data.shape)
print("\nColumns:")
print(data.columns.tolist())

print("\nFirst 5 rows:")
print(data.head())

print("\nTarget values:")
print(data["Recommended_Fertilizer"].value_counts())