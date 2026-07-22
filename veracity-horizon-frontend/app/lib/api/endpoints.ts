export const API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    WHOAMI: "/api/v1/auth/whoami",
    UPDATE: "/api/v1/auth/update",
    UPLOAD: "/api/v1/auth/upload",
    PASSWORD: "/api/v1/auth/password",
  },
  AUCTIONS: {
    LIST: "/api/v1/auctions",
    FEATURED: "/api/v1/auctions/featured",
    CREATE: "/api/v1/auctions/create",
    UPLOAD: "/api/v1/auctions/upload",
    MY_AUCTIONS: "/api/v1/auctions/my-auctions",
    MY_BIDS: "/api/v1/auctions/my-bids",
    BY_ID: (id: string) => `/api/v1/auctions/${id}`,
    PLACE_BID: (id: string) => `/api/v1/auctions/${id}/bid`,
  },
  ADMIN: {
    USERS: "/api/v1/admin/users",
    USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    USER_CREATE: "/api/v1/admin/users",
    USER_DELETE: (id: string) => `/api/v1/admin/users/${id}`,
  },
};
