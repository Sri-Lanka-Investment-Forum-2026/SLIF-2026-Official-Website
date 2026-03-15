export type AdminSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type AdminSession = {
  user: AdminSessionUser;
};
