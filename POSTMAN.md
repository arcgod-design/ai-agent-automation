# Postman Collection — AI Agent Automation

This collection covers all major API groups in the platform.

## How to Import

1. Download `ai-agent-automation.postman_collection.json`
2. Open Postman
3. Click **Import** → drag and drop the file
4. Collection appears in your sidebar

## Setup

After importing, set the collection variables:

| Variable  | Value                   |
|-----------|-------------------------|
| `baseUrl` | `http://localhost:5000`  |
| `token`   | _(auto-set after login)_ |

## Quick Start

1. Run **Auth → Login** first — token is automatically saved to `{{token}}`
2. All other requests use `{{token}}` automatically
3. Replace `AGENT_ID_HERE`, `WORKFLOW_ID_HERE` etc. with real IDs from list responses

## API Groups Covered

| Group          | Endpoints                                      |
|----------------|------------------------------------------------|
| Auth           | Register, Login                                |
| Health         | Health Check                                   |
| Dashboard      | Stats                                          |
| Agents         | CRUD + Run Agent (Playground)                  |
| Workflows      | CRUD + Run                                     |
| Tasks          | List, Get                                      |
| Schedules      | List, Create, Delete                           |
| Webhooks       | List, Create, Trigger (Public)                 |
| Documents/RAG  | List, Upload, Get, Delete                      |
| Memory         | List, List Agents, Delete Entry, Clear Agent   |
| Settings       | Get, Update                                    |
| Logs           | List                                           |
| Telemetry      | Get                                            |
| System         | Get Providers                                  |
| Templates      | List                                           |

## Local Development Setup

Make sure your `.env` has:

```env
MONGO_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_key
PORT=5000
JWT_SECRET=your_jwt_secret
```

Start backend:
```bash
cd backend
npm run dev
```

Server runs at `http://localhost:5000`
