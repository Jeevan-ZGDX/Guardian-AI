import pandas as pd, joblib, os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline

# Synthetic dataset for campus issues
samples = [
    ("Broken chair in classroom", "high"),
    ("Light bulb fused", "low"),
    ("AC not working in lab", "medium"),
    ("Water leakage near restroom", "high"),
    ("Fan making noise", "low"),
    ("Projector not turning on", "medium"),
    ("Desk broken leg", "medium"),
    ("Fire extinguisher missing", "critical"),
    ("Glass window cracked", "high"),
    ("Door lock jammed", "medium"),
    ("Internet cable cut", "high"),
    ("Whiteboard marker dried", "low"),
    ("Chair wheel broken", "medium"),
    ("Emergency exit blocked", "critical"),
    ("Toilet flush not working", "high"),
    ("Power socket sparking", "critical"),
    ("Ceiling fan speed regulator faulty", "low"),
    ("Torn seat cushion", "low"),
    ("Broken glass on floor", "high"),
    ("Security camera offline", "medium"),
]
texts, labels = zip(*samples)
X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)
model = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', RandomForestClassifier(n_estimators=100, random_state=42))
])
model.fit(X_train, y_train)
print("Accuracy:", model.score(X_test, y_test))
joblib.dump(model, "issue_model.pkl")
print("Saved issue_model.pkl")