import { APIRoute } from "astro"
import { userExists, consumeInviteCode, createUser } from '../../model/database';
import { addCookie } from "../../model/utils";

export const post: APIRoute = async ({ request }) => {
    const text = await request.text();
    const invite_code = new URLSearchParams(text).get("code");
    const username = new URLSearchParams(text).get("username");
    const password = new URLSearchParams(text).get("password");
    const password_confirm = new URLSearchParams(text).get("password_confirm");

    const headers = new Headers();
    let error = "";
    if (userExists(username)) {
        error = "Username already exists";
    } else if (password !== password_confirm) {
        error = "Passwords do not match";
    } else if (password.length < 8) {
        error = "Password length must exceed 8 characters";
    } else if (!consumeInviteCode(invite_code)) {
        error = "Invalid invite code";
    }

    if (error) {
        headers.append("Location", `../register?error=${error}`);
    } else {
        createUser(username, password);
        headers.append("Location", `../login`);
    }

    return new Response("", {
        status: 302,
        headers,
    });
};