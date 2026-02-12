#!/usr/bin/env python3
import requests
import json

# Test users for demonstration
users = [
    {
        "email": "student1@citchennai.net",
        "password": "student123",
        "full_name": "Test Student",
        "role": "student"
    },
    {
        "email": "vendor1@citchennai.net", 
        "password": "vendor123",
        "full_name": "Test Vendor",
        "role": "vendor"
    }
]

base_url = "http://localhost:8000"

print("🚀 Seeding test users...")

for user in users:
    try:
        response = requests.post(f"{base_url}/register", json=user)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Created {user['role']}: {user['email']}")
            print(f"   Token: {data['access_token'][:20]}...")
        else:
            print(f"❌ Failed to create {user['email']}: {response.text}")
    except Exception as e:
        print(f"❌ Error creating {user['email']}: {e}")

print("\n🎉 Test users seeded successfully!")
print("\nYou can now login with:")
print("- Student: student1@citchennai.net / student123")
print("- Vendor: vendor1@citchennai.net / vendor123")