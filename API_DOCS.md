# Social Media API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication

### 1. Register
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "username": "user123",
    "password": "securepassword"
  }
  ```

### 2. Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Returns**: Contains a `token` to be used for authorized requests.

---

## Users

### 1. Get Profile
- **URL**: `/users/:username`
- **Method**: `GET`
- **Description**: Fetches the user profile and their posts.

### 2. Update Profile
- **URL**: `/users/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "bio": "New bio here",
    "avatarUrl": "https://link-to-avatar.com/image.png"
  }
  ```

---

## Posts

### 1. Create Post
- **URL**: `/posts`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "content": "This is a new post!",
    "imageUrl": "https://link-to-image.com/pic.jpg"
  }
  ```

### 2. Get Feed
- **URL**: `/feed?page=1&limit=10`
- **Method**: `GET`
- **Description**: Retrieves recent posts.

### 3. Like / Unlike Post
- **URL**: `/posts/:postId/like`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Toggles like status on a post.

---

## Media Uploads

### 1. Get Presigned Upload URL
- **URL**: `/media/upload-url`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "filename": "my-photo.jpg",
    "contentType": "image/jpeg",
    "type": "avatar" 
  }
  ```
  *(Note: `type` can be `avatar` or `post`)*
- **Returns**:
  ```json
  {
    "uploadUrl": "https://social-media-uploads-bucket.s3.amazonaws.com/... (presigned PUT URL)",
    "fileUrl": "https://social-media-uploads-bucket.s3.amazonaws.com/avatars/user-id/...-my-photo.jpg",
    "key": "avatars/user-id/...-my-photo.jpg"
  }
  ```
- **Usage**:
  1. Make a POST request to `/media/upload-url` to get the `uploadUrl` and `fileUrl`.
  2. Perform an HTTP `PUT` request directly to the `uploadUrl` with the raw file data and `Content-Type` matching the one sent above.
  3. Save the `fileUrl` in the database by calling `/users/profile` (for avatars) or `/posts` (for post images).
