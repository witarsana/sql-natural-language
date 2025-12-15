import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple CORS handler
function setCORS(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://chloe-sigma.vercel.app',
    'http://localhost:4200'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
}

export default async (req: VercelRequest, res: VercelResponse) => {
  setCORS(req, res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return example queries
  const examples = [
    {
      category: "Plot Availability",
      queries: [
        "Show me all available plots in section A",
        "How many empty plots are in section B?",
        "List all family plots that are available",
      ],
    },
    {
      category: "Occupancy",
      queries: [
        "Which plots are currently occupied?",
        "Show me all graves in section C",
        "List all deceased persons buried in 2024",
      ],
    },
    {
      category: "Reservations",
      queries: [
        "Show me all pending plot reservations",
        "Which plots are reserved for the Smith family?",
      ],
    },
  ];

  return res.status(200).json({
    success: true,
    examples,
  });
};
