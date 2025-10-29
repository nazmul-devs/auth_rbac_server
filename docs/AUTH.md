## _Refresh Token_

```
const refreshService = new
```

**_On Login_**

```
const { token: refreshToken, expiresAt } = await refreshService.createRefreshToken(user.id);
const accessToken = refreshService.generateAccessToken(user.id);
```

**_On refresh_**

```
const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshService.rotateRefreshToken(oldRefreshToken);
```

**_On logout_**

```
await refreshService.revokeToken(refreshToken);
```

## **_For Client Side_**

**_1. Token Storage_**

> **Access Token:**
> Short-lived (15–30 min).
> Store in memory or localStorage.
> Used to authorize API requests in Authorization: Bearer <token> header.
> **Refresh Token:**
> Long-lived (7–30 days).
> If stored in localStorage, you risk XSS attacks.
> Safer approach: HttpOnly cookie, but for localStorage: encrypt if possible.

**_2. Login Flow (Client Side)_**

```
async function login(email: string, password: string) {
const res = await fetch("/api/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password }),
});

const data = await res.json();

// Save tokens
localStorage.setItem("accessToken", data.accessToken);
localStorage.setItem("refreshToken", data.refreshToken);
}
```

**_3. API Request with Auto Refresh_**

```
async function fetchWithAuth(url: string, options: RequestInit = {}) {
let accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

if (!accessToken) {
throw new Error("No access token available");
}

const res = await fetch(url, {
...options,
headers: {
...(options.headers || {}),
Authorization: `Bearer ${accessToken}`,
},
});

if (res.status === 401 && refreshToken) {
// Access token expired → try refresh
const newTokens = await refreshAccessToken(refreshToken);
localStorage.setItem("accessToken", newTokens.accessToken);
localStorage.setItem("refreshToken", newTokens.refreshToken);

    // Retry original request
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newTokens.accessToken}`,
      },
    });

}

return res;
}

async function refreshAccessToken(refreshToken: string) {
const res = await fetch("/api/refresh-token", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ refreshToken }),
});

if (!res.ok) throw new Error("Refresh token invalid or expired");
return res.json(); // { accessToken, refreshToken }
}
```

**_4. Logout Flow_**

```
async function logout() {
const refreshToken = localStorage.getItem("refreshToken");
await fetch("/api/logout", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ refreshToken }),
});

// Clear local storage
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
}
```

**_5. Best Practices_**

- Access Token: fine in memory or localStorage.
- Refresh Token: localStorage is vulnerable to XSS → better use HttpOnly cookie.
- Token Expiry: always check expiry before sending requests.
- Rotation: if using refresh tokens, rotate them after every refresh.
- Logout: revoke refresh token in backend and remove tokens from client.
