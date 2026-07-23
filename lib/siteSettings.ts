import prisma from "@/lib/prisma";

export async function isSitePageInactive(settingKey: string) {
  const setting = await prisma.siteSetting.findUnique({
    where: { settingKey },
    select: { settingValue: true },
  });

  return setting?.settingValue === "inactive";
}
