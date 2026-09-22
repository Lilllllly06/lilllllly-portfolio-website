import type { IncomingMessage, ServerResponse } from "node:http";
import { handleChat } from "../server/chat.js";

export default function chat(req: IncomingMessage, res: ServerResponse) {
  return handleChat(req, res, process.env);
}
