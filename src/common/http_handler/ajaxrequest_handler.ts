import axios, { AxiosError, AxiosResponse } from 'axios';

class AjaxRequestHandler {
    private baseurl: string;

    constructor(baseurl: string) {
        this.baseurl = baseurl;
    }

    private getfullurl(path: string): string {
        return this.baseurl + path;
    }

    public getbaseurl(): string {
        return this.baseurl;
    }

    async get<T>(path: string): Promise<AxiosResponse<T>> {
        try {
            return axios.get(this.getfullurl(path));
        } catch (err) {
            throw err as AxiosError;
        }
    }

    async post<T>(path: string, data = {}): Promise<AxiosResponse<T>> {
        try {
            return axios.post(this.getfullurl(path), data);
        } catch (err) {
            throw err as AxiosError;
        }
    }

    async delete<T>(path: string): Promise<AxiosResponse<T>> {
        try {
            return axios.delete(this.getfullurl(path));
        } catch (err) {
            throw err as AxiosError;
        }
    }

    async put<T>(path: string, data = {}): Promise<AxiosResponse<T>> {
        try {
            return axios.put(this.getfullurl(path), data);
        } catch (err) {
            throw err as AxiosError;
        }
    }
}

export default AjaxRequestHandler;
