import axios from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
    signal?: AbortSignal;
  }

  export function isCancel(value: any): boolean;
}
