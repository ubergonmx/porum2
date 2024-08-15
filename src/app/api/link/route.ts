import { env } from "@/env";
import {
  APIError,
  apiErrorStringify,
  unknownErrorStringify,
} from "@/lib/error";
import { getIP } from "@/lib/ratelimit";
import axios from "axios";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  try {
    const href = searchParams.get("url");
    if (!href) {
      throw new APIError("InvalidURLError", "Invalid URL", 400, {
        userMessage: "Invalid href",
        details: `IP: ${getIP()}`,
      });
    }

    const res = await axios.get(href);

    // Parse the HTML using regular expressions
    const titleMatch = res.data.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : "";

    const descriptionMatch = res.data.match(
      /<meta name="description" content="(.*?)"/,
    );
    const description = descriptionMatch ? descriptionMatch[1] : "";

    const imageMatch = res.data.match(
      /<meta property="og:image" content="(.*?)"/,
    );
    const imageUrl = imageMatch ? imageMatch[1] : "";

    // Return the data in the format required by the editor tool
    return new Response(
      JSON.stringify({
        success: 1,
        meta: {
          title,
          description,
          image: {
            url: imageUrl,
          },
        },
      }),
    );
  } catch (error: any) {
    let errorMessage = "An error occurred while fetching the URL metadata";
    let status = 500;

    if (error instanceof APIError) {
      console.error(`[GET_LINK] ${error.name}: ${error.userMessage}`);
      if (env.DEBUG_MODE) console.error(apiErrorStringify(error));
      errorMessage = error.userMessage ?? errorMessage;
      status = error.status;
    } else {
      console.error(`[GET_LINK] ${error.name}: ${error.message}`);
      if (env.DEBUG_MODE) console.error(unknownErrorStringify(error));
    }

    return new Response(errorMessage, { status });
  }
}
