import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

export async function fetchPackages(q?: { trackingNumber?: string; status?: string }) {
  const params: any = {};
  if (q?.trackingNumber) params.trackingNumber = q.trackingNumber;
  if (q?.status) params.status = q.status;
  const res = await api.get("/packages", { params });
  return res.data;
}

export async function getPackage(id:number) {
  const res = await api.get(`/packages/${id}`);
  return res.data;
}

export async function createPackage(payload:any) {
  const res = await api.post("/packages", payload);
  return res.data;
}

export async function changeStatus(id:number, newStatus:string) {
  const res = await api.post(`/packages/${id}/status`, { newStatus });
  return res.data;
}
