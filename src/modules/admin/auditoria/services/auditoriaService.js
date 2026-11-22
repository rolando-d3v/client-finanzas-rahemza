import api from "../../../../config/axios";

export const getAuditoria = (params) =>
  api.get("/api/auditoria", { params }).then((res) => res.data);
