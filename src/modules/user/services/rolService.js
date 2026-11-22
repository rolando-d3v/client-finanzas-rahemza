import api from "../../../config/axios";

export const getRoles = () =>
  api.get("/api/roles").then((res) => res.data);
