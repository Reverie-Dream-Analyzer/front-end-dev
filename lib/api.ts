export async function api<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}${url}`, //API KEY HERE
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      credentials: "include", // Flask needs this if using cookies or sessions
    }
  );

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg || "API Error");
  }

  return response.json() as Promise<T>;
}
