# Drishti.io Frontend-Backend Integration

This document describes the complete integration between the Drishti.io frontend and backend API.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Backend server running on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd drishti-idea-creator
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the `drishti-idea-creator` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open `http://localhost:5173` in your browser

## 🔧 Backend Integration

### API Service Layer (`src/services/api.ts`)
- **Complete API client** with all backend endpoints
- **JWT token management** with automatic header injection
- **File download support** for exports
- **Error handling** with user-friendly messages

### Authentication Context (`src/contexts/AuthContext.tsx`)
- **User state management** with React Context
- **Automatic token persistence** in localStorage
- **Login/logout functionality** with backend integration
- **Protected route support**

### Projects Context (`src/contexts/ProjectsContext.tsx`)
- **Project state management** across the application
- **CRUD operations** for projects
- **AI generation integration** (PRD and Implementation Plans)
- **Real-time updates** with optimistic UI

## 📱 Features Implemented

### ✅ Authentication
- **User Registration** with full form validation
- **User Login** with username/email support
- **Protected Routes** with automatic redirects
- **User Profile** display in header
- **Logout functionality** with token cleanup

### ✅ Project Management
- **Project Creation** with title and idea input
- **Project Listing** with pagination support
- **Project Selection** and state management
- **Project Status** tracking (draft, prd_generated, plan_generated, completed)

### ✅ AI Generation
- **PRD Generation** using Gemini AI
- **Implementation Plan Generation** from existing PRD
- **Loading states** with progress indicators
- **Error handling** with toast notifications

### ✅ Export/Download
- **PRD Downloads** (Markdown and PDF)
- **Implementation Plan Downloads** (Markdown and PDF)
- **Complete Project ZIP** with all files
- **Dynamic download buttons** based on current tab

### ✅ UI/UX Enhancements
- **Responsive design** with mobile support
- **Loading states** throughout the application
- **Toast notifications** for user feedback
- **Error boundaries** and graceful error handling
- **Modern UI** with shadcn/ui components

## 🔄 Data Flow

### Authentication Flow
1. User submits login/register form
2. Frontend calls backend API via `apiService`
3. Backend validates credentials and returns JWT token
4. Token stored in localStorage and AuthContext
5. Protected routes check authentication status
6. API requests include Bearer token automatically

### Project Creation Flow
1. User enters project idea in textarea
2. Clicks "Write to Create" button
3. Frontend creates project via `createProject()`
4. Backend saves project to MongoDB
5. Frontend calls `generatePRD()` for AI generation
6. Backend uses Gemini AI to generate structured PRD
7. Frontend updates UI with generated content

### Export Flow
1. User clicks download button (MD/PDF/Complete)
2. Frontend calls appropriate API endpoint
3. Backend generates file and returns blob
4. Frontend triggers browser download
5. Toast notification confirms success

## 🛠️ Technical Implementation

### State Management
- **React Context** for global state (Auth, Projects)
- **React Query** for server state caching
- **Local state** for UI interactions
- **Optimistic updates** for better UX

### Error Handling
- **API-level error handling** with try/catch
- **User-friendly error messages** via toast notifications
- **Loading states** to prevent multiple submissions
- **Graceful degradation** for network issues

### Security
- **JWT token authentication** for all protected routes
- **Automatic token refresh** on app initialization
- **Secure token storage** in localStorage
- **CORS configuration** for cross-origin requests

## 📁 File Structure

```
src/
├── components/
│   ├── ProtectedRoute.tsx      # Route protection
│   ├── Header.tsx              # Navigation with auth
│   ├── Sidebar.tsx             # Project sidebar
│   └── Flashcard.tsx           # Content display
├── contexts/
│   ├── AuthContext.tsx         # Authentication state
│   └── ProjectsContext.tsx     # Projects state
├── services/
│   └── api.ts                  # API client
├── config/
│   └── env.ts                  # Environment config
└── pages/
    ├── SignIn.tsx              # Login page
    ├── SignUp.tsx              # Registration page
    └── Workspace.tsx           # Main workspace
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5000)

### API Endpoints Used
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/:id` - Get project details
- `POST /projects/:id/generate-prd` - Generate PRD
- `POST /projects/:id/generate-plan` - Generate implementation plan
- `GET /exports/:id/prd/markdown` - Download PRD as Markdown
- `GET /exports/:id/prd/pdf` - Download PRD as PDF
- `GET /exports/:id/plan/markdown` - Download plan as Markdown
- `GET /exports/:id/plan/pdf` - Download plan as PDF
- `GET /exports/:id/complete` - Download complete project

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend URL
   - Check that API_BASE_URL matches backend server

2. **Authentication Issues**
   - Clear localStorage and try logging in again
   - Check that JWT token is being sent in headers
   - Verify backend authentication middleware

3. **API Connection Issues**
   - Ensure backend server is running on correct port
   - Check network connectivity
   - Verify API_BASE_URL configuration

4. **File Download Issues**
   - Check browser download permissions
   - Ensure backend export endpoints are working
   - Verify file generation in backend

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug', 'true');
```

## 🎯 Next Steps

### Potential Enhancements
1. **Real-time collaboration** with WebSocket integration
2. **Project sharing** and team features
3. **Advanced AI features** with more generation options
4. **Project templates** and reusable components
5. **Advanced export options** (Word, PowerPoint, etc.)
6. **Project analytics** and usage tracking

### Performance Optimizations
1. **Lazy loading** for large project lists
2. **Caching strategies** for API responses
3. **Image optimization** for better loading times
4. **Bundle splitting** for faster initial loads

## 📞 Support

For issues or questions:
1. Check the browser console for error messages
2. Verify backend server is running and accessible
3. Check network tab for failed API requests
4. Review this documentation for configuration issues

---

**Integration Status: ✅ Complete**
- Authentication: ✅ Working
- Project Management: ✅ Working  
- AI Generation: ✅ Working
- Export/Download: ✅ Working
- UI/UX: ✅ Polished

