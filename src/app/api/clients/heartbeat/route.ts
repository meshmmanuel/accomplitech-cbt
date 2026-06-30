import { POST as pingPOST } from "@/app/api/clients/ping/route";

/**
 * Legacy alias kept for backward compatibility.
 * New clients should use POST /api/clients/ping.
 */
export const POST = pingPOST;
