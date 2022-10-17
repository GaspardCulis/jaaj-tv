import { APIRoute } from "astro"

export const post: APIRoute = async ({ request }) => {
  console.log(await request.text());
  return {
    body: JSON.stringify({
      message: "This was a POST!"
    })
  }
} 