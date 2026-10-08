import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

/*
|--------------------------------------------------------------------------
| Automatically attach JWT
|--------------------------------------------------------------------------
*/

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export const getDashboardStats = async () => {
  const response = await api.get(
    "/dashboard/stats"
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Employees
|--------------------------------------------------------------------------
*/

export const getEmployees = async () => {
  const response = await api.get(
    "/employees"
  );

  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await api.get(
    `/employees/${id}`
  );

  return response.data;
};

export const createEmployee = async (
  employeeData
) => {
  const response = await api.post(
    "/employees",
    employeeData
  );

  return response.data;
};

export const updateEmployee = async (
  id,
  employeeData
) => {
  const response = await api.put(
    `/employees/${id}`,
    employeeData
  );

  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(
    `/employees/${id}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Deployments
|--------------------------------------------------------------------------
*/

export const getDeployments = async () => {
  const response = await api.get(
    "/deployments"
  );

  return response.data;
};

export const createDeployment = async (
  deploymentData
) => {
  const response = await api.post(
    "/deployments",
    deploymentData
  );

  return response.data;
};

export const getDeploymentById = async (id) => {
  const response = await api.get(
    `/deployments/${id}`
  );

  return response.data;
};

export const updateDeploymentStatus = async (
  id,
  statusData
) => {
  const response = await api.put(
    `/deployments/${id}/status`,
    statusData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Default API instance
|--------------------------------------------------------------------------
*/

export default api;