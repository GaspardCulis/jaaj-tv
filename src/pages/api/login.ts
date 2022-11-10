import { APIRoute } from "astro"
import { isLoginValid, createAuthToken } from '../../model/database';
import { addCookie } from "../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const text = await request.text();
	const username = new URLSearchParams(text).get("username");
	const password = new URLSearchParams(text).get("password");

    const headers = new Headers();
	if (isLoginValid(username, password)) {
		let { token, maxAge } = createAuthToken(username);
		addCookie(headers, {
			name: "token",
			value: token,
			maxAge: maxAge,
			secure: false, // TODO: change to true
			path: "/",
		});
		headers.append("Location", "/app/search");
	} else {
		headers.append("location", "../login?error=Invalid username or password");
	}

    return new Response("", {
        status: 302,
        headers,
    });
}
