import json, hashlib, time, os
from typing import List, Dict

CHAIN_FILE = "data/chain.json"
os.makedirs("data", exist_ok=True)

def _hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def load_chain() -> List[Dict]:
    if not os.path.exists(CHAIN_FILE):
        genesis = {
            "index": 0,
            "timestamp": int(time.time()),
            "prev_hash": "0",
            "data": "genesis",
            "hash": _hash("0" + "0" + str(int(time.time())) + "genesis")
        }
        save_chain([genesis])
        return [genesis]
    with open(CHAIN_FILE) as f:
        return json.load(f)

def save_chain(chain: List[Dict]):
    with open(CHAIN_FILE, "w") as f:
        json.dump(chain, f, indent=2)

def add_block(data: str) -> str:
    chain = load_chain()
    last = chain[-1]
    idx = last["index"] + 1
    ts = int(time.time())
    ph = last["hash"]
    h = _hash(f"{idx}{ts}{ph}{data}")
    block = {"index": idx, "timestamp": ts, "prev_hash": ph, "data": data, "hash": h}
    chain.append(block)
    save_chain(chain)
    return h

def verify_chain() -> bool:
    chain = load_chain()
    for i in range(1, len(chain)):
        curr = chain[i]
        prev = chain[i-1]
        if curr["prev_hash"] != prev["hash"]:
            return False
        recalc = _hash(f"{curr['index']}{curr['timestamp']}{curr['prev_hash']}{curr['data']}")
        if recalc != curr["hash"]:
            return False
    return True