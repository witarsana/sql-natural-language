import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Get the outgoing IP by checking what IP external services see
  try {
    const ipCheckServices = [
      'https://api.ipify.org?format=json',
      'https://api.my-ip.io/ip.json',
      'https://checkip.amazonaws.com',
    ];

    const results = [];

    for (const service of ipCheckServices) {
      try {
        const response = await fetch(service);
        const data = await response.text();
        results.push({
          service,
          ip: data,
        });
      } catch (error) {
        results.push({
          service,
          error: error instanceof Error ? error.message : 'Failed',
        });
      }
    }

    return res.status(200).json({
      message: 'Vercel Serverless Function IP Information',
      note: 'These IPs may change with each request (serverless uses dynamic IPs)',
      results,
      headers: {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'x-vercel-ip-country': req.headers['x-vercel-ip-country'],
        'x-vercel-ip-city': req.headers['x-vercel-ip-city'],
      },
      recommendation: 'For serverless, you typically need to whitelist IP ranges or allow all IPs'
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
