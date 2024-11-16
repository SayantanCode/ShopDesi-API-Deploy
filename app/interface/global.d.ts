declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string;
  }
}
declare namespace Express {
  interface Request {
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
      // Add other user properties here
    };
  }
}
