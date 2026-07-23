import prisma from "@/lib/prisma";
import {
  DEFAULT_FOOTER_MENU,
  DEFAULT_HEADER_MENU,
  DEFAULT_SITE_CHROME_CONFIG,
  decorateSiteMenuItem,
  type SiteChromeConfig,
  type SiteMenuItem,
  type SiteMenuLocation,
} from "@/lib/siteChromeShared";

export const SITE_CHROME_SETTING_KEYS = {
  headerLogoUrl: "header_logo_url",
  headerLogoAlt: "header_logo_alt",
  headerCompanyName: "header_company_name",
  footerBrandName: "footer_brand_name",
  footerDescription: "footer_description",
  footerAddress: "footer_address",
  footerPhone: "footer_phone",
  footerEmail: "footer_email",
  footerFacebook: "footer_facebook",
  footerInstagram: "footer_instagram",
  footerTwitter: "footer_twitter",
  footerCopyright: "footer_copyright",
} as const;

const ALL_SETTING_KEYS = Object.values(SITE_CHROME_SETTING_KEYS);

function formatMenuItem(item: {
  id: number;
  label: string;
  url: string;
  menuOrder: number;
  location: string;
}): SiteMenuItem {
  return decorateSiteMenuItem({
    id: item.id,
    label: item.label,
    url: item.url,
    order: item.menuOrder,
    location: item.location as SiteMenuLocation,
  });
}

export async function getSiteChromeConfig(): Promise<SiteChromeConfig> {
  const [menuRows, settingRows] = await Promise.all([
    prisma.navigationMenu.findMany({
      where: { location: { in: ["header", "footer"] } },
      orderBy: [{ location: "asc" }, { menuOrder: "asc" }, { id: "asc" }],
    }),
    prisma.siteSetting.findMany({
      where: { settingKey: { in: ALL_SETTING_KEYS } },
    }),
  ]);

  const settings = settingRows.reduce<Record<string, string>>((result, item) => {
    if (item.settingValue !== null) result[item.settingKey] = item.settingValue;
    return result;
  }, {});

  const headerMenu = menuRows.filter((item) => item.location === "header").map(formatMenuItem);
  const footerMenu = menuRows.filter((item) => item.location === "footer").map(formatMenuItem);

  return {
    header: {
      logoUrl: settings[SITE_CHROME_SETTING_KEYS.headerLogoUrl] || DEFAULT_SITE_CHROME_CONFIG.header.logoUrl,
      logoAlt: settings[SITE_CHROME_SETTING_KEYS.headerLogoAlt] || DEFAULT_SITE_CHROME_CONFIG.header.logoAlt,
      companyName: settings[SITE_CHROME_SETTING_KEYS.headerCompanyName] || DEFAULT_SITE_CHROME_CONFIG.header.companyName,
      menu: headerMenu.length > 0 ? headerMenu : DEFAULT_HEADER_MENU,
    },
    footer: {
      brandName: settings[SITE_CHROME_SETTING_KEYS.footerBrandName] || DEFAULT_SITE_CHROME_CONFIG.footer.brandName,
      description: settings[SITE_CHROME_SETTING_KEYS.footerDescription] || DEFAULT_SITE_CHROME_CONFIG.footer.description,
      address: settings[SITE_CHROME_SETTING_KEYS.footerAddress] ?? DEFAULT_SITE_CHROME_CONFIG.footer.address,
      phone: settings[SITE_CHROME_SETTING_KEYS.footerPhone] ?? DEFAULT_SITE_CHROME_CONFIG.footer.phone,
      email: settings[SITE_CHROME_SETTING_KEYS.footerEmail] ?? DEFAULT_SITE_CHROME_CONFIG.footer.email,
      facebook: settings[SITE_CHROME_SETTING_KEYS.footerFacebook] ?? DEFAULT_SITE_CHROME_CONFIG.footer.facebook,
      instagram: settings[SITE_CHROME_SETTING_KEYS.footerInstagram] ?? DEFAULT_SITE_CHROME_CONFIG.footer.instagram,
      twitter: settings[SITE_CHROME_SETTING_KEYS.footerTwitter] ?? DEFAULT_SITE_CHROME_CONFIG.footer.twitter,
      copyright: settings[SITE_CHROME_SETTING_KEYS.footerCopyright] || DEFAULT_SITE_CHROME_CONFIG.footer.copyright,
      menu: footerMenu.length > 0 ? footerMenu : DEFAULT_FOOTER_MENU,
    },
  };
}

