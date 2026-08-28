import { browserBrokerRequest } from "@/lib/api/browser-client";
import type { BrokerSuccessResponse } from "@/lib/api/types/broker-response";
import type { FormListFilters, FormTemplate, FormVersion, JwfDocument } from "./types";

const PATH = "v1/admin/forms";
export const listForms = (filters: FormListFilters = {}) => browserBrokerRequest<FormTemplate[]>(PATH, { searchParams: filters });
export const createForm = (name: string) => browserBrokerRequest<FormTemplate>(PATH, { method: "POST", body: { name } });
export const getForm = (templateId: string) => browserBrokerRequest<FormTemplate>(`${PATH}/${templateId}`);
export const getFormVersion = (templateId: string, versionId: string) => browserBrokerRequest<FormVersion>(`${PATH}/${templateId}/versions/${versionId}`);
export const saveFormDraft = (templateId: string, versionId: string, document: JwfDocument) => browserBrokerRequest<FormVersion>(`${PATH}/${templateId}/versions/${versionId}`, { method: "PATCH", body: { document } });
export const cloneFormVersion = (templateId: string, versionId: string) => browserBrokerRequest<FormVersion>(`${PATH}/${templateId}/versions/${versionId}/clone`, { method: "POST" });
export const publishFormVersion = (templateId: string, versionId: string) => browserBrokerRequest<FormVersion>(`${PATH}/${templateId}/versions/${versionId}/publish`, { method: "POST" });
export const archiveFormVersion = (templateId: string, versionId: string) => browserBrokerRequest<FormVersion>(`${PATH}/${templateId}/versions/${versionId}/archive`, { method: "POST" });
export const deleteForm = (templateId: string): Promise<BrokerSuccessResponse<void>> => browserBrokerRequest<void>(`${PATH}/${templateId}`, { method: "DELETE" });
