import React from "react";
import { UserInfo } from "../types";

const UserContext = React.createContext<{
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}>({
  user: null,
  setUser: () => {},
});

export default UserContext;


