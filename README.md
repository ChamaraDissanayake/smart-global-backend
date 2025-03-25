1. User Registration
Method: POST
URL: http://localhost:3000/register
Headers:
Content-Type: application/json
Body (raw JSON):

{
  "email": "test@example.com",
  "password": "securepassword123"
}
Expected Response:

{ "message": "User created" }

2. User Login
Method: POST
URL: http://localhost:3000/login
Headers:
Content-Type: application/json
Body (raw JSON):

{
  "email": "test@example.com",
  "password": "securepassword123"
}
Expected Response:

{ "token": "JWT_TOKEN_HERE" }

3. Upload File
Method: POST
URL: http://localhost:3000/upload
Headers:
Authorization: Bearer JWT_TOKEN_HERE
Content-Type: multipart/form-data
Body: form-data with file
Expected Response:

{
  "message": "File uploaded successfully",
  "fileId": 1,
  "path": "uploads/filename.jpg"
}

4. List All Files
Method: GET
URL: http://localhost:3000/files
Headers: None
Expected Response:

[
  {
    "id": 1,
    "filename": "test.jpg",
    "path": "uploads/test.jpg"
  }
]

5. Delete File
Method: DELETE
URL: http://localhost:3000/files/1 (where 1 is file ID)
Headers: None
Expected Response:

{
  "message": "File deleted completely",
  "details": {
    "dbRecordDeleted": true,
    "physicalFileDeleted": true,
    "deletedId": 1
  }
}

6. Delete User Account
Method: DELETE
URL: http://localhost:3000/user
Headers:
Authorization: Bearer JWT_TOKEN_HERE
Content-Type: application/json
Body (raw JSON):

{
  "password": "currentpassword123"
}
Expected Response:

{ "message": "User account deleted successfully" }

7. Request Password Reset
Method: POST
URL: http://localhost:3000/request-password-reset
Headers:
Content-Type: application/json
Body (raw JSON):

{
  "email": "test@example.com"
}
Expected Response:

{
  "message": "Password reset token generated",
  "token": "TEMPORARY_TOKEN"
}

8. Verify Reset Token
Method: POST
URL: http://localhost:3000/verify-reset-token
Headers:
Content-Type: application/json
Body (raw JSON):

{
  "token": "TEMPORARY_TOKEN"
}
Expected Response:

{
  "valid": true,
  "userId": 1
}

9. Reset Password
Method: POST
URL: http://localhost:3000/reset-password
Headers:
Content-Type: application/json
Body (raw JSON):

{
  "token": "TEMPORARY_TOKEN",
  "newPassword": "newpassword123"
}
Expected Response:

{ "message": "Password updated successfully" }