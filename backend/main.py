from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json, uuid, hashlib, time, os
from web3 import Web3
import speech_recognition as sr
from pydub import AudioSegment
from langdetect import detect
from transformers import pipeline
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

app = FastAPI(title="Campus Issue Resolver API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Blockchain stub (in-memory) ---
CHAIN = []
def init_chain():
    if not CHAIN:
        CHAIN.append({"index":0,"timestamp":int(time.time()),"prev_hash":"0","data":"genesis","hash":"0"})
init_chain()

def add_block(data:str)->str:
    prev = CHAIN[-1]
    idx = prev["index"]+1
    ts = int(time.time())
    ph = prev["hash"]
    h = hashlib.sha256(f"{idx}{ts}{ph}{data}".encode()).hexdigest()
    block = {"index":idx,"timestamp":ts,"prev_hash":ph,"data":data,"hash":h}
    CHAIN.append(block)
    return h

# --- Inventory stub ---
INVENTORY = [
    {"id":"1","name":"Chair","qty":12},
    {"id":"2","name":"Desk","qty":8},
    {"id":"3","name":"Bulb","qty":30},
    {"id":"4","name":"Fan","qty":5}
]

# --- ML models ---
sent_pipe = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")
# Use text-generation for summarization as summarization task is not available
summ_pipe = pipeline("text-generation", model="facebook/bart-large-cnn")

class Issue(BaseModel):
    id: str
    title: str
    description: str
    reporter: str
    severity: str
    status: str
    txHash: str

class InventoryItem(BaseModel):
    id: str
    name: str
    qty: int

# --- Endpoints ---

@app.post("/api/issues", response_model=Issue)
def raise_issue(payload: dict):
    title = payload.get("title", "").strip()
    desc = payload.get("description", "").strip()
    reporter = payload.get("reporter", "student").strip()
    if not title or not desc:
        raise HTTPException(400, "title and description required")
    # AI severity
    score = sent_pipe(desc)[0]
    severity = "high" if score["label"] == "NEGATIVE" and score["score"] > 0.8 else "medium"
    issue = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": desc,
        "reporter": reporter,
        "severity": severity,
        "status": "pending"
    }
    tx_hash = add_block(json.dumps(issue))
    issue["txHash"] = tx_hash
    # persist to json
    os.makedirs("data", exist_ok=True)
    try:
        with open("data/issues.json") as f:
            issues = json.load(f)
    except:
        issues = []
    issues.append(issue)
    with open("data/issues.json", "w") as f:
        json.dump(issues, f)
    return issue

@app.get("/api/issues/vendor", response_model=List[Issue])
def list_vendor_issues():
    try:
        with open("data/issues.json") as f:
            return json.load(f)
    except:
        return []

@app.post("/api/issues/{issue_id}/accept")
def accept_issue(issue_id: str):
    try:
        with open("data/issues.json") as f:
            issues = json.load(f)
    except:
        raise HTTPException(404, "no issues")
    for i in issues:
        if i["id"] == issue_id:
            i["status"] = "accepted"
            break
    with open("data/issues.json", "w") as f:
        json.dump(issues, f)
    return {"ok": True}

@app.get("/api/inventory", response_model=List[InventoryItem])
def get_inventory():
    return INVENTORY

@app.post("/api/report")
async def voice_report(audio: UploadFile = File(...), issue_id: str = Form(...)):
    # convert webm to wav
    audio_bytes = await audio.read()
    webm_path = f"temp_{uuid.uuid4().hex}.webm"
    wav_path = f"temp_{uuid.uuid4().hex}.wav"
    with open(webm_path, "wb") as f:
        f.write(audio_bytes)
    sound = AudioSegment.from_file(webm_path)
    sound.export(wav_path, format="wav")
    # speech to text
    r = sr.Recognizer()
    with sr.AudioFile(wav_path) as source:
        audio_data = r.record(source)
    try:
        text = r.recognize_google(audio_data, language="auto")
    except:
        text = "(unintelligible)"
    lang = detect(text)
    # summarize using text-generation
    try:
        summary = summ_pipe(text, max_length=60, min_length=20, do_sample=False)[0]["generated_text"]
    except:
        # Fallback to simple text truncation if summarization fails
        summary = text[:60] + "..." if len(text) > 60 else text
    # cleanup
    os.remove(webm_path)
    os.remove(wav_path)
    # store report
    os.makedirs("data", exist_ok=True)
    try:
        with open("data/reports.json") as f:
            reports = json.load(f)
    except:
        reports = []
    report_entry = {"issue_id": issue_id, "text": text, "lang": lang, "summary": summary, "timestamp": int(time.time())}
    reports.append(report_entry)
    with open("data/reports.json", "w") as f:
        json.dump(reports, f)
    return {"report": summary}

@app.get("/api/chain")
def get_chain():
    return CHAIN

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)