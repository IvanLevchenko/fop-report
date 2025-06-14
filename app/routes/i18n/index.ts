import { ActionFunction, ActionFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";

export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  const json = await request.json();

  if (!json.language) {
    return;
  }

  const session = await prisma.session.findFirst();

  if (session) {
    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        localization: json.language,
      },
    });
  }

  return {};
};
