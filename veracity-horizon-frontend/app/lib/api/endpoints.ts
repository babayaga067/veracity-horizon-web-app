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
    CREATE: "/api/v1/auctions/create",
    UPLOAD: "/api/v1/auctions/upload",
    MY_AUCTIONS: "/api/v1/auctions/my-auctions",
    MY_BIDS: "/api/v1/auctions/my-bids",
  },
  ADMIN: {
    USERS: "/api/v1/admin/users",
  },
};
