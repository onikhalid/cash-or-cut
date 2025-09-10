// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JwtPayload = { [key: string]: any } | null;

function base64UrlDecode(base64Url: string): string {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4);
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
    return atob(base64);
}

const tokenStorage = {
    decodeJwt(jwt: string): JwtPayload {
        const [, payload] = jwt.split('.');
        try {
            return JSON.parse(base64UrlDecode(payload));
        } catch {
            return null;
        }
    },

    hasTokenExpired(token: string): boolean {
        const decoded = tokenStorage.decodeJwt(token);
        if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            return decoded.exp < now;
        }
        return false;
    },

    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('CASH_OR_CUT_ACCESS_TOKEN');
        if (token) {
            if (tokenStorage.hasTokenExpired(token)) {
                localStorage.removeItem('CASH_OR_CUT_ACCESS_TOKEN');
                tokenStorage.removeAccessToken();
                return null;
            }
            return token;
        }
        return null;
    },

    async setAccessToken(token: string): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.setItem('CASH_OR_CUT_ACCESS_TOKEN', token);
    },

    async removeAccessToken(): Promise<void> {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('CASH_OR_CUT_ACCESS_TOKEN');
    },

   
};

export default tokenStorage;
