import { APIRoute } from "astro";
import UserManager from "../../model/usermanager";
import { isAuthorized } from "../../model/utils";

export const get: APIRoute = async ({ request }) => {
    const authorized = isAuthorized(request);
    if (!authorized) return { status: 401, body: "Unauthorized" };

    UserManager.keepClientAlive(authorized as string);

    return new Response(JSON.stringify({}), {
        status: 200
    });
}

