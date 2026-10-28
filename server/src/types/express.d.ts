declare global {
  namespace Express {
    interface Request {
      body: any;
      query: any;
      params: any;
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export {};
