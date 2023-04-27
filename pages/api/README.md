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