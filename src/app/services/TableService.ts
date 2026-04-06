import axios from "axios";
import { serverApi } from "../../lib/config";
import { clearStoredAccessToken } from "../../lib/accessToken";
import { Table, TableUpdateInput } from "../../lib/types/table";

class TableService {
  private readonly path: string;

  constructor() {
    this.path = serverApi;
  }

  public async qrLanding(id: string): Promise<Table> {
    try {
      const url = this.path + `/table/qr/${id}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("qrLanding: ", result);
      const table = result.data.table;
      localStorage.setItem("tableData", JSON.stringify(table));
      localStorage.removeItem("memberData");
      clearStoredAccessToken();
      return table;
    } catch (err) {
      console.log("Error, qrLanding: ", err);
      throw err;
    }
  }

  public async tableLogout(): Promise<void> {
    try {
      const url = this.path + `/table/logout`;
      const result = await axios.post(url, {}, { withCredentials: true });
      console.log("tableLogout:", result);
      localStorage.removeItem("tableData");
    } catch (err) {
      console.log("Error, tableLogout:", err);
      throw err;
    }
  }

  public async clickTableCall(id: string): Promise<void> {
    try {
      const url = this.path + `/table/call/${id}`;
      const result = await axios.get(url, { withCredentials: true });
      console.log("clickTableCall:", result);
    } catch (err) {
      console.log("Error, clickTableCall:", err);
      throw err;
    }
  }
}

export default TableService;