export async function ensureSiteChromeDefaults() {
  const [headerCount, footerCount] = await Promise.all([
    prisma.navigationMenu.count({ where: { location: "header" } }),
    prisma.navigationMenu.count({ where: { location: "footer" } }),
  ]);

  const menuCreates = [];
  if (headerCount === 0) {
    menuCreates.push(
      prisma.navigationMenu.createMany({
        data: DEFAULT_HEADER_MENU.map((item) => ({
          label: item.label,
          url: item.url,
          menuOrder: item.order,
          location: item.location,
        })),
      }),
    );
  }
  if (footerCount === 0) {
    menuCreates.push(
      prisma.navigationMenu.createMany({
        data: DEFAULT_FOOTER_MENU.map((item) => ({
          label: item.label,
          url: item.url,
          menuOrder: item.order,
          location: item.location,
        })),
      }),
    );
  }

  const defaultSettings: Record<string, string> = {
    [SITE_CHROME_SETTING_KEYS.headerLogoUrl]: DEFAULT_SITE_CHROME_CONFIG.header.logoUrl,
    [SITE_CHROME_SETTING_KEYS.headerLogoAlt]: DEFAULT_SITE_CHROME_CONFIG.header.logoAlt,
    [SITE_CHROME_SETTING_KEYS.headerCompanyName]: DEFAULT_SITE_CHROME_CONFIG.header.companyName,
    [SITE_CHROME_SETTING_KEYS.footerBrandName]: DEFAULT_SITE_CHROME_CONFIG.footer.brandName,
    [SITE_CHROME_SETTING_KEYS.footerDescription]: DEFAULT_SITE_CHROME_CONFIG.footer.description,
    [SITE_CHROME_SETTING_KEYS.footerAddress]: DEFAULT_SITE_CHROME_CONFIG.footer.address,
    [SITE_CHROME_SETTING_KEYS.footerPhone]: DEFAULT_SITE_CHROME_CONFIG.footer.phone,
    [SITE_CHROME_SETTING_KEYS.footerEmail]: DEFAULT_SITE_CHROME_CONFIG.footer.email,
    [SITE_CHROME_SETTING_KEYS.footerFacebook]: DEFAULT_SITE_CHROME_CONFIG.footer.facebook,
    [SITE_CHROME_SETTING_KEYS.footerInstagram]: DEFAULT_SITE_CHROME_CONFIG.footer.instagram,
    [SITE_CHROME_SETTING_KEYS.footerTwitter]: DEFAULT_SITE_CHROME_CONFIG.footer.twitter,
    [SITE_CHROME_SETTING_KEYS.footerCopyright]: DEFAULT_SITE_CHROME_CONFIG.footer.copyright,
  };

  await Promise.all([
    ...menuCreates,
    ...Object.entries(defaultSettings).map(([settingKey, settingValue]) =>
      prisma.siteSetting.upsert({
        where: { settingKey },
        update: {},
        create: { settingKey, settingValue },
      }),
    ),
  ]);
}

export async function saveSiteChromeSettings(values: Record<string, string>) {
  await prisma.$transaction(
    Object.entries(values).map(([settingKey, settingValue]) =>
      prisma.siteSetting.upsert({
        where: { settingKey },
        update: { settingValue },
        create: { settingKey, settingValue },
      }),
    ),
  );
}

