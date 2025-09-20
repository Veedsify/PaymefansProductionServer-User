import Cloudflare from "cloudflare";

const expiresIn = 60 * 30;

const {
  NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID,
  NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_TOKEN,
} = process.env;

const client = new Cloudflare({
  apiToken: NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_TOKEN,
});

export const GenerateStreamToken = async (mediaId: string): Promise<string> => {
  const videoExp = Math.floor(Date.now() / 1000) + expiresIn;
  const res = await client.stream.token.create(mediaId, {
    account_id: NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID!,
    exp: videoExp,
  });
  return res?.token ?? "";
};
