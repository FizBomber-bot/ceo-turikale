# Auth Testing Playbook (Andry Ridwan Portfolio Admin)

## MongoDB Verification

```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```

Verify:
- bcrypt hash starts with `$2b$`
- index on users.email (unique)
- index on login_attempts.identifier
- TTL index on password_reset_tokens.expires_at (not used in v1 but created)

## API Smoke Test

```
# Login
curl -c /tmp/cookies.txt -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ndriyconnect@gmail.com","password":"TurikalePrint2026!"}'

# Me
curl -b /tmp/cookies.txt http://localhost:8001/api/auth/me

# Public profile
curl http://localhost:8001/api/profile

# Update profile (authenticated)
curl -b /tmp/cookies.txt -X PUT http://localhost:8001/api/admin/profile \
  -H "Content-Type: application/json" \
  -d '{"location":"Maros · South Sulawesi, Indonesia"}'

# Logout
curl -b /tmp/cookies.txt -X POST http://localhost:8001/api/auth/logout
```

## Lockout Test
- 5 wrong password attempts -> 423 Locked / 401 with lockout message
- Cleared on first success
