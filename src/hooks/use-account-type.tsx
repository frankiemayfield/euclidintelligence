import { createContext, useContext, useState, ReactNode } from "react";

type AccountType = "builder" | "subcontractor";

interface AccountTypeContext {
  accountType: AccountType;
  setAccountType: (type: AccountType) => void;
}

const AccountTypeCtx = createContext<AccountTypeContext>({
  accountType: "builder",
  setAccountType: () => {},
});

export function AccountTypeProvider({ children }: { children: ReactNode }) {
  const [accountType, setAccountType] = useState<AccountType>("builder");
  return (
    <AccountTypeCtx.Provider value={{ accountType, setAccountType }}>
      {children}
    </AccountTypeCtx.Provider>
  );
}

export const useAccountType = () => useContext(AccountTypeCtx);
