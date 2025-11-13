import url from "./publicUrl.ts";

export default function generateUrl(path: string) {
    return `${url}${path}`;
}
