from __future__ import annotations

import os
import secrets
import time
from typing import Dict
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt

router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


JWT_ALGORITHM = "HS256"
JWT_EXP_SECONDS = int(os.getenv("JWT_EXP_SECONDS", "86400"))


def _env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise HTTPException(status_code=500, detail=f"Missing required env var: {name}")
    return value


def _jwt_secret() -> str:
    return _env("JWT_SECRET")


def create_session_token(profile: Dict[str, str]) -> str:
    now = int(time.time())
    payload = {
        "sub": profile.get("email"),
        "name": profile.get("name"),
        "email": profile.get("email"),
        "picture": profile.get("picture"),
        "iat": now,
        "exp": now + JWT_EXP_SECONDS,
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=JWT_ALGORITHM)


def decode_session_token(token: str) -> Dict[str, str]:
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    return {
        "name": payload.get("name", ""),
        "email": payload.get("email", ""),
        "picture": payload.get("picture", ""),
    }


def _extract_bearer_token(request: Request) -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = auth.replace("Bearer ", "", 1).strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return token


@router.get("/google")
async def auth_google() -> RedirectResponse:
    client_id = _env("GOOGLE_CLIENT_ID")
    redirect_uri = _env("GOOGLE_REDIRECT_URI")
    state = secrets.token_urlsafe(24)

    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "consent",
        "state": state,
    }
    return RedirectResponse(url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/callback")
async def auth_callback(code: str | None = None, error: str | None = None) -> RedirectResponse:
    frontend_callback = os.getenv(
        "FRONTEND_OAUTH_CALLBACK", "http://localhost:3000/auth/callback"
    ).strip()

    if error:
        return RedirectResponse(url=f"{frontend_callback}?error={error}")

    if not code:
        return RedirectResponse(url=f"{frontend_callback}?error=missing_code")

    client_id = _env("GOOGLE_CLIENT_ID")
    client_secret = _env("GOOGLE_CLIENT_SECRET")
    redirect_uri = _env("GOOGLE_REDIRECT_URI")

    token_payload = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data=token_payload)
        if token_resp.status_code >= 400:
            return RedirectResponse(url=f"{frontend_callback}?error=token_exchange_failed")
        token_data = token_resp.json()
        access_token = token_data.get("access_token", "")
        if not access_token:
            return RedirectResponse(url=f"{frontend_callback}?error=missing_access_token")

        user_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if user_resp.status_code >= 400:
            return RedirectResponse(url=f"{frontend_callback}?error=userinfo_failed")
        profile = user_resp.json()

    user = {
        "name": profile.get("name", ""),
        "email": profile.get("email", ""),
        "picture": profile.get("picture", ""),
    }
    token = create_session_token(user)
    return RedirectResponse(url=f"{frontend_callback}?token={token}")


@router.get("/me")
async def auth_me(request: Request) -> Dict[str, str]:
    token = _extract_bearer_token(request)
    return decode_session_token(token)


@router.get("/logout")
async def auth_logout() -> Dict[str, bool]:
    return {"success": True}
