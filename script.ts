import { prisma } from "#app/utils/db.server.ts";

console.log(await prisma.story.findMany())