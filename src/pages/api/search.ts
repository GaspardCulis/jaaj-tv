import { APIRoute } from "astro"

export const post: APIRoute = async ({ request }) => {
    const query = (await request.json());
    console.log(query);
    return new Response(JSON.stringify({
        message: "Your name was: " + "mamam"
      }), {
        status: 200
      })
}