import requests
import io

print('Testing voice report endpoint...')

# Create a dummy audio file
audio_data = b'dummy audio data for testing'
files = {'audio': ('test.wav', audio_data, 'audio/wav')}
data = {'issue_id': 'bbe7ca6c-efc4-4d45-a655-0ed64a30c4ac'}

try:
    response = requests.post('http://localhost:8000/api/report', files=files, data=data)
    print('Status code:', response.status_code)
    print('Response:', response.json())
except Exception as e:
    print('Error:', e)