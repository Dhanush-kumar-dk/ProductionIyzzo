firebase auth:
    - email & password.
    - disable user sign up.
    - disable user delete.

firestore rules:
```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read;
      allow write: if request.auth.uid != null;
    }
  }
}
```