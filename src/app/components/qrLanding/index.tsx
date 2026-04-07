import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import TableService from "../../services/TableService";
import { sweetErrorHandling } from "../../../lib/sweetAlert";
import { setMenuProductsPath } from "../../../lib/menuProductsPath";
import { useGlobals } from "../../hooks/useGlobals";

export default function QrLanding() {
  const { setAuthTable, setAuthMember } = useGlobals();
  const history = useHistory();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const table = new TableService();
    table
      .qrLanding(id)
      .then((data) => {
        setMenuProductsPath("/products");
        setAuthTable(data);
        setAuthMember(null);
        history.push("/products");
      })
      .catch((err) => {
        console.log(err);
        sweetErrorHandling(err).then();
      });
  }, [id]);

  return null;
}
