"""
Apple Business Manager (ABM) - Get Devices (orgDevices)

This script:
1) Validates your EC P-256 private key file
2) Builds a SHORT-LIVED (15 min) ES256 client_assertion JWT
3) Requests an OAuth access token (scope=business.api)
4) Calls /v1/orgDevices and prints device results

Requirements:
  pip install requests authlib pycryptodome

Notes:
- Use the PRIVATE KEY (.pem) you downloaded from ABM for the SAME Key ID (kid).
- If you still get 400 invalid_client:
    -> 99% of the time: key_id does NOT match the private key you are using,
       OR client_id is from a different API client / ABM tenant.
"""

import time
import uuid
import json
import base64
from typing import Any, Dict

import requests
from authlib.jose import jwt
from Crypto.PublicKey import ECC


# =============================================================================
# CONFIG - UPDATE THESE
# =============================================================================
PRIVATE_KEY_FILE = "abm_key_unencrypted.pem"   # recommended (see conversion notes below)
CLIENT_ID = "BUSINESSAPI.8906c1e7-69db-4b8e-b9e6-210bc4335000"
KEY_ID = "3ee9c51a-3b6c-4c9a-8262-8d74ca469126"

# ABM OAuth endpoints (commonly used)
TOKEN_URL = "https://account.apple.com/auth/oauth2/token"
JWT_AUDIENCE = "https://account.apple.com/auth/oauth2/v2/token"  # aud claim

# ABM scope
SCOPE = "business.api"

# JWT lifetime (seconds) - keep short
JWT_TTL_SECONDS = 15 * 60  # 15 minutes


# =============================================================================
# HELPERS
# =============================================================================
def b64url_decode(s: str) -> bytes:
    s += "=" * (-len(s) % 4)
    return base64.urlsafe_b64decode(s.encode("utf-8"))


def print_jwt_parts(compact_jwt: str) -> None:
    """Print decoded JWT header and payload (safe; does not reveal private key)."""
    h, p, _sig = compact_jwt.split(".")
    header = json.loads(b64url_decode(h))
    payload = json.loads(b64url_decode(p))
    print("\n================ JWT (decoded) ================")
    print("JWT HEADER : ", header)
    print("JWT PAYLOAD: ", payload)
    print("==============================================\n")


def load_ec_private_key(path: str) -> ECC.EccKey:
    """Load an EC private key and validate it's P-256."""
    with open(path, "rt", encoding="utf-8") as f:
        key_text = f.read()

    key = ECC.import_key(key_text)

    # Validate curve (P-256 / prime256v1)
    curve_name = getattr(key, "curve", None)
    if curve_name is None:
        raise ValueError("Could not detect ECC curve from key.")

    # pycryptodome typically returns 'NIST P-256' for prime256v1
    if "P-256" not in str(curve_name) and "prime256v1" not in str(curve_name):
        raise ValueError(f"Key curve is not P-256. Detected curve: {curve_name}")

    if not key.has_private():
        raise ValueError("The key file does not contain a private key.")

    return key


def build_client_assertion(ec_key: ECC.EccKey) -> str:
    """Build ES256 client_assertion JWT for ABM OAuth."""
    now = int(time.time())
    payload: Dict[str, Any] = {
        "iss": CLIENT_ID,               # IMPORTANT: iss = client_id
        "sub": CLIENT_ID,               # IMPORTANT: sub = client_id
        "aud": JWT_AUDIENCE,            # IMPORTANT: aud matches ABM audience
        "iat": now,
        "exp": now + JWT_TTL_SECONDS,   # IMPORTANT: short-lived
        "jti": str(uuid.uuid4()),
    }

    headers: Dict[str, Any] = {
        "alg": "ES256",
        "kid": KEY_ID,
    }

    compact = jwt.encode(
        header=headers,
        payload=payload,
        key=ec_key.export_key(format="PEM")
    ).decode("utf-8")

    return compact


def get_access_token(client_assertion: str) -> str:
    """Exchange client_assertion for an ABM access token."""
    form = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        "client_assertion": client_assertion,
        "scope": SCOPE,
    }

    r = requests.post(TOKEN_URL, data=form, timeout=30)
    try:
        body = r.json()
    except Exception:
        body = {"raw": r.text}

    if r.status_code != 200:
        print(f"ERROR: Authentication failed with status {r.status_code}")
        print(f"Response: {body}")
        raise SystemExit(1)

    return body["access_token"]


def fetch_devices(access_token: str, limit: int = 50) -> Dict[str, Any]:
    """
    Fetch devices from ABM.

    ABM often paginates. This function fetches the first page and prints nextCursor if present.
    """
    api_url = "https://api-business.apple.com/v1/orgDevices"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    params = {"limit": limit}  # ABM supports 'limit' in many examples; safe to include.
    r = requests.get(api_url, headers=headers, params=params, timeout=30)

    if r.status_code != 200:
        print(f"ERROR: Failed to fetch devices with status {r.status_code}")
        print(f"Response: {r.text}")
        raise SystemExit(1)

    return r.json()


# =============================================================================
# MAIN
# =============================================================================
def main() -> None:
    print("Loading EC private key...")
    ec_key = load_ec_private_key(PRIVATE_KEY_FILE)
    print("Key OK (EC P-256).")

    print("Building client_assertion JWT...")
    client_assertion = build_client_assertion(ec_key)

    # Print decoded JWT header/payload so you can verify iss/sub/aud/exp
    print_jwt_parts(client_assertion)

    print("Requesting access token...")
    access_token = get_access_token(client_assertion)
    print(f"Successfully authenticated! Access token starts with: {access_token[:20]}...")

    print("Fetching devices...")
    data = fetch_devices(access_token, limit=50)

    results = data.get("data", [])
    print(f"\nFetched {len(results)} devices in this page.")

    if results:
        print("\nFirst device:\n", json.dumps(results[0], indent=2))
    else:
        print("\nNo devices found in your ABM account (or this page is empty).")
        print("Full response:\n", json.dumps(data, indent=2))

    # Pagination hint
    if "nextCursor" in data:
        print("\nNOTE: Response includes nextCursor. You can paginate using that cursor.")
        print("nextCursor:", data["nextCursor"])


if __name__ == "__main__":
    """
    If you only have Device_Management_API.pem, convert it once (recommended):

      openssl pkcs8 -topk8 -inform PEM -outform PEM \
        -in Device_Management_API.pem \
        -out abm_key_unencrypted.pem \
        -nocrypt

    Then set PRIVATE_KEY_FILE = "abm_key_unencrypted.pem"
    """
    main()
