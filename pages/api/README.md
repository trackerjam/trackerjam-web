# API structure

Folder `v1` contains public API that can be called from the extension side.

## Public API

### /api/v1/member
#### PUT
Change member status (Activate token)

**Request:**
 - token: string
 - status: ACTIVE | PAUSED (Partial<[STATUS](../../prisma/schema.prisma)>)

**Response:**
 - HTTP 200

#### GET
Returns member settings

**Request:**
- token: string

**Response:**
- [MemberSettings](../../prisma/schema.prisma)


### /api/v1/activity
#### POST
Saves member activity

**Request:**
 - date: string; (ISO date, ex.: 2023-04-30)
 - type: [TAB_TYPE](../../prisma/schema.prisma);
 - token: string;
 - domain: string;
 - sessions: Array:
   - url: string;
   - title?: string;
   - docTitle?: string;
   - startTime: number; (timestamp)
   - endTime: number; (timestamp)

**Response:**
- HTTP 201