# Backend Database Module

Centralised utilities for initializing Firebase and exposing reusable database/auth helpers for the rest of the backend.

## Current Structure
- `firebaseConfig.ts` &mdash; Stores the Firebase project configuration. **Before production**, move these credentials into environment variables or a secrets manager.
- `databaseGateway.ts` &mdash; Exposes the functions other backend modules import to interact with Firebase Auth (and, later, Firestore/Storage/etc.).

## Available Functions
| Function | Location | Description | Returns |
| -------- | -------- | ----------- | ------- |
| `addUser(username, password)` | `databaseGateway.ts` | Creates a new Firebase Authentication user using the provided credentials. Use during signup flows. | `Promise<UserCredential>` |
| `userLogin(username, password)` | `databaseGateway.ts` | Validates credentials for an existing user via Firebase Authentication. Use during login flows. | `Promise<UserCredential>` |

## Usage Example
```ts
import { DatabaseGateway } from "./Backend/Database/databaseGateway";

// Sign up
await DatabaseGateway.addUser("alice@example.com", "Sup3rSecure!");

// Log in
const session = await DatabaseGateway.userLogin("alice@example.com", "Sup3rSecure!");
console.log(session.user.uid);
```

## Next Steps / Reserved Slots
- Firestore helpers (content CRUD, user profiles, etc.).
- Storage helpers (media uploads).
- Role/permission utilities.

Update this document whenever new helpers land so the rest of the backend has a single source of truth for database capabilities.

