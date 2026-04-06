import React, { ReactNode, useState, useCallback } from "react";
import { clearStoredAccessToken } from "../../lib/accessToken";
import { Member } from "../../lib/types/member";
import { GlobalContext } from "../hooks/useGlobals";
import { Table } from "../../lib/types/table";

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage
  const [authMember, setAuthMemberState] = useState<Member | null>(() => {
    const memberData = localStorage.getItem("memberData");
    return memberData ? JSON.parse(memberData) : null;
  });

  const [authTable, setAuthTableState] = useState<Table | null>(() => {
    const tableData = localStorage.getItem("tableData");
    return tableData ? JSON.parse(tableData) : null;
  });
  
  const [orderBulder, setOrderBulder] = useState<Date>(new Date());

  // Wrapper function to sync setAuthMember with localStorage
  const setAuthMember = useCallback((member: Member | null) => {
    setAuthMemberState(member);
    if (member) {
      localStorage.setItem("memberData", JSON.stringify(member));
    } else {
      localStorage.removeItem("memberData");
      clearStoredAccessToken();
    }
  }, []);

  // Wrapper function to sync setAuthTable with localStorage
  const setAuthTable = useCallback((table: Table | null) => {
    setAuthTableState(table);
    if (table) {
      localStorage.setItem("tableData", JSON.stringify(table));
    } else {
      localStorage.removeItem("tableData");
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        authMember,
        setAuthMember,
        orderBulder,
        setOrderBulder,
        authTable,
        setAuthTable,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default ContextProvider;
