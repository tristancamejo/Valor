import type { GetHenrikAPI } from "../types/types";

const HenrikAPIRoot = "https://api.henrikdev.xyz";

export async function fetchData<type>(url: string) {
  return fetch(`${HenrikAPIRoot}${url}`)
    .then((res) => res.json() as Promise<GetHenrikAPI<type>>)
    .catch((err) => {
      throw err;
    });
}
